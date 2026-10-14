
import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class LoanService {
  private prisma = new PrismaClient();

  async createLoan(user_id: number, book_copy_id: number) {
  const now = new Date();
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);

  const dueAt = new Date(
    Date.UTC(
      kst.getUTCFullYear(),
      kst.getUTCMonth(),
      kst.getUTCDate() + 4,
      0, 0, 0, 0,
    ) - 9 * 60 * 60 * 1000
  );

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
  async findLoan(loan_id: number) {
    return this.prisma.loan.findUnique({
      where: { loan_id },
    });
  }

 

async returnLoan(loan_id: number) {
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

  async findAll(page: number, limit: number) {
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
}
