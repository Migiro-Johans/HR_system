export interface Employee {
  id: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  idNumber: string;
  kraPin: string;
  nssfNumber?: string;
  nhifNumber?: string;
  bankName?: string;
  bankAccountNumber?: string;
  mpesaNumber?: string;
  basicSalary: number;
  houseAllowance: number;
  commuterAllowance: number;
  airtimeAllowance: number;
  dateJoined: string;
  dateLeft?: string;
  status: 'active' | 'suspended' | 'terminated';
  annualLeaveBalance: number;
  sickLeaveBalance: number;
  createdAt: string;
  updatedAt: string;
}

export interface Payroll {
  id: string;
  employeeId: string;
  employee?: Employee;
  month: number;
  year: number;
  basicSalary: number;
  houseAllowance: number;
  commuterAllowance: number;
  airtimeAllowance: number;
  grossSalary: number;
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
  employerNssf: number;
  employerHousingLevy: number;
  nitaLevy: number;
  status: 'draft' | 'approved' | 'paid' | 'failed';
  payslipPath?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Leave {
  id: string;
  employeeId: string;
  employee?: Employee;
  leaveType: 'annual' | 'sick' | 'maternity' | 'paternity' | 'unpaid';
  startDate: string;
  endDate: string;
  totalDays: number;
  workingDays: number;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  rejectionReason?: string;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Disbursement {
  id: string;
  payrollId: string;
  payroll?: Payroll;
  phoneNumber: string;
  amount: number;
  conversationId?: string;
  originatorConversationId?: string;
  mpesaReceiptNumber?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  responseDescription?: string;
  errorMessage?: string;
  retryCount: number;
  processedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'hr' | 'employee';
  employeeId?: string;
  employee?: Employee;
}

export interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  pendingLeaves: number;
  monthlyPayroll: number;
  totalDisbursements: number;
  failedDisbursements: number;
}
