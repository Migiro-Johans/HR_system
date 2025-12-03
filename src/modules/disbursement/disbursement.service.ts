import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Disbursement } from '../../entities/disbursement.entity';
import { Payroll } from '../../entities/payroll.entity';
import { MpesaService, B2CCallbackResult } from '../../services/mpesa.service';

@Injectable()
export class DisbursementService {
  constructor(
    @InjectRepository(Disbursement)
    private disbursementRepository: Repository<Disbursement>,
    @InjectRepository(Payroll)
    private payrollRepository: Repository<Payroll>,
    private mpesaService: MpesaService,
  ) {}

  /**
   * Initiate salary disbursement via M-Pesa
   */
  async initiateDisbursement(payrollId: string): Promise<Disbursement> {
    // Find payroll
    const payroll = await this.payrollRepository.findOne({
      where: { id: payrollId },
      relations: ['employee'],
    });

    if (!payroll) {
      throw new NotFoundException(`Payroll with ID ${payrollId} not found`);
    }

    if (payroll.status !== 'approved') {
      throw new BadRequestException('Payroll must be approved before disbursement');
    }

    const employee = payroll.employee;

    if (!employee.mpesaNumber) {
      throw new BadRequestException(
        `Employee ${employee.employeeNumber} does not have an M-Pesa number`,
      );
    }

    // Check for existing disbursement
    const existingDisbursement = await this.disbursementRepository.findOne({
      where: { payrollId },
    });

    if (existingDisbursement) {
      throw new BadRequestException('Disbursement already exists for this payroll');
    }

    // Initiate M-Pesa B2C payment
    const mpesaResponse = await this.mpesaService.initiateB2CPayment({
      phoneNumber: employee.mpesaNumber,
      amount: Number(payroll.netSalary),
      remarks: `Salary payment for ${payroll.month}/${payroll.year}`,
      occasion: 'Salary',
    });

    // Create disbursement record
    const disbursement = this.disbursementRepository.create({
      payrollId: payroll.id,
      phoneNumber: employee.mpesaNumber,
      amount: Number(payroll.netSalary),
      conversationId: mpesaResponse.ConversationID,
      originatorConversationId: mpesaResponse.OriginatorConversationID,
      status: 'processing',
      responseDescription: mpesaResponse.ResponseDescription,
    });

    return await this.disbursementRepository.save(disbursement);
  }

  /**
   * Bulk disbursement for multiple payrolls
   */
  async bulkDisbursement(payrollIds: string[]): Promise<Disbursement[]> {
    const disbursements: Disbursement[] = [];

    for (const payrollId of payrollIds) {
      try {
        const disbursement = await this.initiateDisbursement(payrollId);
        disbursements.push(disbursement);
      } catch (error) {
        console.error(`Failed to disburse payroll ${payrollId}:`, error.message);
      }
    }

    return disbursements;
  }

  /**
   * Process M-Pesa callback (ResultURL)
   */
  async processCallback(callbackData: B2CCallbackResult): Promise<void> {
    const result = await this.mpesaService.processB2CCallback(callbackData);

    // Find disbursement by conversation ID
    const disbursement = await this.disbursementRepository.findOne({
      where: {
        originatorConversationId: result.originatorConversationId,
      },
      relations: ['payroll'],
    });

    if (!disbursement) {
      console.error(
        `Disbursement not found for conversation ID: ${result.originatorConversationId}`,
      );
      return;
    }

    // Update disbursement status
    if (result.success) {
      disbursement.status = 'completed';
      disbursement.mpesaReceiptNumber = result.mpesaReceiptNumber;
      disbursement.processedAt = new Date();

      // Update payroll status
      const payroll = await this.payrollRepository.findOne({
        where: { id: disbursement.payrollId },
      });

      if (payroll) {
        payroll.status = 'paid';
        payroll.paidAt = new Date();
        await this.payrollRepository.save(payroll);
      }
    } else {
      disbursement.status = 'failed';
      disbursement.errorMessage = result.resultDescription;
      disbursement.retryCount += 1;
    }

    disbursement.responseDescription = result.resultDescription;
    await this.disbursementRepository.save(disbursement);
  }

  /**
   * Process M-Pesa timeout callback (QueueTimeoutURL)
   */
  async processTimeout(timeoutData: any): Promise<void> {
    console.warn('M-Pesa timeout received:', timeoutData);

    // Find disbursement and mark as failed
    const disbursement = await this.disbursementRepository.findOne({
      where: {
        originatorConversationId: timeoutData.OriginatorConversationID,
      },
    });

    if (disbursement) {
      disbursement.status = 'failed';
      disbursement.errorMessage = 'Transaction timed out';
      await this.disbursementRepository.save(disbursement);
    }
  }

  /**
   * Get disbursement by ID
   */
  async findOne(id: string): Promise<Disbursement> {
    const disbursement = await this.disbursementRepository.findOne({
      where: { id },
      relations: ['payroll', 'payroll.employee'],
    });

    if (!disbursement) {
      throw new NotFoundException(`Disbursement with ID ${id} not found`);
    }

    return disbursement;
  }

  /**
   * Get all disbursements
   */
  async findAll(): Promise<Disbursement[]> {
    return await this.disbursementRepository.find({
      relations: ['payroll', 'payroll.employee'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Retry failed disbursement
   */
  async retry(id: string): Promise<Disbursement> {
    const disbursement = await this.findOne(id);

    if (disbursement.status !== 'failed') {
      throw new BadRequestException('Only failed disbursements can be retried');
    }

    if (disbursement.retryCount >= 3) {
      throw new BadRequestException('Maximum retry attempts exceeded');
    }

    // Initiate new M-Pesa payment
    const payroll = disbursement.payroll;
    const employee = payroll.employee;

    const mpesaResponse = await this.mpesaService.initiateB2CPayment({
      phoneNumber: employee.mpesaNumber,
      amount: Number(payroll.netSalary),
      remarks: `Salary payment for ${payroll.month}/${payroll.year} (Retry)`,
      occasion: 'Salary',
    });

    // Update disbursement
    disbursement.conversationId = mpesaResponse.ConversationID;
    disbursement.originatorConversationId = mpesaResponse.OriginatorConversationID;
    disbursement.status = 'processing';
    disbursement.responseDescription = mpesaResponse.ResponseDescription;
    disbursement.retryCount += 1;

    return await this.disbursementRepository.save(disbursement);
  }
}
