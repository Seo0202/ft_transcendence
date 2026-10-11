"use strict";

const fs = require("fs");
const { PrismaClient } = require("@prisma/client");
const XLSX = require("xlsx");

const prisma = new PrismaClient();

async function main() {
  const csv = fs.readFileSync("./prisma/dummy.csv", "utf8");
  const workbook = XLSX.read(csv, { type: "string", raw: true });

  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { raw: false });

  const books = rows.map((row) => ({
    isbn: String(row["ISBN 번호"] ?? "").trim(),
    title: String(row["도서명"] ?? "").trim(),
    total_count: Number(row["수량"]) || 1,
    author: String(row["저자"] ?? "").trim(),
    publisher: String(row["출판사"] ?? "").trim(),
    category: String(row["세부분야"] ?? "").split(">")[1]?.trim() ?? "",
    location: String(row["도서번호"] ?? "").trim(),
    get_date: row["취득일자"] ? new Date(String(row["취득일자"]).trim().replace(/\.$/, "").replace(/\./g, "-")) : null,
  }));

  await prisma.book.createMany({ data: books });

  const savedBooks = await prisma.book.findMany();
  for (const book of savedBooks) {
    for (let i = 0; i < book.total_count; i++) {
      await prisma.bookCopy.create({
        data: { book_id: book.book_id, status: "AVAILABLE" },
      });
    }
  }

  console.log(`${books.length}종의 책 저장 완료`);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });