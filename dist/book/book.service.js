"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const sync_gateway_1 = require("../sync/sync.gateway");
let BookService = class BookService {
    syncGateway;
    prisma = new client_1.PrismaClient();
    constructor(syncGateway) {
        this.syncGateway = syncGateway;
    }
    books = [];
    bookCopies = [];
    async createBook(new_book_info) {
        const { status, ...book_info } = new_book_info;
        const book = await this.prisma.book.create({
            data: book_info,
        });
        for (let i = 0; i < book.total_count; i++) {
            await this.prisma.bookCopy.create({
                data: {
                    book_id: book.book_id,
                    status: status ?? 'AVAILABLE',
                },
            });
        }
        this.syncGateway.sendBookCreate(book);
        return book;
    }
    async createBookCopy(book) {
        for (let i = 0; i < book.total_count; i++) {
            await this.prisma.bookCopy.create({
                data: {
                    book_id: book.book_id,
                },
            });
        }
    }
    async findAll(page, limit, title, isbn, author) {
        const skip = (page - 1) * limit;
        const where = {
            ...(title && { title: { contains: title } }),
            ...(isbn && { isbn: { contains: isbn } }),
            ...(author && { author: { contains: author } }),
        };
        const [books, total] = await Promise.all([
            this.prisma.book.findMany({
                where,
                skip,
                take: limit,
                include: {
                    copies: {
                        orderBy: { book_copy_id: 'asc' },
                        select: {
                            status: true,
                        },
                    },
                },
            }),
            this.prisma.book.count({ where }),
        ]);
        const data = books.map((book) => ({
            book_id: book.book_id,
            title: book.title,
            isbn: book.isbn,
            author: book.author,
            publisher: book.publisher,
            total_count: book.total_count,
            category: book.category,
            location: book.location,
            get_date: book.get_date?.toISOString().split('T')[0] ?? null,
            status: book.copies[0]?.status ?? null,
        }));
        return data;
    }
    async findOne(book_id) {
        const book = await this.prisma.book.findUnique({
            where: { book_id },
            include: {
                copies: {
                    select: {
                        status: true,
                    },
                },
            },
        });
        if (!book) {
            throw new common_1.NotFoundException('Book not found');
        }
        return {
            book_id: book.book_id,
            title: book.title,
            isbn: book.isbn,
            author: book.author,
            publisher: book.publisher,
            total_count: book.total_count,
            category: book.category,
            location: book.location,
            get_date: book.get_date?.toISOString().split('T')[0] ?? null,
            status: book.copies[0]?.status ?? null,
        };
    }
    findBookCopy(book_copy_id) {
        return this.prisma.bookCopy.findUnique({
            where: { book_copy_id },
        });
    }
    async updateBook(book_id, dto) {
        const { status, ...bookData } = dto;
        const updatedBook = await this.prisma.$transaction(async (tx) => {
            const book = await tx.book.update({
                where: { book_id },
                data: bookData,
            });
            const copy = await tx.bookCopy.findFirst({
                where: { book_id },
                orderBy: { book_copy_id: 'asc' },
            });
            if (!copy) {
                throw new common_1.NotFoundException('BookCopy not found');
            }
            if (status !== undefined) {
                const allowed = [
                    'AVAILABLE',
                    'BORROWED',
                    'DAMAGED',
                    'RESTRICTED',
                    'LOST',
                ];
                if (!allowed.includes(status)) {
                    throw new common_1.BadRequestException('Invalid status');
                }
                const activeLoan = await tx.loan.findFirst({
                    where: {
                        book_copy_id: copy.book_copy_id,
                        returned_at: null,
                    },
                    orderBy: { borrowed_at: 'desc' },
                });
                if (status === 'BORROWED') {
                    if (copy.status !== 'AVAILABLE' || activeLoan) {
                        throw new common_1.BadRequestException('Book is not available');
                    }
                    const now = new Date();
                    const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
                    const dueAt = new Date(Date.UTC(kst.getUTCFullYear(), kst.getUTCMonth(), kst.getUTCDate() + 4, 0, 0, 0, 0) - 9 * 60 * 60 * 1000);
                    await tx.loan.create({
                        data: {
                            user_id: 0,
                            book_copy_id: copy.book_copy_id,
                            due_at: dueAt,
                        },
                    });
                }
                if (status === 'AVAILABLE' && activeLoan) {
                    await tx.loan.update({
                        where: { loan_id: activeLoan.loan_id },
                        data: { returned_at: new Date() },
                    });
                }
                if (['DAMAGED', 'RESTRICTED', 'LOST'].includes(status) &&
                    activeLoan) {
                    throw new common_1.BadRequestException('Cannot change status while book is borrowed');
                }
                await tx.bookCopy.update({
                    where: { book_copy_id: copy.book_copy_id },
                    data: { status },
                });
            }
            return {
                ...book,
                get_date: book.get_date?.toISOString().split('T')[0] ?? null,
                status: status !== undefined ? status : copy.status,
            };
        });
        this.syncGateway.sendBookUpdate(updatedBook);
        return updatedBook;
    }
    async updateBookCopy(book_copy_id, new_book_copy_info) {
        return this.prisma.bookCopy.update({
            where: { book_copy_id: book_copy_id },
            data: new_book_copy_info,
        });
    }
    async removeBook(book_id) {
        await this.prisma.bookCopy.deleteMany({
            where: { book_id },
        });
        const deletedBook = await this.prisma.book.delete({
            where: { book_id },
        });
        this.syncGateway.sendBookDelete(book_id);
        return deletedBook;
    }
    async removeBookCopy(book_copy_id) {
        const bookCopy = await this.prisma.bookCopy.findUnique({
            where: { book_copy_id },
        });
        if (!bookCopy) {
            throw new Error('BookCopy not found');
        }
        const deletedBookCopy = await this.prisma.bookCopy.delete({
            where: { book_copy_id },
        });
        const updatedBook = await this.prisma.book.update({
            where: { book_id: bookCopy.book_id },
            data: {
                total_count: {
                    decrement: 1,
                },
            },
        });
        if (updatedBook.total_count === 0) {
            await this.prisma.book.delete({
                where: { book_id: bookCopy.book_id },
            });
        }
        return deletedBookCopy;
    }
};
exports.BookService = BookService;
exports.BookService = BookService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [sync_gateway_1.SyncGateway])
], BookService);
