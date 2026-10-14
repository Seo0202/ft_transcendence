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
        const now = new Date();
        const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
        const dueAt = new Date(Date.UTC(kst.getUTCFullYear(), kst.getUTCMonth(), kst.getUTCDate() + 4, 0, 0, 0, 0) - 9 * 60 * 60 * 1000);
        return this.prisma.$transaction(async (tx) => {
            const loan = await tx.loan.create({
                data: {
                    user_id,
                    book_copy_id,
                    due_at: dueAt,
                },
            });
            await tx.bookCopy.update({
                where: { book_copy_id },
                data: { status: 'BORROWED' },
            });
            return loan;
        });
    }
    async findLoan(loan_id) {
        return this.prisma.loan.findUnique({
            where: { loan_id },
        });
    }
    async returnLoan(loan_id) {
        return this.prisma.$transaction(async (tx) => {
            const loan = await tx.loan.update({
                where: { loan_id },
                data: {
                    returned_at: new Date(),
                },
            });
            await tx.bookCopy.update({
                where: { book_copy_id: loan.book_copy_id },
                data: {
                    status: 'AVAILABLE',
                },
            });
            return loan;
        });
    }
    async findAll(page, limit) {
        const skip = (page - 1) * limit;
        const [loans, total] = await Promise.all([
            this.prisma.loan.findMany({
                skip,
                take: limit,
                orderBy: [
                    { borrowed_at: 'desc' },
                    { loan_id: 'desc' },
                ],
            }),
            this.prisma.loan.count(),
        ]);
        return {
            data: loans,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
};
exports.LoanService = LoanService;
exports.LoanService = LoanService = __decorate([
    (0, common_1.Injectable)()
], LoanService);
