 import { Injectable } from '@nestjs/common';
 import { Book, Status, BookCopy } from './book';
 import { PrismaClient } from '@prisma/client';

 @Injectable()
 export class BookService {
	private prisma = new PrismaClient();
	private books : Book[] = [];
	private bookCopies: BookCopy[] = [];

	createBook(book: Book) {
	this.books.push(book);
	return book;
	}

	createBookCopy(bookCopy: BookCopy) {
		this.bookCopies.push(bookCopy);
		return bookCopy;
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
	
	updateBook(
		param_id: number,
		new_book_info: Partial<Book>
	) {	
		const book = this.books.find(
		list => list.book_id === param_id
	);
	
	
	if(!book)
		return undefined;

	Object.assign(book, new_book_info);

	return book;
	}
	
	removeBook(param_id: number) {
    this.books = this.books.filter(
        list => list.book_id !== param_id
    );
	}
 }
