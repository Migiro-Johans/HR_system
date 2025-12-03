import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { PublicHoliday } from '../entities/public-holiday.entity';

@Injectable()
export class LeaveCalculatorService {
  constructor(
    @InjectRepository(PublicHoliday)
    private publicHolidayRepository: Repository<PublicHoliday>,
  ) {}

  /**
   * Calculate working days between two dates
   * Excludes weekends and public holidays (gazetted by Interior Ministry)
   */
  async calculateWorkingDays(
    startDate: Date,
    endDate: Date,
  ): Promise<{
    totalDays: number;
    workingDays: number;
    publicHolidays: number;
    weekends: number;
  }> {
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Get public holidays within the date range
    const publicHolidays = await this.publicHolidayRepository.find({
      where: {
        date: Between(start, end),
        isGazetted: true,
      },
    });

    const publicHolidayDates = new Set(
      publicHolidays.map((ph) => ph.date.toISOString().split('T')[0]),
    );

    let totalDays = 0;
    let workingDays = 0;
    let weekendDays = 0;
    let publicHolidayCount = 0;

    const currentDate = new Date(start);

    while (currentDate <= end) {
      totalDays++;

      const dayOfWeek = currentDate.getDay();
      const dateString = currentDate.toISOString().split('T')[0];

      // Check if it's a weekend (Saturday = 6, Sunday = 0)
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        weekendDays++;
      }
      // Check if it's a public holiday
      else if (publicHolidayDates.has(dateString)) {
        publicHolidayCount++;
      }
      // It's a working day
      else {
        workingDays++;
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return {
      totalDays,
      workingDays,
      publicHolidays: publicHolidayCount,
      weekends: weekendDays,
    };
  }

  /**
   * Validate sick leave policy
   * 7 days full pay, 7 days half pay as per Employment Act 2007
   */
  validateSickLeave(
    sickLeaveTaken: number,
    requestedDays: number,
  ): {
    valid: boolean;
    fullPayDays: number;
    halfPayDays: number;
    unpaidDays: number;
    message: string;
  } {
    const FULL_PAY_LIMIT = 7;
    const HALF_PAY_LIMIT = 7;
    const totalAllowed = FULL_PAY_LIMIT + HALF_PAY_LIMIT;

    const remainingFullPay = Math.max(0, FULL_PAY_LIMIT - sickLeaveTaken);
    const remainingHalfPay = Math.max(
      0,
      totalAllowed - Math.max(sickLeaveTaken, FULL_PAY_LIMIT),
    );

    let fullPayDays = 0;
    let halfPayDays = 0;
    let unpaidDays = 0;
    let valid = true;
    let message = 'Sick leave request is valid';

    if (requestedDays <= remainingFullPay) {
      // All days at full pay
      fullPayDays = requestedDays;
    } else if (requestedDays <= remainingFullPay + remainingHalfPay) {
      // Some full pay, some half pay
      fullPayDays = remainingFullPay;
      halfPayDays = requestedDays - remainingFullPay;
    } else {
      // Exceeded sick leave allowance
      fullPayDays = remainingFullPay;
      halfPayDays = remainingHalfPay;
      unpaidDays = requestedDays - (remainingFullPay + remainingHalfPay);
      valid = false;
      message = `Exceeded sick leave allowance. ${unpaidDays} day(s) will be unpaid`;
    }

    return {
      valid,
      fullPayDays,
      halfPayDays,
      unpaidDays,
      message,
    };
  }

  /**
   * Validate annual leave balance
   * Standard 21 days per year as per Employment Act 2007
   */
  validateAnnualLeave(
    annualLeaveBalance: number,
    requestedDays: number,
  ): {
    valid: boolean;
    message: string;
  } {
    if (requestedDays > annualLeaveBalance) {
      return {
        valid: false,
        message: `Insufficient leave balance. Available: ${annualLeaveBalance} days, Requested: ${requestedDays} days`,
      };
    }

    return {
      valid: true,
      message: 'Annual leave request is valid',
    };
  }

  /**
   * Calculate maternity leave entitlement
   * 3 months (90 days) as per Employment Act 2007
   */
  validateMaternityLeave(requestedDays: number): {
    valid: boolean;
    paidDays: number;
    message: string;
  } {
    const MATERNITY_LEAVE_DAYS = 90;

    if (requestedDays > MATERNITY_LEAVE_DAYS) {
      return {
        valid: false,
        paidDays: MATERNITY_LEAVE_DAYS,
        message: `Maternity leave cannot exceed ${MATERNITY_LEAVE_DAYS} days`,
      };
    }

    return {
      valid: true,
      paidDays: requestedDays,
      message: 'Maternity leave request is valid',
    };
  }

  /**
   * Calculate paternity leave entitlement
   * 2 weeks (14 days) as per Employment Act 2007
   */
  validatePaternityLeave(requestedDays: number): {
    valid: boolean;
    paidDays: number;
    message: string;
  } {
    const PATERNITY_LEAVE_DAYS = 14;

    if (requestedDays > PATERNITY_LEAVE_DAYS) {
      return {
        valid: false,
        paidDays: PATERNITY_LEAVE_DAYS,
        message: `Paternity leave cannot exceed ${PATERNITY_LEAVE_DAYS} days`,
      };
    }

    return {
      valid: true,
      paidDays: requestedDays,
      message: 'Paternity leave request is valid',
    };
  }
}
