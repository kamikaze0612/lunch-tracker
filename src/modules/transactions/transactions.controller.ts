import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  UsePipes,
  Query,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import {
  CreateTransactionDto,
  CreateQuickSplitDto,
  SettleBalancesDto,
  CreateTransactionSchema,
  CreateQuickSplitSchema,
  SettleBalancesSchema,
} from '@/common/dto/transaction.dto';
import { ZodValidationPipe } from '@/common/pipes/zod-validation.pipe';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(CreateTransactionSchema))
  create(@Body() createTransactionDto: CreateTransactionDto) {
    return this.transactionsService.createTransaction(createTransactionDto);
  }

  @Post('quick-split')
  @UsePipes(new ZodValidationPipe(CreateQuickSplitSchema))
  createQuickSplit(@Body() createQuickSplitDto: CreateQuickSplitDto) {
    return this.transactionsService.createQuickSplit(createQuickSplitDto);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.transactionsService.getTransactionById(id);
  }

  @Get('group/:groupId')
  getGroupTransactions(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const limitNum = limit ? parseInt(limit) : 50;
    const offsetNum = offset ? parseInt(offset) : 0;
    return this.transactionsService.getGroupTransactions(
      groupId,
      limitNum,
      offsetNum,
    );
  }

  @Get('group/:groupId/balance-sheet')
  getGroupBalanceSheet(@Param('groupId', ParseIntPipe) groupId: number) {
    return this.transactionsService.getGroupBalanceSheet(groupId);
  }

  @Post('group/:groupId/settle')
  @UsePipes(new ZodValidationPipe(SettleBalancesSchema))
  settleBalances(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Body() settleBalancesDto: SettleBalancesDto,
    @Query('settledBy', ParseIntPipe) settledBy: number,
  ) {
    return this.transactionsService.settleBalances(
      settleBalancesDto,
      settledBy,
    );
  }

  @Get('group/:groupId/settlements')
  getGroupSettlements(@Param('groupId', ParseIntPipe) groupId: number) {
    return this.transactionsService.getGroupSettlements(groupId);
  }
}
