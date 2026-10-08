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
        const book = await this.prisma.book.create({
            data: new_book_info,
        });
        await this.createBookCopy(book);
        this.syncGateway.sendBookSync(book);
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
    findAll() {
        return this.prisma.book.findMany();
    }
    findOne(book_id) {
        return this.prisma.book.findUnique({
            where: { book_id },
            include: {
                copies: true,
            },
        });
    }
    findBookCopy(book_copy_id) {
        return this.prisma.bookCopy.findUnique({
            where: { book_copy_id },
        });
    }
    async updateBook(book_id, new_book_info) {
        const book = await this.prisma.book.update({
            where: { book_id: book_id },
            data: new_book_info,
        });
        this.syncGateway.sendBookSync(book);
        return book;
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
