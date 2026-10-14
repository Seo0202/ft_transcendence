
import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class LoanService {
  private prisma = new PrismaClient();

  async createLoan(user_id: number, book_copy_id: number) {
    const bookCopy = await this.prisma.bookCopy.findUnique({
      where: { book_copy_id },
    });

    if (!bookCopy) {
      throw new Error('BookCopy not found');
    }

    if (bookCopy.status !== 'AVAILABLE') {
      throw new Error('BookCopy is not available');
    }

    const now = new Date();
    const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
    const dueAt = new Date(Date.UTC(kst.getUTCFullYear(),
    kst.getUTCMonth(),
    kst.getUTCDate() + 4, 0, 0, 0, 0) - 9 * 60 * 60 * 1000);

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
        status: 'BORROWED',
      },
    });

    return loan;
  }

  async findLoan(loan_id: number) {
    return this.prisma.loan.findUnique({
      where: { loan_id },
      include: {
        book_copy: {
          select: {
            status: true,
          },
        },
      },
    });
  }

  async returnLoan(loan_id: number) {
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
      include: {
        book_copy: {
          select: {
            status: true,
          },
        },
      },
    }),
    this.prisma.loan.count(),
  ]);

  const now = new Date();

  const data = loans.map((loan) => {
    const { book_copy, ...rest } = loan;

    let status: string;

    if (loan.returned_at) {
      status = 'RETURNED';
    } else if (loan.due_at < now) {
      status = 'OVERDUE';
    } else {
      status = 'BORROWED';
    }

    return {
      ...rest,
      status,
    };
  });

  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}
}
