export class UpdateBookDto {
  isbn?: string;
  title?: string;
  total_count?: number;
  author?: string;
  publisher?: string;
}

export class UpdateBookCopyDto {
  cover?: string;
  status?: string;
}