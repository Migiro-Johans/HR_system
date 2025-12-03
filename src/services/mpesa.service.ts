import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

export interface B2CPaymentRequest {
  phoneNumber: string;
  amount: number;
  remarks: string;
  occasion: string;
}

export interface B2CPaymentResponse {
  ConversationID: string;
  OriginatorConversationID: string;
  ResponseCode: string;
  ResponseDescription: string;
}

export interface B2CCallbackResult {
  Result: {
    ResultType: number;
    ResultCode: number;
    ResultDesc: string;
    OriginatorConversationID: string;
    ConversationID: string;
    TransactionID: string;
    ResultParameters?: {
      ResultParameter: Array<{
        Key: string;
        Value: any;
      }>;
    };
  };
}

@Injectable()
export class MpesaService {
  private readonly logger = new Logger(MpesaService.name);
  private readonly apiClient: AxiosInstance;
  private readonly baseUrl: string;

  constructor(private configService: ConfigService) {
    const environment = this.configService.get<string>('MPESA_ENVIRONMENT');
    this.baseUrl =
      environment === 'production'
        ? 'https://api.safaricom.co.ke'
        : 'https://sandbox.safaricom.co.ke';

    this.apiClient = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000,
    });
  }

  /**
   * Get OAuth access token from Safaricom Daraja API
   */
  async getAccessToken(): Promise<string> {
    try {
      const consumerKey = this.configService.get<string>('MPESA_CONSUMER_KEY');
      const consumerSecret = this.configService.get<string>(
        'MPESA_CONSUMER_SECRET',
      );

      const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString(
        'base64',
      );

      const response = await this.apiClient.get(
        '/oauth/v1/generate?grant_type=client_credentials',
        {
          headers: {
            Authorization: `Basic ${auth}`,
          },
        },
      );

      return response.data.access_token;
    } catch (error) {
      this.logger.error('Failed to get M-Pesa access token', error);
      throw new Error('Failed to authenticate with M-Pesa API');
    }
  }

  /**
   * Initiate B2C payment (Business to Customer)
   * Used for bulk salary disbursements
   */
  async initiateB2CPayment(
    request: B2CPaymentRequest,
  ): Promise<B2CPaymentResponse> {
    try {
      const accessToken = await this.getAccessToken();

      const shortcode = this.configService.get<string>('MPESA_SHORTCODE');
      const initiatorName = this.configService.get<string>(
        'MPESA_INITIATOR_NAME',
      );
      const initiatorPassword = this.configService.get<string>(
        'MPESA_INITIATOR_PASSWORD',
      );
      const resultUrl = this.configService.get<string>('MPESA_RESULT_URL');
      const queueTimeoutUrl = this.configService.get<string>(
        'MPESA_QUEUE_TIMEOUT_URL',
      );

      // Format phone number (remove leading zero, add 254)
      const formattedPhone = this.formatPhoneNumber(request.phoneNumber);

      const payload = {
        InitiatorName: initiatorName,
        SecurityCredential: initiatorPassword,
        CommandID: 'BusinessPayment',
        Amount: Math.round(request.amount), // Must be whole number
        PartyA: shortcode,
        PartyB: formattedPhone,
        Remarks: request.remarks,
        QueueTimeOutURL: queueTimeoutUrl,
        ResultURL: resultUrl,
        Occasion: request.occasion,
      };

      this.logger.log(`Initiating B2C payment to ${formattedPhone}`);

      const response = await this.apiClient.post(
        '/mpesa/b2c/v1/paymentrequest',
        payload,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      this.logger.log(
        `B2C payment initiated successfully: ${response.data.ConversationID}`,
      );

      return response.data;
    } catch (error) {
      this.logger.error('Failed to initiate B2C payment', error);

      if (error.response) {
        this.logger.error('M-Pesa API Error:', error.response.data);
        throw new Error(
          `M-Pesa API Error: ${error.response.data.errorMessage || error.response.data.ResponseDescription}`,
        );
      }

      throw new Error('Failed to initiate M-Pesa payment');
    }
  }

  /**
   * Process B2C callback result
   * Called by Safaricom when payment completes or fails
   */
  async processB2CCallback(callbackData: B2CCallbackResult): Promise<{
    success: boolean;
    transactionId: string;
    mpesaReceiptNumber: string;
    resultDescription: string;
    conversationId: string;
    originatorConversationId: string;
  }> {
    const result = callbackData.Result;

    const success = result.ResultCode === 0;
    const transactionId = result.TransactionID || '';
    const resultDescription = result.ResultDesc;
    const conversationId = result.ConversationID;
    const originatorConversationId = result.OriginatorConversationID;

    // Extract M-Pesa receipt number from result parameters
    let mpesaReceiptNumber = '';

    if (result.ResultParameters?.ResultParameter) {
      const receiptParam = result.ResultParameters.ResultParameter.find(
        (param) => param.Key === 'TransactionReceipt',
      );
      mpesaReceiptNumber = receiptParam?.Value || '';
    }

    this.logger.log(
      `B2C Callback received - ConversationID: ${conversationId}, ResultCode: ${result.ResultCode}, Success: ${success}`,
    );

    return {
      success,
      transactionId,
      mpesaReceiptNumber,
      resultDescription,
      conversationId,
      originatorConversationId,
    };
  }

  /**
   * Format phone number to international format (254XXXXXXXXX)
   */
  private formatPhoneNumber(phoneNumber: string): string {
    // Remove all non-digit characters
    let cleaned = phoneNumber.replace(/\D/g, '');

    // Remove leading zero if present
    if (cleaned.startsWith('0')) {
      cleaned = cleaned.substring(1);
    }

    // Add Kenya country code if not present
    if (!cleaned.startsWith('254')) {
      cleaned = '254' + cleaned;
    }

    return cleaned;
  }

  /**
   * Query B2C transaction status
   */
  async queryTransactionStatus(
    transactionId: string,
  ): Promise<any> {
    try {
      const accessToken = await this.getAccessToken();

      const shortcode = this.configService.get<string>('MPESA_SHORTCODE');
      const initiatorName = this.configService.get<string>(
        'MPESA_INITIATOR_NAME',
      );
      const initiatorPassword = this.configService.get<string>(
        'MPESA_INITIATOR_PASSWORD',
      );
      const resultUrl = this.configService.get<string>('MPESA_RESULT_URL');
      const queueTimeoutUrl = this.configService.get<string>(
        'MPESA_QUEUE_TIMEOUT_URL',
      );

      const payload = {
        Initiator: initiatorName,
        SecurityCredential: initiatorPassword,
        CommandID: 'TransactionStatusQuery',
        TransactionID: transactionId,
        PartyA: shortcode,
        IdentifierType: '4',
        ResultURL: resultUrl,
        QueueTimeOutURL: queueTimeoutUrl,
        Remarks: 'Transaction status query',
        Occasion: 'Status check',
      };

      const response = await this.apiClient.post(
        '/mpesa/transactionstatus/v1/query',
        payload,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      return response.data;
    } catch (error) {
      this.logger.error('Failed to query transaction status', error);
      throw new Error('Failed to query M-Pesa transaction status');
    }
  }
}
