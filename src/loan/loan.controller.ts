import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  BadRequestException,
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

  @Get()
  findAll(
  @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
  @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
  if (page < 1 || limit < 1 || limit > 100) {
    throw new BadRequestException('Invalid pagination');
  }

  return this.loanService.findAll(page, limit);
  }

  @Patch(':loan_id/return')
    returnLoan(@Param('loan_id') loan_id: string) {
  return this.loanService.returnLoan(Number(loan_id));
}
}