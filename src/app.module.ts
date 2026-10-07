import { Module } from '@nestjs/common';
import { BookController, BookCopyController } from './book/book.controller';
import { BookService } from './book/book.service';
import { LoanModule } from './loan/loan.module';

@Module({
    imports: [LoanModule],
    controllers: [BookController, BookCopyController],
    providers: [BookService],
})
export class AppModule {}
