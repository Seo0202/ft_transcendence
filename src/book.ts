export interface Book {
	book_id: number;
	title : string;
	author : string;
	publisher : string;

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
