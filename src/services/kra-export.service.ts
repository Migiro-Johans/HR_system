import { Injectable } from '@nestjs/common';
import { createObjectCsvWriter } from 'csv-writer';
import * as path from 'path';
import * as fs from 'fs';
import { Payroll } from '../entities/payroll.entity';
import { Employee } from '../entities/employee.entity';

export interface P10Record {
  employeePIN: string;
  employeeName: string;
  basicSalary: number;
  benefits: number;
  grossSalary: number;
  definedContribution: number; // NSSF
  ownerOccupiedInterest: number;
  retirementContribution: number;
  insuranceRelief: number;
  taxableIncome: number;
  paye: number;
  personalRelief: number;
  payeAfterRelief: number;
}

@Injectable()
export class KraExportService {
  private readonly exportPath = './uploads/kra-exports';

  constructor() {
    // Ensure export directory exists
    if (!fs.existsSync(this.exportPath)) {
      fs.mkdirSync(this.exportPath, { recursive: true });
    }
  }

  /**
   * Generate KRA iTax P10 CSV export
   * Format compliant with iTax import requirements
   */
  async generateP10Export(
    payrollRecords: Array<{ payroll: Payroll; employee: Employee }>,
    month: number,
    year: number,
  ): Promise<string> {
    const filename = `KRA_P10_${month}_${year}.csv`;
    const filepath = path.join(this.exportPath, filename);

    // Transform payroll records to P10 format
    const p10Records: P10Record[] = payrollRecords.map(({ payroll, employee }) => {
      const benefits =
        payroll.houseAllowance +
        payroll.commuterAllowance +
        payroll.airtimeAllowance;

      return {
        employeePIN: employee.kraPin,
        employeeName: `${employee.firstName} ${employee.lastName}`,
        basicSalary: Number(payroll.basicSalary),
        benefits: Number(benefits),
        grossSalary: Number(payroll.grossSalary),
        definedContribution: Number(payroll.totalNssf),
        ownerOccupiedInterest: 0, // Not typically applicable
        retirementContribution: 0, // Additional retirement if any
        insuranceRelief: 0, // Health insurance relief if applicable
        taxableIncome: Number(payroll.taxableIncome),
        paye: Number(payroll.paye) + Number(payroll.personalRelief), // PAYE before relief
        personalRelief: Number(payroll.personalRelief),
        payeAfterRelief: Number(payroll.paye),
      };
    });

    // Create CSV writer with KRA iTax P10 format
    const csvWriter = createObjectCsvWriter({
      path: filepath,
      header: [
        { id: 'employeePIN', title: 'Employee PIN' },
        { id: 'employeeName', title: 'Employee Name' },
        { id: 'basicSalary', title: 'Basic Salary' },
        { id: 'benefits', title: 'Benefits (Non-Cash)' },
        { id: 'grossSalary', title: 'Gross Pay' },
        { id: 'definedContribution', title: 'Defined Contribution' },
        { id: 'ownerOccupiedInterest', title: 'Owner Occupied Interest' },
        { id: 'retirementContribution', title: 'Retirement Contribution' },
        { id: 'insuranceRelief', title: 'Insurance Relief' },
        { id: 'taxableIncome', title: 'Taxable Pay' },
        { id: 'paye', title: 'Tax Charged' },
        { id: 'personalRelief', title: 'Personal Relief' },
        { id: 'payeAfterRelief', title: 'PAYE Tax' },
      ],
    });

    await csvWriter.writeRecords(p10Records);

    return filepath;
  }

  /**
   * Generate P9 Form (Tax Deduction Card) for individual employee
   * Annual summary of tax deductions
   */
  async generateP9Form(
    employeePayrolls: Array<{ payroll: Payroll; employee: Employee }>,
    year: number,
  ): Promise<string> {
    const employee = employeePayrolls[0]?.employee;
    if (!employee) {
      throw new Error('No employee data provided');
    }

    const filename = `P9_${employee.kraPin}_${year}.csv`;
    const filepath = path.join(this.exportPath, filename);

    // Calculate annual totals
    const annualTotals = employeePayrolls.reduce(
      (totals, { payroll }) => {
        totals.basicSalary += Number(payroll.basicSalary);
        totals.benefits +=
          Number(payroll.houseAllowance) +
          Number(payroll.commuterAllowance) +
          Number(payroll.airtimeAllowance);
        totals.grossSalary += Number(payroll.grossSalary);
        totals.nssf += Number(payroll.totalNssf);
        totals.taxableIncome += Number(payroll.taxableIncome);
        totals.paye += Number(payroll.paye);
        return totals;
      },
      {
        basicSalary: 0,
        benefits: 0,
        grossSalary: 0,
        nssf: 0,
        taxableIncome: 0,
        paye: 0,
      },
    );

    const p9Data = [
      { field: 'Employee Name', value: `${employee.firstName} ${employee.lastName}` },
      { field: 'KRA PIN', value: employee.kraPin },
      { field: 'NSSF Number', value: employee.nssfNumber || 'N/A' },
      { field: 'Year', value: year.toString() },
      { field: 'Total Basic Salary', value: annualTotals.basicSalary.toFixed(2) },
      { field: 'Total Benefits', value: annualTotals.benefits.toFixed(2) },
      { field: 'Total Gross Salary', value: annualTotals.grossSalary.toFixed(2) },
      { field: 'Total NSSF', value: annualTotals.nssf.toFixed(2) },
      { field: 'Total Taxable Income', value: annualTotals.taxableIncome.toFixed(2) },
      { field: 'Total PAYE', value: annualTotals.paye.toFixed(2) },
      { field: 'Personal Relief', value: (2400 * employeePayrolls.length).toFixed(2) },
    ];

    const csvWriter = createObjectCsvWriter({
      path: filepath,
      header: [
        { id: 'field', title: 'Field' },
        { id: 'value', title: 'Value' },
      ],
    });

    await csvWriter.writeRecords(p9Data);

    return filepath;
  }

  /**
   * Generate NSSF remittance CSV
   */
  async generateNSSFRemittance(
    payrollRecords: Array<{ payroll: Payroll; employee: Employee }>,
    month: number,
    year: number,
  ): Promise<string> {
    const filename = `NSSF_Remittance_${month}_${year}.csv`;
    const filepath = path.join(this.exportPath, filename);

    const nssfRecords = payrollRecords.map(({ payroll, employee }) => ({
      nssfNumber: employee.nssfNumber || 'N/A',
      employeeName: `${employee.firstName} ${employee.lastName}`,
      idNumber: employee.idNumber,
      grossSalary: Number(payroll.grossSalary),
      tier1: Number(payroll.nssfTier1),
      tier2: Number(payroll.nssfTier2),
      employeeContribution: Number(payroll.totalNssf),
      employerContribution: Number(payroll.employerNssf),
      totalContribution: Number(payroll.totalNssf) + Number(payroll.employerNssf),
    }));

    const csvWriter = createObjectCsvWriter({
      path: filepath,
      header: [
        { id: 'nssfNumber', title: 'NSSF Number' },
        { id: 'employeeName', title: 'Employee Name' },
        { id: 'idNumber', title: 'ID Number' },
        { id: 'grossSalary', title: 'Gross Salary' },
        { id: 'tier1', title: 'Tier I Contribution' },
        { id: 'tier2', title: 'Tier II Contribution' },
        { id: 'employeeContribution', title: 'Employee Contribution' },
        { id: 'employerContribution', title: 'Employer Contribution' },
        { id: 'totalContribution', title: 'Total Contribution' },
      ],
    });

    await csvWriter.writeRecords(nssfRecords);

    return filepath;
  }

  /**
   * Generate SHIF remittance CSV
   */
  async generateSHIFRemittance(
    payrollRecords: Array<{ payroll: Payroll; employee: Employee }>,
    month: number,
    year: number,
  ): Promise<string> {
    const filename = `SHIF_Remittance_${month}_${year}.csv`;
    const filepath = path.join(this.exportPath, filename);

    const shifRecords = payrollRecords.map(({ payroll, employee }) => ({
      employeeName: `${employee.firstName} ${employee.lastName}`,
      idNumber: employee.idNumber,
      grossSalary: Number(payroll.grossSalary),
      shifContribution: Number(payroll.shifDeduction),
    }));

    const csvWriter = createObjectCsvWriter({
      path: filepath,
      header: [
        { id: 'employeeName', title: 'Employee Name' },
        { id: 'idNumber', title: 'ID Number' },
        { id: 'grossSalary', title: 'Gross Salary' },
        { id: 'shifContribution', title: 'SHIF Contribution' },
      ],
    });

    await csvWriter.writeRecords(shifRecords);

    return filepath;
  }
}
