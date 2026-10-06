import { Module } from '@nestjs/common';
import { BookController, BookCopyController } from './book.controller';
import { BookService } from './book.service';

@Module({
    controllers: [BookController, BookCopyController],
    providers: [BookService],
})
export class AppModule {}
