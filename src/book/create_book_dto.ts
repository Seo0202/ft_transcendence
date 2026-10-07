export class CreateBookDto {
  isbn?: string;
  title!: string;
  total_count?: number;
  author?: string;
  publisher?: string;
}