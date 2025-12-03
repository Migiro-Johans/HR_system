import { useEffect, useState } from 'react';
import { Users, Wallet, Calendar, TrendingUp, Send, AlertCircle } from 'lucide-react';
import StatsCard from '@/components/common/StatsCard';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    pendingLeaves: 0,
    monthlyPayroll: 0,
    totalDisbursements: 0,
    failedDisbursements: 0,
  });

  useEffect(() => {
    // Fetch dashboard stats - Mock data for now
    setStats({
      totalEmployees: 156,
      activeEmployees: 148,
      pendingLeaves: 12,
      monthlyPayroll: 8750000,
      totalDisbursements: 145,
      failedDisbursements: 3,
    });
  }, []);

  // Mock data for charts
  const payrollTrend = [
    { month: 'Jul', amount: 7800000 },
    { month: 'Aug', amount: 8100000 },
    { month: 'Sep', amount: 8300000 },
    { month: 'Oct', amount: 8500000 },
    { month: 'Nov', amount: 8750000 },
    { month: 'Dec', amount: 9200000 },
  ];

  const departmentData = [
    { name: 'Engineering', employees: 45, value: 45 },
    { name: 'Sales', employees: 32, value: 32 },
    { name: 'Operations', employees: 28, value: 28 },
    { name: 'Finance', employees: 18, value: 18 },
    { name: 'HR', employees: 12, value: 12 },
    { name: 'Others', employees: 21, value: 21 },
  ];

  const leaveTypeData = [
    { name: 'Annual', value: 45 },
    { name: 'Sick', value: 23 },
    { name: 'Maternity', value: 8 },
    { name: 'Paternity', value: 5 },
    { name: 'Unpaid', value: 3 },
  ];

  const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Overview of your organization's HR metrics
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatsCard
          title="Total Employees"
          value={stats.totalEmployees}
          change="+8% from last month"
          changeType="increase"
          icon={Users}
          iconColor="bg-blue-500"
        />
        <StatsCard
          title="Active Employees"
          value={stats.activeEmployees}
          change={`${stats.totalEmployees - stats.activeEmployees} inactive`}
          changeType="decrease"
          icon={Users}
          iconColor="bg-green-500"
        />
        <StatsCard
          title="Pending Leaves"
          value={stats.pendingLeaves}
          icon={Calendar}
          iconColor="bg-yellow-500"
        />
        <StatsCard
          title="Monthly Payroll"
          value={`KES ${(stats.monthlyPayroll / 1000000).toFixed(2)}M`}
          change="+5.2% from last month"
          changeType="increase"
          icon={Wallet}
          iconColor="bg-primary-500"
        />
        <StatsCard
          title="Disbursements"
          value={stats.totalDisbursements}
          change="This month"
          icon={Send}
          iconColor="bg-purple-500"
        />
        <StatsCard
          title="Failed Payments"
          value={stats.failedDisbursements}
          change="Requires attention"
          changeType="decrease"
          icon={AlertCircle}
          iconColor="bg-red-500"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payroll Trend */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Payroll Trend (6 Months)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={payrollTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip
                formatter={(value: number) => `KES ${(value / 1000000).toFixed(2)}M`}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#22c55e"
                strokeWidth={2}
                name="Payroll Amount"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Department Distribution */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Employees by Department
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={departmentData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="employees" fill="#22c55e" name="Employees" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Leave Types Distribution */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Leave Requests by Type
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={leaveTypeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {leaveTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Activities */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Activities
          </h3>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm text-gray-900">
                  Payroll generated for November 2024
                </p>
                <p className="text-xs text-gray-500">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm text-gray-900">
                  12 leave requests pending approval
                </p>
                <p className="text-xs text-gray-500">5 hours ago</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2"></div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm text-gray-900">New employee onboarded</p>
                <p className="text-xs text-gray-500">1 day ago</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-2 h-2 rounded-full bg-red-500 mt-2"></div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm text-gray-900">
                  3 M-Pesa disbursements failed
                </p>
                <p className="text-xs text-gray-500">1 day ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
