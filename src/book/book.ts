export interface Book {
  book_id: number;
  isbn: string | null;
  title: string;
  author: string | null;
  publisher: string | null;
  total_count: number;
  category: string | null;
  location: string | null;
  get_date: string | null;
}

export interface BookCopy {
  book_copy_id: number;
  book_id: number;
  status: Status;
}

export interface BookListItem extends Book {
  status: Status | Status[] | null;
}

export interface BookDetail extends Book {
  copies: BookCopy[];
}

export enum Status {
	AVAILABLE = 0,
	BORROWED = 1,
  DAMAGED = 2,
  LOST = 3,
  RESTRICTED = 4
}
