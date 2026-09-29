 import { Injectable } from '@nestjs/common';
 import { Book, Status, BookCopy } from './book';
 import { CreateBookDto} from './create_book_dto';
 import { PrismaClient } from '@prisma/client';
 import { UpdateBookDto} from './update_book_dto';

 @Injectable()
 export class BookService {
	private prisma = new PrismaClient();
	private books : Book[] = [];
	private bookCopies: BookCopy[] = [];

	async createBook(new_book_info: CreateBookDto) {
  	const book = await this.prisma.book.create({
    data: new_book_info,
  	});

	  await this.createBookCopy(book);
	  
	  return book;
	  
	}

	async createBookCopy(book: Book) {
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

	findOne(book_id: number) {
  	return this.prisma.book.findUnique({
    where: { book_id },
    include: {
      copies: true,
    },
  	});
	}
	
	async updateBook(book_id: number, new_book_info: UpdateBookDto) {
  	return this.prisma.book.update({
    where: { book_id: book_id },
    data: new_book_info,
 	 });
	}

	async removeBook(book_id: number) {
 	await this.prisma.bookCopy.deleteMany({
    where: { book_id },
  	});
  	return this.prisma.book.delete({
    where: { book_id },
  	});
	}
	
 }
