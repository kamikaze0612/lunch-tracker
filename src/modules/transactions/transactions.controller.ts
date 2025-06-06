import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';

import {
  CreateTransactionDto,
  CreateQuickSplitDto,
  SettleBalancesDto,
  CreateTransactionSchema,
  CreateQuickSplitSchema,
  SettleBalancesSchema,
} from '@/common/dto/transaction.dto';
import { ZodValidationPipe } from '@/pipes/zod-validation.pipe';

import { TransactionsService } from './transactions.service';

@ApiTags('transactions')
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new transaction' })
  @ApiBody({
    description: 'Transaction creation data',
    schema: {
      type: 'object',
      properties: {
        groupId: { type: 'number', example: 1, description: 'ID of the group' },
        paidBy: {
          type: 'number',
          example: 1,
          description: 'User ID who paid for the transaction',
        },
        totalAmount: {
          type: 'string',
          pattern: '^\\d+(\\.\\d{1,2})?$',
          example: '25.50',
          description: 'Total amount as decimal string',
        },
        description: {
          type: 'string',
          nullable: true,
          example: 'Pizza lunch for the team',
        },
        transactionDate: {
          type: 'string',
          pattern: '^\\d{4}-\\d{2}-\\d{2}$',
          example: '2024-01-15',
          description: 'Transaction date in YYYY-MM-DD format',
        },
        participants: {
          type: 'array',
          minItems: 1,
          items: {
            type: 'object',
            properties: {
              userId: { type: 'number', example: 2 },
              shareAmount: {
                type: 'string',
                pattern: '^\\d+(\\.\\d{1,2})?$',
                example: '8.50',
              },
            },
            required: ['userId', 'shareAmount'],
          },
          example: [
            { userId: 1, shareAmount: '8.50' },
            { userId: 2, shareAmount: '8.50' },
            { userId: 3, shareAmount: '8.50' },
          ],
        },
      },
      required: [
        'groupId',
        'paidBy',
        'totalAmount',
        'transactionDate',
        'participants',
      ],
    },
  })
  @ApiResponse({ status: 201, description: 'Transaction successfully created' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'Group or user not found' })
  create(
    @Body(new ZodValidationPipe(CreateTransactionSchema))
    createTransactionDto: CreateTransactionDto,
  ) {
    return this.transactionsService.createTransaction(createTransactionDto);
  }

  @Post('quick-split')
  @ApiOperation({
    summary: 'Create a transaction with equal split among participants',
  })
  @ApiBody({
    description: 'Quick split transaction data',
    schema: {
      type: 'object',
      properties: {
        groupId: { type: 'number', example: 1, description: 'ID of the group' },
        paidBy: {
          type: 'number',
          example: 1,
          description: 'User ID who paid for the transaction',
        },
        totalAmount: {
          type: 'string',
          pattern: '^\\d+(\\.\\d{1,2})?$',
          example: '25.50',
          description: 'Total amount as decimal string',
        },
        description: {
          type: 'string',
          nullable: true,
          example: 'Pizza lunch for the team',
        },
        transactionDate: {
          type: 'string',
          pattern: '^\\d{4}-\\d{2}-\\d{2}$',
          example: '2024-01-15',
          description: 'Transaction date in YYYY-MM-DD format',
        },
        participantIds: {
          type: 'array',
          minItems: 1,
          items: { type: 'number' },
          example: [1, 2, 3],
          description: 'Array of user IDs to split the amount equally among',
        },
      },
      required: [
        'groupId',
        'paidBy',
        'totalAmount',
        'transactionDate',
        'participantIds',
      ],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Quick split transaction successfully created',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'Group or user not found' })
  createQuickSplit(
    @Body(new ZodValidationPipe(CreateQuickSplitSchema))
    createQuickSplitDto: CreateQuickSplitDto,
  ) {
    return this.transactionsService.createQuickSplit(createQuickSplitDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get transaction by ID' })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Transaction ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Transaction found',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        groupId: { type: 'number', example: 1 },
        groupName: { type: 'string', example: 'Office Lunch Group' },
        paidBy: { type: 'number', example: 1 },
        paidByName: { type: 'string', example: 'John Doe' },
        totalAmount: { type: 'string', example: '25.50' },
        description: {
          type: 'string',
          nullable: true,
          example: 'Pizza lunch for the team',
        },
        transactionDate: { type: 'string', example: '2024-01-15' },
        createdAt: { type: 'string', format: 'date-time' },
        participants: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              userId: { type: 'number', example: 1 },
              userName: { type: 'string', example: 'John Doe' },
              shareAmount: { type: 'string', example: '8.50' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.transactionsService.getTransactionById(id);
  }

  @Get('group/:groupId')
  @ApiOperation({ summary: 'Get transactions for a group with pagination' })
  @ApiParam({
    name: 'groupId',
    type: 'number',
    description: 'Group ID',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: 'number',
    description: 'Number of transactions to return (default: 50)',
    example: 10,
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    type: 'number',
    description: 'Number of transactions to skip (default: 0)',
    example: 0,
  })
  @ApiResponse({
    status: 200,
    description: 'List of group transactions',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number', example: 1 },
          totalAmount: { type: 'string', example: '25.50' },
          description: {
            type: 'string',
            nullable: true,
            example: 'Pizza lunch for the team',
          },
          transactionDate: { type: 'string', example: '2024-01-15' },
          paidByName: { type: 'string', example: 'John Doe' },
          participantCount: { type: 'number', example: 3 },
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Group not found' })
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
  @ApiOperation({
    summary: 'Get balance sheet for a group showing who owes what',
  })
  @ApiParam({
    name: 'groupId',
    type: 'number',
    description: 'Group ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Group balance sheet',
    schema: {
      type: 'object',
      properties: {
        groupId: { type: 'number', example: 1 },
        groupName: { type: 'string', example: 'Office Lunch Group' },
        members: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              userId: { type: 'number', example: 1 },
              userName: { type: 'string', example: 'John Doe' },
              balance: {
                type: 'string',
                example: '-5.50',
                description:
                  'Positive means they should receive, negative means they owe',
              },
            },
          },
        },
        totalTransactions: { type: 'number', example: 15 },
        lastUpdated: { type: 'string', format: 'date-time', nullable: true },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Group not found' })
  getGroupBalanceSheet(@Param('groupId', ParseIntPipe) groupId: number) {
    return this.transactionsService.getGroupBalanceSheet(groupId);
  }

  @Post('group/:groupId/settle')
  @ApiOperation({ summary: 'Settle all balances in a group' })
  @ApiParam({
    name: 'groupId',
    type: 'number',
    description: 'Group ID',
    example: 1,
  })
  @ApiQuery({
    name: 'settledBy',
    type: 'number',
    description: 'User ID who is performing the settlement',
    example: 1,
  })
  @ApiBody({
    description: 'Settlement data',
    schema: {
      type: 'object',
      properties: {
        groupId: {
          type: 'number',
          example: 1,
          description: 'ID of the group to settle',
        },
        description: {
          type: 'string',
          nullable: true,
          example: 'Monthly settlement for January',
        },
      },
      required: ['groupId'],
    },
  })
  @ApiResponse({ status: 201, description: 'Balances successfully settled' })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data or no balances to settle',
  })
  @ApiResponse({ status: 404, description: 'Group not found' })
  settleBalances(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Body(new ZodValidationPipe(SettleBalancesSchema))
    settleBalancesDto: SettleBalancesDto,
  ) {
    return this.transactionsService.settleBalances(settleBalancesDto, groupId);
  }

  @Get('group/:groupId/settlements')
  @ApiOperation({ summary: 'Get settlement history for a group' })
  @ApiParam({
    name: 'groupId',
    type: 'number',
    description: 'Group ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'List of settlements for the group',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number', example: 1 },
          groupId: { type: 'number', example: 1 },
          groupName: { type: 'string', example: 'Office Lunch Group' },
          settledBy: { type: 'number', example: 1 },
          settledByName: { type: 'string', example: 'John Doe' },
          description: {
            type: 'string',
            nullable: true,
            example: 'Monthly settlement for January',
          },
          settledAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Group not found' })
  getGroupSettlements(@Param('groupId', ParseIntPipe) groupId: number) {
    return this.transactionsService.getGroupSettlements(groupId);
  }
}
