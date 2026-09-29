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
import { Book, BookList } from './book';



@Controller('api/books')
export class BookController {
    constructor(private readonly bookService: BookService) {}

    @Post()
    createBookInfo(@Body() book_info: BookList) {
    return this.bookService.createBookList(book_info);
    }

    @Get()
    findAll() {
        return this.bookService.findAll();
    }

    @Get(':param_id')
    findOne(@Param('param_id') param_id: string) {
        return this.bookService.findOne(Number(param_id));
    }


   @Post(':param_id/items')
    createBook(
    @Param('param_id') param_id: string,
    @Body() book: Book
    ) {
    return this.bookService.create({
        ...book,
        book_info_id: Number(param_id)
    });
    }

   @Patch(':param_id')
   updateBook(
    @Param('param_id') param_id: string,
    @Body() new_info: Partial<BookList>
   )
   {
    return this.bookService.update(
        Number(param_id),
        new_info
    );
   }

   
   @Delete(':param_id')
   removeBook(@Param('param_id') param_id: string) {
    return this.bookService.remove(Number(param_id));
  }

}
