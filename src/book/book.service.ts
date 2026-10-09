 import { Injectable } from '@nestjs/common';
 import { Book, Status, BookCopy } from './book';
 import { CreateBookDto} from './create_book_dto';
 import { PrismaClient } from '@prisma/client';
 import { SyncGateway } from '../sync/sync.gateway';
 import { UpdateBookDto, UpdateBookCopyDto} from './update_book_dto';

 @Injectable()
 export class BookService {
	private prisma = new PrismaClient();
  constructor(
    private readonly syncGateway: SyncGateway,
  ) {}
	private books : Book[] = [];
	private bookCopies: BookCopy[] = [];

	async createBook(new_book_info: CreateBookDto) {
  	const book = await this.prisma.book.create({
    data: new_book_info,
  	});

	  await this.createBookCopy(book);
	  
    this.syncGateway.sendBookSync(book);
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
	
	async findAll(page: number, limit: number) {
  const skip = (page - 1) * limit;

  const [books, total] = await Promise.all([
    this.prisma.book.findMany({
      skip,
      take: limit,
      orderBy: { book_id: 'asc' },
    }),
    this.prisma.book.count(),
  ]);

  return {
    data: books,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
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
  const book = await this.prisma.book.update({
    where: { book_id: book_id },
    data: new_book_info,
  });

  this.syncGateway.sendBookSync(book);
  return book;
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

  const deletedBook = await this.prisma.book.delete({
    where: { book_id },
  });

  this.syncGateway.sendBookDelete(book_id);

  return deletedBook;
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
 
