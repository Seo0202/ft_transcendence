import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';

const prisma = new PrismaClient();

async function main() {
  const workbook = XLSX.readFile('./prisma/book.csv');

  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  const rows = XLSX.utils.sheet_to_json(sheet, {
    range: 2,
  });

  const books = rows.map((row: any) => ({
    isbn: String(row['ISBN 번호'] ?? ''),
    title: String(row['도서명'] ?? ''),
    total_count: Number(row['수량']) || 1,
    author: String(row['저자'] ?? ''),
    publisher: String(row['출판사'] ?? ''),
  }));

  await prisma.book.createMany({
    data: books,
  });

  const savedBooks = await prisma.book.findMany();

  for (const book of savedBooks) {
  for (let i = 0; i < book.total_count; i++) {
    await prisma.bookCopy.create({
      data: {
        book_id: book.book_id,
        status: 'AVAILABLE',
      },
    });
  }
}

  console.log(`${books.length}권 저장 완료`);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
