import { Injectable } from '@nestjs/common';

export interface PayrollInput {
  basicSalary: number;
  houseAllowance: number;
  commuterAllowance: number;
  airtimeAllowance: number;
}

export interface PayrollCalculation {
  // Income
  basicSalary: number;
  houseAllowance: number;
  commuterAllowance: number;
  airtimeAllowance: number;
  grossSalary: number;

  // Employee Deductions
  nssfTier1: number;
  nssfTier2: number;
  totalNssf: number;
  shifDeduction: number;
  housingLevyEmployee: number;
  taxableIncome: number;
  paye: number;
  personalRelief: number;
  totalDeductions: number;
  netSalary: number;

  // Employer Contributions
  employerNssf: number;
  employerHousingLevy: number;
  nitaLevy: number;
}

@Injectable()
export class PayrollCalculatorService {
  // Constants as per Kenya Employment Act 2007 and Finance Act 2023/24
  private readonly SHIF_RATE = 0.0275; // 2.75%
  private readonly SHIF_MIN = 300;
  private readonly NSSF_RATE = 0.06; // 6% matching
  private readonly NSSF_TIER1_LIMIT = 7000;
  private readonly NSSF_TIER2_LIMIT = 36000;
  private readonly HOUSING_LEVY_RATE = 0.015; // 1.5%
  private readonly PERSONAL_RELIEF = 2400;
  private readonly NITA_LEVY = 50;

  // PAYE Tax Bands (Monthly)
  private readonly TAX_BANDS = [
    { limit: 24000, rate: 0.1 }, // 0-24,000: 10%
    { limit: 32333, rate: 0.25 }, // Next 8,333: 25%
    { limit: 500000, rate: 0.3 }, // Next 467,667: 30%
    { limit: 800000, rate: 0.325 }, // Next 300,000: 32.5%
    { limit: Infinity, rate: 0.35 }, // Above 800,000: 35%
  ];

  /**
   * Calculate complete payroll for an employee
   * Adheres to Kenya Employment Act 2007 and Finance Act 2023/24
   */
  calculatePayroll(input: PayrollInput): PayrollCalculation {
    // Step 1: Calculate Gross Salary
    const grossSalary =
      input.basicSalary +
      input.houseAllowance +
      input.commuterAllowance +
      input.airtimeAllowance;

    // Step 2: Calculate NSSF (Tier I & Tier II)
    const nssfCalculation = this.calculateNSSF(grossSalary);

    // Step 3: Calculate SHIF (Social Health Insurance Fund)
    const shifDeduction = this.calculateSHIF(grossSalary);

    // Step 4: Calculate Housing Levy (Employee)
    const housingLevyEmployee = this.calculateHousingLevy(grossSalary);

    // Step 5: Calculate Taxable Income
    // Taxable Income = Gross - NSSF Employee Contribution
    const taxableIncome = grossSalary - nssfCalculation.totalNssf;

    // Step 6: Calculate PAYE
    const paye = this.calculatePAYE(taxableIncome);

    // Step 7: Apply Personal Relief
    const payeAfterRelief = Math.max(0, paye - this.PERSONAL_RELIEF);

    // Step 8: Calculate Total Deductions
    const totalDeductions =
      nssfCalculation.totalNssf +
      shifDeduction +
      housingLevyEmployee +
      payeAfterRelief;

    // Step 9: Calculate Net Salary
    const netSalary = grossSalary - totalDeductions;

    // Step 10: Calculate Employer Contributions
    const employerNssf = nssfCalculation.totalNssf; // Matching contribution
    const employerHousingLevy = this.calculateHousingLevy(grossSalary);
    const nitaLevy = this.NITA_LEVY;

    return {
      // Income
      basicSalary: this.round(input.basicSalary),
      houseAllowance: this.round(input.houseAllowance),
      commuterAllowance: this.round(input.commuterAllowance),
      airtimeAllowance: this.round(input.airtimeAllowance),
      grossSalary: this.round(grossSalary),

      // Employee Deductions
      nssfTier1: this.round(nssfCalculation.tier1),
      nssfTier2: this.round(nssfCalculation.tier2),
      totalNssf: this.round(nssfCalculation.totalNssf),
      shifDeduction: this.round(shifDeduction),
      housingLevyEmployee: this.round(housingLevyEmployee),
      taxableIncome: this.round(taxableIncome),
      paye: this.round(payeAfterRelief),
      personalRelief: this.PERSONAL_RELIEF,
      totalDeductions: this.round(totalDeductions),
      netSalary: this.round(netSalary),

      // Employer Contributions
      employerNssf: this.round(employerNssf),
      employerHousingLevy: this.round(employerHousingLevy),
      nitaLevy: this.round(nitaLevy),
    };
  }

  /**
   * Calculate NSSF contributions (Tier I & Tier II)
   * Tier I: Up to 7,000 @ 6%
   * Tier II: 7,001 - 36,000 @ 6%
   */
  private calculateNSSF(grossSalary: number): {
    tier1: number;
    tier2: number;
    totalNssf: number;
  } {
    let tier1 = 0;
    let tier2 = 0;

    // Tier I contribution (up to 7,000)
    const tier1Base = Math.min(grossSalary, this.NSSF_TIER1_LIMIT);
    tier1 = tier1Base * this.NSSF_RATE;

    // Tier II contribution (7,001 - 36,000)
    if (grossSalary > this.NSSF_TIER1_LIMIT) {
      const tier2Base = Math.min(
        grossSalary - this.NSSF_TIER1_LIMIT,
        this.NSSF_TIER2_LIMIT - this.NSSF_TIER1_LIMIT,
      );
      tier2 = tier2Base * this.NSSF_RATE;
    }

    return {
      tier1,
      tier2,
      totalNssf: tier1 + tier2,
    };
  }

  /**
   * Calculate SHIF (Social Health Insurance Fund)
   * 2.75% of Gross, minimum Ksh 300
   */
  private calculateSHIF(grossSalary: number): number {
    const shif = grossSalary * this.SHIF_RATE;
    return Math.max(shif, this.SHIF_MIN);
  }

  /**
   * Calculate Housing Levy
   * 1.5% of Gross (Both Employer and Employee)
   */
  private calculateHousingLevy(grossSalary: number): number {
    return grossSalary * this.HOUSING_LEVY_RATE;
  }

  /**
   * Calculate PAYE using Kenya tax bands
   * Tax Bands (Monthly):
   * - 0 to 24,000: 10%
   * - 24,001 to 32,333: 25%
   * - 32,334 to 500,000: 30%
   * - 500,001 to 800,000: 32.5%
   * - Above 800,000: 35%
   */
  private calculatePAYE(taxableIncome: number): number {
    let tax = 0;
    let previousLimit = 0;

    for (const band of this.TAX_BANDS) {
      const taxableAmount = Math.min(taxableIncome, band.limit) - previousLimit;

      if (taxableAmount > 0) {
        tax += taxableAmount * band.rate;
      }

      if (taxableIncome <= band.limit) {
        break;
      }

      previousLimit = band.limit;
    }

    return tax;
  }

  /**
   * Round to 2 decimal places
   */
  private round(value: number): number {
    return Math.round(value * 100) / 100;
  }

  /**
   * Calculate total employer cost
   */
  calculateEmployerCost(payroll: PayrollCalculation): number {
    return this.round(
      payroll.grossSalary +
        payroll.employerNssf +
        payroll.employerHousingLevy +
        payroll.nitaLevy,
    );
  }
}
