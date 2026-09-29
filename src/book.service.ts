 import { Injectable } from '@nestjs/common';
 import { Book, Status, BookCopy } from './book';
 import { CreateBookDto} from './create_book_dto';
 import { PrismaClient } from '@prisma/client';

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
