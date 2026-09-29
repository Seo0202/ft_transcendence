export interface BookList {
	book_info_id: number;
	title : string;
	author : string;
	publisher : string;

}

export interface Book{
	book_id : number;
	book_info_id : number;
	status : Status;
}

export enum Status {
	AVAILABLE = 0,
	BORROWED = 1,
}
