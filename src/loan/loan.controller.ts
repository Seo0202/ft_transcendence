import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
} from '@nestjs/common';
import { LoanService } from './loan.service';

@Controller('api/loans')
export class LoanController {
  constructor(private readonly loanService: LoanService) {}

  @Post()
  createLoan(
    @Body() body: { user_id: number; book_copy_id: number },
  ) {
    return this.loanService.createLoan(
      body.user_id,
      body.book_copy_id,
    );
  }

  @Get(':loan_id')
  findLoan(@Param('loan_id') loan_id: string) {
    return this.loanService.findLoan(Number(loan_id));
  }

  @Patch(':loan_id/return')
    returnLoan(@Param('loan_id') loan_id: string) {
  return this.loanService.returnLoan(Number(loan_id));
}
}