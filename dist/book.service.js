"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
let BookService = class BookService {
    prisma = new client_1.PrismaClient();
    books = [];
    bookCopies = [];
    async createBook(new_book_info) {
        const book = await this.prisma.book.create({
            data: new_book_info,
        });
        await this.createBookCopy(book);
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
        return this.prisma.book.update({
            where: { book_id: book_id },
            data: new_book_info,
        });
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
        return this.prisma.book.delete({
            where: { book_id },
        });
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
        await this.prisma.book.update({
            where: { book_id: bookCopy.book_id },
            data: {
                total_count: {
                    decrement: 1,
                },
            },
        });
        return deletedBookCopy;
    }
};
exports.BookService = BookService;
exports.BookService = BookService = __decorate([
    (0, common_1.Injectable)()
], BookService);
