import {
  IsOptional,
  IsString,
  IsInt,
  IsDateString,
  Min,
} from 'class-validator';

export class UpdateBookDto {
  @IsOptional()
  @IsString()
  isbn?: string;

  @IsOptional()
  @IsString()
  title!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  total_count?: number;

  @IsOptional()
  @IsString()
  author?: string;

  @IsOptional()
  @IsString()
  publisher?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsDateString()
  get_date?: string;

  @IsOptional()
  @IsDateString()
  status?: string;
}

export class UpdateBookCopyDto {
  cover?: string;
  status?: string;
}