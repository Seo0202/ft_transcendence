"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoanService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
let LoanService = class LoanService {
    prisma = new client_1.PrismaClient();
    async createLoan(user_id, book_copy_id) {
        const bookCopy = await this.prisma.bookCopy.findUnique({
            where: { book_copy_id },
        });
        if (!bookCopy) {
            throw new Error('BookCopy not found');
        }
        if (bookCopy.status !== 'AVAILABLE') {
            throw new Error('BookCopy is not available');
        }
        const dueAt = new Date();
        dueAt.setDate(dueAt.getDate() + 14);
        const loan = await this.prisma.loan.create({
            data: {
                user_id,
                book_copy_id,
                due_at: dueAt,
            },
        });
        await this.prisma.bookCopy.update({
            where: { book_copy_id },
            data: {
                status: 'BORROW',
            },
        });
        return loan;
    }
    async findLoan(loan_id) {
        return this.prisma.loan.findUnique({
            where: { loan_id },
        });
    }
    async returnLoan(loan_id) {
        const loan = await this.prisma.loan.findUnique({
            where: { loan_id },
        });
        if (!loan) {
            throw new Error('Loan not found');
        }
        if (loan.returned_at !== null) {
            throw new Error('Already returned');
        }
        const returnedLoan = await this.prisma.loan.update({
            where: { loan_id },
            data: {
                returned_at: new Date(),
            },
        });
        await this.prisma.bookCopy.update({
            where: { book_copy_id: loan.book_copy_id },
            data: {
                status: 'AVAILABLE',
            },
        });
        return returnedLoan;
    }
};
exports.LoanService = LoanService;
exports.LoanService = LoanService = __decorate([
    (0, common_1.Injectable)()
], LoanService);
