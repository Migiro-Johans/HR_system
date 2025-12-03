# KaziHR - Kenyan Compliant HRMS

A comprehensive Human Resource Management System specifically designed for the Kenyan market, fully compliant with the Kenya Employment Act 2007 and Finance Act 2023/24.

## Features

### 1. Payroll Engine
- **SHIF (Social Health Insurance Fund)**: 2.75% of Gross (Minimum Ksh 300)
- **NSSF**: Tier I (up to Ksh 7,000) & Tier II (Ksh 7,001-36,000) at 6% matching
- **Housing Levy**: 1.5% of Gross (Both Employer & Employee)
- **PAYE**: Progressive tax bands with Personal Relief (Ksh 2,400)
  - 0 - 24,000: 10%
  - 24,001 - 32,333: 25%
  - 32,334 - 500,000: 30%
  - 500,001 - 800,000: 32.5%
  - Above 800,000: 35%
- **NITA Levy**: Flat Ksh 50 (Employer cost)

### 2. Leave Management
- Annual Leave (21 days per year)
- Sick Leave (7 days full pay, 7 days half pay)
- Maternity Leave (90 days)
- Paternity Leave (14 days)
- Public Holiday Management (Gazetted holidays excluded from leave days)

### 3. M-Pesa Integration
- Bulk salary disbursement via Safaricom Daraja API
- B2C (Business to Customer) payments
- Callback handling (ResultURL and QueueTimeoutURL)
- Payment status tracking (Pending → Processing → Paid/Failed)

### 4. Statutory Exports
- **KRA iTax P10**: CSV export for monthly PAYE submission
- **P9 Forms**: Annual tax deduction cards
- **NSSF Remittance**: CSV export for NSSF contributions
- **SHIF Remittance**: CSV export for SHIF contributions
- **Payslip PDFs**: Professional payslip generation

## Tech Stack

- **Backend**: NestJS (Node.js/TypeScript)
- **Database**: PostgreSQL with TypeORM
- **API Documentation**: Swagger/OpenAPI
- **PDF Generation**: PDFKit
- **CSV Export**: csv-writer
- **Payment Gateway**: Safaricom Daraja API (M-Pesa)

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   cd HR_system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your configuration:
   ```env
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=your_password
   DB_DATABASE=kazihr_db

   # Application
   NODE_ENV=development
   PORT=3000
   API_PREFIX=api/v1

   # Safaricom Daraja API
   MPESA_CONSUMER_KEY=your_consumer_key
   MPESA_CONSUMER_SECRET=your_consumer_secret
   MPESA_SHORTCODE=your_shortcode
   MPESA_PASSKEY=your_passkey
   MPESA_INITIATOR_NAME=your_initiator_name
   MPESA_INITIATOR_PASSWORD=your_initiator_password
   MPESA_RESULT_URL=https://yourdomain.com/api/v1/disbursement/callback/result
   MPESA_QUEUE_TIMEOUT_URL=https://yourdomain.com/api/v1/disbursement/callback/timeout
   MPESA_ENVIRONMENT=sandbox

   # Security
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRES_IN=24h
   ```

4. **Create the database**
   ```bash
   createdb kazihr_db
   ```

5. **Run migrations**
   ```bash
   npm run migration:run
   ```

6. **Start the application**
   ```bash
   # Development
   npm run start:dev

   # Production
   npm run build
   npm run start:prod
   ```

## API Documentation

Once the application is running, visit:
- **Swagger UI**: http://localhost:3000/api/docs

## API Endpoints

### Employee Management
- `POST /api/v1/employees` - Create employee
- `GET /api/v1/employees` - List all employees
- `GET /api/v1/employees/:id` - Get employee details
- `PATCH /api/v1/employees/:id` - Update employee
- `POST /api/v1/employees/:id/terminate` - Terminate employee

### Payroll
- `POST /api/v1/payroll/generate/:employeeId` - Generate payroll for employee
- `POST /api/v1/payroll/generate-all` - Generate payroll for all employees
- `GET /api/v1/payroll/:id` - Get payroll details
- `GET /api/v1/payroll/month/:month/year/:year` - Get payrolls for month
- `POST /api/v1/payroll/:id/approve` - Approve payroll
- `POST /api/v1/payroll/:id/generate-payslip` - Generate payslip PDF
- `GET /api/v1/payroll/:id/download-payslip` - Download payslip
- `GET /api/v1/payroll/export/p10` - Export KRA P10 CSV
- `GET /api/v1/payroll/export/nssf` - Export NSSF remittance
- `GET /api/v1/payroll/export/shif` - Export SHIF remittance

### Leave Management
- `POST /api/v1/leave` - Create leave request
- `GET /api/v1/leave` - List all leave requests
- `GET /api/v1/leave/:id` - Get leave details
- `GET /api/v1/leave/employee/:employeeId` - Get employee leaves
- `PATCH /api/v1/leave/:id/approve` - Approve leave
- `PATCH /api/v1/leave/:id/reject` - Reject leave
- `PATCH /api/v1/leave/:id/cancel` - Cancel leave

### M-Pesa Disbursement
- `POST /api/v1/disbursement/initiate/:payrollId` - Initiate disbursement
- `POST /api/v1/disbursement/bulk` - Bulk disbursement
- `GET /api/v1/disbursement` - List disbursements
- `GET /api/v1/disbursement/:id` - Get disbursement details
- `POST /api/v1/disbursement/:id/retry` - Retry failed disbursement
- `POST /api/v1/disbursement/callback/result` - M-Pesa callback (internal)
- `POST /api/v1/disbursement/callback/timeout` - M-Pesa timeout (internal)

## Database Schema

### Entities

1. **Employee**
   - Personal information (name, ID, email, phone)
   - KRA PIN, NSSF number, NHIF number
   - Bank details and M-Pesa number
   - Salary components (basic, allowances)
   - Leave balances

2. **Payroll**
   - Employee reference
   - Month and year
   - Salary breakdown
   - Deductions (NSSF, SHIF, Housing Levy, PAYE)
   - Net salary
   - Employer contributions

3. **Leave**
   - Employee reference
   - Leave type (annual, sick, maternity, paternity, unpaid)
   - Date range
   - Working days calculation
   - Approval status

4. **PublicHoliday**
   - Date and name
   - Gazetted status
   - Year reference

5. **Disbursement**
   - Payroll reference
   - M-Pesa details
   - Payment status
   - Callback data

## Kenya Employment Act 2007 Compliance

### Payroll Calculations
- ✅ SHIF contributions as per Finance Act 2023/24
- ✅ NSSF Tier I & II contributions (New rates)
- ✅ Housing Levy (1.5% matching)
- ✅ PAYE with progressive tax bands
- ✅ Personal Relief (Ksh 2,400)
- ✅ NITA Levy (Ksh 50)

### Leave Entitlements
- ✅ Annual Leave: 21 working days per year
- ✅ Sick Leave: 7 days full pay + 7 days half pay
- ✅ Maternity Leave: 3 months (90 days)
- ✅ Paternity Leave: 2 weeks (14 days)
- ✅ Public Holidays: Excluded from annual leave

## M-Pesa Daraja API Setup

1. **Register for Daraja API**
   - Visit: https://developer.safaricom.co.ke
   - Create an app and obtain Consumer Key & Secret

2. **Set up test credentials** (Sandbox)
   - Use sandbox environment for testing
   - Get test initiator credentials

3. **Configure callbacks**
   - Set ResultURL and QueueTimeoutURL in your .env
   - Ensure your server is publicly accessible (use ngrok for testing)

4. **Go live**
   - Submit app for production approval
   - Update credentials and set MPESA_ENVIRONMENT=production

## Development

### Running Tests
```bash
npm run test
```

### Building for Production
```bash
npm run build
```

### Database Migrations
```bash
# Generate migration
npm run migration:generate -- src/migrations/MigrationName

# Run migrations
npm run migration:run

# Revert migration
npm run migration:revert
```

## Project Structure

```
HR_system/
├── src/
│   ├── config/
│   │   └── typeorm.config.ts
│   ├── entities/
│   │   ├── employee.entity.ts
│   │   ├── payroll.entity.ts
│   │   ├── leave.entity.ts
│   │   ├── public-holiday.entity.ts
│   │   └── disbursement.entity.ts
│   ├── modules/
│   │   ├── employee/
│   │   ├── payroll/
│   │   ├── leave/
│   │   └── disbursement/
│   ├── services/
│   │   ├── payroll-calculator.service.ts
│   │   ├── leave-calculator.service.ts
│   │   ├── mpesa.service.ts
│   │   ├── payslip-generator.service.ts
│   │   └── kra-export.service.ts
│   ├── app.module.ts
│   └── main.ts
├── uploads/
│   ├── payslips/
│   └── kra-exports/
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

## Support

For issues, questions, or contributions, please open an issue in the repository.

## License

UNLICENSED - Proprietary Software

## Acknowledgments

- Kenya Revenue Authority (KRA)
- National Social Security Fund (NSSF)
- Social Health Insurance Fund (SHIF)
- Safaricom Daraja API

---

Built with ❤️ for Kenyan businesses
