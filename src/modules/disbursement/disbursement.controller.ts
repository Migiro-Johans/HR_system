import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DisbursementService } from './disbursement.service';

@ApiTags('disbursement')
@Controller('disbursement')
export class DisbursementController {
  constructor(private readonly disbursementService: DisbursementService) {}

  @Post('initiate/:payrollId')
  @ApiOperation({ summary: 'Initiate M-Pesa disbursement for a payroll' })
  @ApiResponse({ status: 201, description: 'Disbursement initiated successfully' })
  @HttpCode(HttpStatus.CREATED)
  initiate(@Param('payrollId') payrollId: string) {
    return this.disbursementService.initiateDisbursement(payrollId);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Bulk M-Pesa disbursement for multiple payrolls' })
  @ApiResponse({ status: 201, description: 'Bulk disbursement initiated' })
  @HttpCode(HttpStatus.CREATED)
  bulkDisbursement(@Body('payrollIds') payrollIds: string[]) {
    return this.disbursementService.bulkDisbursement(payrollIds);
  }

  @Get()
  @ApiOperation({ summary: 'Get all disbursements' })
  @ApiResponse({ status: 200, description: 'Returns all disbursements' })
  findAll() {
    return this.disbursementService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get disbursement by ID' })
  @ApiResponse({ status: 200, description: 'Returns disbursement details' })
  findOne(@Param('id') id: string) {
    return this.disbursementService.findOne(id);
  }

  @Post(':id/retry')
  @ApiOperation({ summary: 'Retry failed disbursement' })
  @ApiResponse({ status: 200, description: 'Disbursement retry initiated' })
  retry(@Param('id') id: string) {
    return this.disbursementService.retry(id);
  }

  @Post('callback/result')
  @ApiOperation({ summary: 'M-Pesa ResultURL callback' })
  @ApiResponse({ status: 200, description: 'Callback processed successfully' })
  @HttpCode(HttpStatus.OK)
  async handleResultCallback(@Body() callbackData: any) {
    await this.disbursementService.processCallback(callbackData);
    return { ResultCode: 0, ResultDesc: 'Success' };
  }

  @Post('callback/timeout')
  @ApiOperation({ summary: 'M-Pesa QueueTimeoutURL callback' })
  @ApiResponse({ status: 200, description: 'Timeout processed successfully' })
  @HttpCode(HttpStatus.OK)
  async handleTimeoutCallback(@Body() timeoutData: any) {
    await this.disbursementService.processTimeout(timeoutData);
    return { ResultCode: 0, ResultDesc: 'Success' };
  }
}
