 import { Book, Status, BookCopy } from './book';

 export class BookService {
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
		return this.books;
	}

	findOne(param_id: number) {
    const book = this.books.find(
        list => list.book_id === param_id
    );

    const bookCopies = this.bookCopies.filter(
        bookCopy => bookCopy.book_id === param_id
    );

    return {
        ...book,
        bookCopies: bookCopies
    };	
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
