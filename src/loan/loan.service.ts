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

  async findLoan(loan_id: number) {
  return this.prisma.loan.findUnique({
    where: { loan_id },
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

}
