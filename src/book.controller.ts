import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Param,
    Body
} from '@nestjs/common';

import { BookService } from './book.service';
import { Book, BookCopy } from './book';
import { CreateBookDto} from './create_book_dto';
import { UpdateBookDto} from './update_book_dto';



@Controller('api/books')
export class BookController {
    constructor(private readonly bookService: BookService) {}

    @Post()
    createBook(@Body() new_book_info: CreateBookDto) {
    return this.bookService.createBook(new_book_info);
    }

    @Get()
    findAll() {
        return this.bookService.findAll();
    }

    @Get(':param_id')
    findOne(@Param('param_id') param_id: string) {
        return this.bookService.findOne(Number(param_id));
    }


    @Patch(':param_id')
    updateBook(
    @Param('param_id') param_id: string,
    @Body() new_book_info: UpdateBookDto,
    ) {
    return this.bookService.updateBook(Number(param_id), new_book_info);
    }

   
   @Delete(':param_id')
   removeBook(@Param('param_id') param_id: string) {
    return this.bookService.removeBook(Number(param_id));
  }

}
