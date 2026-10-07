 import { Injectable } from '@nestjs/common';
 import { Book, Status, BookCopy } from './book';
 import { CreateBookDto} from './create_book_dto';
 import { PrismaClient } from '@prisma/client';
 import { UpdateBookDto, UpdateBookCopyDto} from './update_book_dto';


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
	
	findBookCopy(book_copy_id: number) {
    return this.prisma.bookCopy.findUnique({
        where: { book_copy_id },
    });
	}

	async updateBook(book_id: number, new_book_info: UpdateBookDto) {
  	return this.prisma.book.update({
    where: { book_id: book_id },
    data: new_book_info,
 	 });
	}

	async updateBookCopy(book_copy_id: number, new_book_copy_info: UpdateBookCopyDto) {
  	return this.prisma.bookCopy.update({
    where: { book_copy_id: book_copy_id },
    data: new_book_copy_info,
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

  async removeBookCopy(book_copy_id: number) {
    const bookCopy = await this.prisma.bookCopy.findUnique({
        where: { book_copy_id },
    });

    if (!bookCopy) {
        throw new Error('BookCopy not found');
    }

    const deletedBookCopy = await this.prisma.bookCopy.delete({
        where: { book_copy_id },
    });

    const updatedBook = await this.prisma.book.update({
        where: { book_id: bookCopy.book_id },
        data: {
            total_count: {
                decrement: 1,
            },
        },
    });

    if (updatedBook.total_count === 0) {
        await this.prisma.book.delete({
            where: { book_id: bookCopy.book_id },
        });
    }

    return deletedBookCopy;
}
	
}
 
