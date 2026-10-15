import {
  IsOptional,
  IsString,
  IsInt,
  IsDateString,
  Min,
  IsIn,
} from 'class-validator';

export class CreateBookDto {
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
   @IsIn(['AVAILABLE', 'BORROWED', 'DAMAGED', 'RESTRICTED', 'LOST'])
   status?: string;
}