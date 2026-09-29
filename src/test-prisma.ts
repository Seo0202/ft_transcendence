import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const book = await prisma.book.create({
    data: {
      title: 'Clean Code',
    },
  });

  console.log(book);

  const books = await prisma.book.findMany();

  console.log(books);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
