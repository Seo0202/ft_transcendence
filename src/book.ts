export interface Book {
  book_id: number;
  isbn: string | null;
  title: string;
  author: string | null;
  publisher: string | null;
  total_count: number;
}

export interface BookCopy{
	book_copy_id : number;
	book_id : number;
	status : Status;
}

export enum Status {
	AVAILABLE = 0,
	BORROWED = 1,
}
