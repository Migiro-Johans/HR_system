# KaziHR Frontend

Modern, responsive frontend for the KaziHR Kenyan HRMS system.

## Features

- **Role-Based Dashboards**: Separate dashboards for Admin, HR, and Employee roles
- **Employee Management**: Full CRUD operations for employee records
- **Payroll Management**: Generate, approve, and export payroll
- **Leave Management**: Request, approve, and track employee leave
- **M-Pesa Disbursements**: Bulk salary payments via Safaricom Daraja API
- **Real-time Charts**: Interactive dashboards with analytics
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS

## Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Notifications**: React Toastify

## Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start development server**
   ```bash
   npm run dev
   ```

   The app will be available at http://localhost:5173

3. **Build for production**
   ```bash
   npm run build
   ```

4. **Preview production build**
   ```bash
   npm run preview
   ```

## Demo Accounts

For testing purposes, you can use these demo accounts:

- **Admin**: admin@kazihr.co.ke (any password)
- **HR**: hr@kazihr.co.ke (any password)
- **Employee**: employee@kazihr.co.ke (any password)

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── common/         # Reusable components (Table, Modal, Badge, etc.)
│   │   └── Layout/         # Layout components (Sidebar, Header)
│   ├── context/
│   │   └── AuthContext.tsx # Authentication context
│   ├── lib/
│   │   └── api.ts          # API client with Axios
│   ├── pages/
│   │   ├── Dashboard/      # Dashboard pages
│   │   ├── Employees/      # Employee management
│   │   ├── Payroll/        # Payroll management
│   │   ├── Leave/          # Leave management
│   │   └── Disbursements/  # M-Pesa disbursements
│   ├── types/
│   │   └── index.ts        # TypeScript type definitions
│   ├── App.tsx             # Main app component
│   ├── main.tsx            # Entry point
│   └── index.css           # Global styles
├── index.html
├── package.json
├── tailwind.config.js
├── vite.config.ts
└── tsconfig.json
```

## Features by User Role

### Admin Dashboard
- Comprehensive analytics and metrics
- Payroll trend charts
- Department distribution
- Leave type distribution
- Recent activity timeline

### HR Dashboard
- Employee management (add, edit, terminate)
- Payroll generation and approval
- Leave request approval/rejection
- M-Pesa bulk disbursements
- Export statutory reports (P10, NSSF, SHIF)

### Employee Dashboard
- View personal payslips
- Request leave
- Check leave balance
- View leave history

## API Integration

The frontend connects to the backend API at `/api/v1`. Make sure the backend is running on `http://localhost:3000` or update the proxy configuration in `vite.config.ts`.

## Environment Variables

Create a `.env` file in the frontend directory if you need to customize the API URL:

```env
VITE_API_URL=http://localhost:3000/api/v1
```

## Development

- **Linting**: `npm run lint`
- **Type checking**: TypeScript is enabled by default
- **Hot reload**: Vite provides instant HMR

## Production Deployment

1. Build the production bundle:
   ```bash
   npm run build
   ```

2. The optimized files will be in the `dist/` directory

3. Serve using any static file server or deploy to:
   - Vercel
   - Netlify
   - AWS S3 + CloudFront
   - Your own server

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

UNLICENSED - Proprietary Software
