import { Module } from '@nestjs/common';
import { BookController, BookCopyController } from './book/book.controller';
import { BookService } from './book/book.service';
import { LoanModule } from './loan/loan.module';
import { SyncModule } from './sync/sync.module';

@Module({
  imports: [LoanModule, SyncModule],
  controllers: [BookController, BookCopyController],
  providers: [BookService],
})
export class AppModule {}