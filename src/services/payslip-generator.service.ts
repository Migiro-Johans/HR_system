import { Injectable } from '@nestjs/common';
import * as PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';
import { Payroll } from '../entities/payroll.entity';
import { Employee } from '../entities/employee.entity';

@Injectable()
export class PayslipGeneratorService {
  private readonly uploadPath = './uploads/payslips';

  constructor() {
    // Ensure upload directory exists
    if (!fs.existsSync(this.uploadPath)) {
      fs.mkdirSync(this.uploadPath, { recursive: true });
    }
  }

  /**
   * Generate payslip PDF
   */
  async generatePayslipPDF(
    employee: Employee,
    payroll: Payroll,
  ): Promise<string> {
    const filename = `payslip_${employee.employeeNumber}_${payroll.month}_${payroll.year}.pdf`;
    const filepath = path.join(this.uploadPath, filename);

    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ size: 'A4', margin: 50 });
        const stream = fs.createWriteStream(filepath);

        doc.pipe(stream);

        // Header
        doc
          .fontSize(20)
          .text('PAYSLIP', { align: 'center' })
          .moveDown();

        // Company Info (Placeholder)
        doc
          .fontSize(12)
          .text('KaziHR Systems', { align: 'center' })
          .fontSize(10)
          .text('P.O. Box 12345, Nairobi, Kenya', { align: 'center' })
          .text('Email: payroll@kazihr.co.ke', { align: 'center' })
          .moveDown(2);

        // Employee Details
        doc
          .fontSize(12)
          .text('Employee Information', { underline: true })
          .moveDown(0.5);

        const monthNames = [
          'January',
          'February',
          'March',
          'April',
          'May',
          'June',
          'July',
          'August',
          'September',
          'October',
          'November',
          'December',
        ];

        doc
          .fontSize(10)
          .text(`Employee Name: ${employee.firstName} ${employee.lastName}`)
          .text(`Employee Number: ${employee.employeeNumber}`)
          .text(`KRA PIN: ${employee.kraPin}`)
          .text(`NSSF Number: ${employee.nssfNumber || 'N/A'}`)
          .text(
            `Pay Period: ${monthNames[payroll.month - 1]} ${payroll.year}`,
          )
          .moveDown(2);

        // Earnings Section
        doc
          .fontSize(12)
          .text('Earnings', { underline: true })
          .moveDown(0.5);

        const earnings = [
          ['Basic Salary', this.formatCurrency(payroll.basicSalary)],
          ['House Allowance', this.formatCurrency(payroll.houseAllowance)],
          ['Commuter Allowance', this.formatCurrency(payroll.commuterAllowance)],
          ['Airtime Allowance', this.formatCurrency(payroll.airtimeAllowance)],
        ];

        earnings.forEach(([label, amount]) => {
          doc
            .fontSize(10)
            .text(label, 50, doc.y, { continued: true })
            .text(amount, { align: 'right' });
        });

        doc
          .moveDown(0.5)
          .fontSize(11)
          .text('Gross Salary', 50, doc.y, { continued: true })
          .text(this.formatCurrency(payroll.grossSalary), {
            align: 'right',
          })
          .moveDown(2);

        // Deductions Section
        doc
          .fontSize(12)
          .text('Deductions', { underline: true })
          .moveDown(0.5);

        const deductions = [
          ['NSSF Tier I', this.formatCurrency(payroll.nssfTier1)],
          ['NSSF Tier II', this.formatCurrency(payroll.nssfTier2)],
          ['Total NSSF', this.formatCurrency(payroll.totalNssf)],
          ['SHIF', this.formatCurrency(payroll.shifDeduction)],
          [
            'Housing Levy',
            this.formatCurrency(payroll.housingLevyEmployee),
          ],
          ['PAYE (After Relief)', this.formatCurrency(payroll.paye)],
        ];

        deductions.forEach(([label, amount]) => {
          doc
            .fontSize(10)
            .text(label, 50, doc.y, { continued: true })
            .text(amount, { align: 'right' });
        });

        doc
          .moveDown(0.5)
          .fontSize(11)
          .text('Total Deductions', 50, doc.y, { continued: true })
          .text(this.formatCurrency(payroll.totalDeductions), {
            align: 'right',
          })
          .moveDown(2);

        // Net Salary
        doc
          .fontSize(14)
          .fillColor('green')
          .text('Net Salary', 50, doc.y, { continued: true })
          .text(this.formatCurrency(payroll.netSalary), {
            align: 'right',
          })
          .fillColor('black')
          .moveDown(3);

        // Employer Contributions
        doc
          .fontSize(12)
          .text('Employer Contributions', { underline: true })
          .moveDown(0.5);

        const employerContributions = [
          ['NSSF (Matching)', this.formatCurrency(payroll.employerNssf)],
          [
            'Housing Levy',
            this.formatCurrency(payroll.employerHousingLevy),
          ],
          ['NITA Levy', this.formatCurrency(payroll.nitaLevy)],
        ];

        employerContributions.forEach(([label, amount]) => {
          doc
            .fontSize(10)
            .text(label, 50, doc.y, { continued: true })
            .text(amount, { align: 'right' });
        });

        // Footer
        doc
          .moveDown(3)
          .fontSize(8)
          .text(
            'This is a computer-generated payslip and does not require a signature.',
            { align: 'center' },
          )
          .text(
            `Generated on: ${new Date().toLocaleDateString('en-KE')}`,
            { align: 'center' },
          );

        doc.end();

        stream.on('finish', () => {
          resolve(filepath);
        });

        stream.on('error', (error) => {
          reject(error);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Format currency to Kenyan Shilling
   */
  private formatCurrency(amount: number): string {
    return `KES ${amount.toLocaleString('en-KE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
}
