import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  Res,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { PayrollService } from './payroll.service';
import * as fs from 'fs';

@ApiTags('payroll')
@Controller('payroll')
export class PayrollController {
  constructor(private readonly payrollService: PayrollService) {}

  @Post('generate/:employeeId')
  @ApiOperation({ summary: 'Generate payroll for a specific employee' })
  @ApiResponse({ status: 201, description: 'Payroll generated successfully' })
  @HttpCode(HttpStatus.CREATED)
  generateForEmployee(
    @Param('employeeId') employeeId: string,
    @Query('month') month: number,
    @Query('year') year: number,
  ) {
    return this.payrollService.generatePayrollForEmployee(
      employeeId,
      Number(month),
      Number(year),
    );
  }

  @Post('generate-all')
  @ApiOperation({ summary: 'Generate payroll for all active employees' })
  @ApiResponse({
    status: 201,
    description: 'Payroll generated for all employees',
  })
  @HttpCode(HttpStatus.CREATED)
  generateForAll(
    @Query('month') month: number,
    @Query('year') year: number,
  ) {
    return this.payrollService.generatePayrollForAllEmployees(
      Number(month),
      Number(year),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payroll by ID' })
  @ApiResponse({ status: 200, description: 'Returns payroll details' })
  findOne(@Param('id') id: string) {
    return this.payrollService.findOne(id);
  }

  @Get('month/:month/year/:year')
  @ApiOperation({ summary: 'Get all payrolls for a specific month' })
  @ApiResponse({ status: 200, description: 'Returns payrolls for the month' })
  findByMonth(@Param('month') month: number, @Param('year') year: number) {
    return this.payrollService.findByMonth(Number(month), Number(year));
  }

  @Get('employee/:employeeId')
  @ApiOperation({ summary: 'Get payroll history for an employee' })
  @ApiResponse({
    status: 200,
    description: 'Returns employee payroll history',
  })
  findByEmployee(@Param('employeeId') employeeId: string) {
    return this.payrollService.findByEmployee(employeeId);
  }

  @Post(':id/approve')
  @ApiOperation({ summary: 'Approve payroll' })
  @ApiResponse({ status: 200, description: 'Payroll approved successfully' })
  approve(@Param('id') id: string) {
    return this.payrollService.approve(id);
  }

  @Post(':id/generate-payslip')
  @ApiOperation({ summary: 'Generate payslip PDF' })
  @ApiResponse({ status: 200, description: 'Payslip generated successfully' })
  async generatePayslip(@Param('id') id: string) {
    const payslipPath = await this.payrollService.generatePayslip(id);
    return { message: 'Payslip generated successfully', path: payslipPath };
  }

  @Get(':id/download-payslip')
  @ApiOperation({ summary: 'Download payslip PDF' })
  @ApiResponse({ status: 200, description: 'Returns payslip PDF' })
  async downloadPayslip(@Param('id') id: string, @Res() res: Response) {
    const payroll = await this.payrollService.findOne(id);

    if (!payroll.payslipPath || !fs.existsSync(payroll.payslipPath)) {
      // Generate payslip if not exists
      await this.payrollService.generatePayslip(id);
      const updatedPayroll = await this.payrollService.findOne(id);
      res.download(updatedPayroll.payslipPath);
    } else {
      res.download(payroll.payslipPath);
    }
  }

  @Get('export/p10')
  @ApiOperation({ summary: 'Generate KRA P10 CSV export' })
  @ApiResponse({ status: 200, description: 'Returns P10 CSV file' })
  async exportP10(
    @Query('month') month: number,
    @Query('year') year: number,
    @Res() res: Response,
  ) {
    const filePath = await this.payrollService.generateP10Export(
      Number(month),
      Number(year),
    );
    res.download(filePath);
  }

  @Get('export/nssf')
  @ApiOperation({ summary: 'Generate NSSF remittance CSV' })
  @ApiResponse({ status: 200, description: 'Returns NSSF CSV file' })
  async exportNSSF(
    @Query('month') month: number,
    @Query('year') year: number,
    @Res() res: Response,
  ) {
    const filePath = await this.payrollService.generateNSSFRemittance(
      Number(month),
      Number(year),
    );
    res.download(filePath);
  }

  @Get('export/shif')
  @ApiOperation({ summary: 'Generate SHIF remittance CSV' })
  @ApiResponse({ status: 200, description: 'Returns SHIF CSV file' })
  async exportSHIF(
    @Query('month') month: number,
    @Query('year') year: number,
    @Res() res: Response,
  ) {
    const filePath = await this.payrollService.generateSHIFRemittance(
      Number(month),
      Number(year),
    );
    res.download(filePath);
  }
}
