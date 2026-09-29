 import { Book, Status, BookList } from './book';

 export class BookService {
	private books: Book[] = [];
	private bookLists : BookList[] = [];

	createBookList(bookList: BookList) {
	this.bookLists.push(bookList);
	return bookList;
	}

	create(book: Book) {
		this.books.push(book);
		return book;
	}
	
	findAll() {
		return this.bookLists;
	}

	findOne(param_id: number) {
    const bookInfo = this.bookLists.find(
        list => list.book_info_id === param_id
    );

    const books = this.books.filter(
        book => book.book_info_id === param_id
    );

    return {
        ...bookInfo,
        books: books
    };	
	}
	
	update(
		param_id: number,
		new_info: Partial<BookList>
	) {	
		const bookList = this.bookLists.find(
		list => list.book_info_id === param_id
	);
	
	
	if(!bookList)
		return undefined;

	Object.assign(bookList, new_info);

	return bookList;
	}
	
	remove(param_id: number) {
    this.bookLists = this.bookLists.filter(
        list => list.book_info_id !== param_id
    );
	}
 }
