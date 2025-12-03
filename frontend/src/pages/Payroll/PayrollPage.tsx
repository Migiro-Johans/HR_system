import { useState, useEffect } from 'react';
import { Download, CheckCircle, FileText, Calendar } from 'lucide-react';
import Table from '@/components/common/Table';
import Modal from '@/components/common/Modal';
import Badge from '@/components/common/Badge';
import { payrollApi, employeeApi } from '@/lib/api';
import type { Payroll, Employee } from '@/types';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

export default function PayrollPage() {
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchPayrolls();
    fetchEmployees();
  }, [selectedMonth, selectedYear]);

  const fetchPayrolls = async () => {
    try {
      const response = await payrollApi.getByMonth(selectedMonth, selectedYear);
      setPayrolls(response.data);
    } catch (error) {
      toast.error('Failed to fetch payrolls');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await employeeApi.getAll();
      setEmployees(response.data);
    } catch (error) {
      console.error('Failed to fetch employees');
    }
  };

  const handleGenerateAll = async () => {
    try {
      await payrollApi.generateForAll(selectedMonth, selectedYear);
      toast.success('Payroll generated for all employees');
      fetchPayrolls();
      setShowGenerateModal(false);
    } catch (error) {
      toast.error('Failed to generate payroll');
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await payrollApi.approve(id);
      toast.success('Payroll approved successfully');
      fetchPayrolls();
    } catch (error) {
      toast.error('Failed to approve payroll');
    }
  };

  const handleDownloadPayslip = async (id: string) => {
    try {
      const response = await payrollApi.downloadPayslip(id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `payslip_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast.error('Failed to download payslip');
    }
  };

  const handleExportP10 = async () => {
    try {
      const response = await payrollApi.exportP10(selectedMonth, selectedYear);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `KRA_P10_${selectedMonth}_${selectedYear}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('P10 export downloaded successfully');
    } catch (error) {
      toast.error('Failed to export P10');
    }
  };

  const columns = [
    {
      header: 'Employee',
      accessor: (row: Payroll) =>
        row.employee
          ? `${row.employee.firstName} ${row.employee.lastName}`
          : 'N/A',
    },
    {
      header: 'Employee #',
      accessor: (row: Payroll) => row.employee?.employeeNumber || 'N/A',
    },
    {
      header: 'Gross Salary',
      accessor: 'grossSalary' as keyof Payroll,
      cell: (value: number) => `KES ${value.toLocaleString()}`,
    },
    {
      header: 'Deductions',
      accessor: 'totalDeductions' as keyof Payroll,
      cell: (value: number) => `KES ${value.toLocaleString()}`,
    },
    {
      header: 'Net Salary',
      accessor: 'netSalary' as keyof Payroll,
      cell: (value: number) => (
        <span className="font-semibold">KES {value.toLocaleString()}</span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status' as keyof Payroll,
      cell: (value: string) => {
        const variant =
          value === 'paid'
            ? 'success'
            : value === 'approved'
            ? 'info'
            : value === 'failed'
            ? 'danger'
            : 'warning';
        return <Badge variant={variant}>{value}</Badge>;
      },
    },
    {
      header: 'Actions',
      accessor: (row: Payroll) => (
        <div className="flex space-x-2">
          {row.status === 'draft' && (
            <button
              onClick={() => handleApprove(row.id)}
              className="text-green-600 hover:text-green-800"
              title="Approve"
            >
              <CheckCircle className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => handleDownloadPayslip(row.id)}
            className="text-primary-600 hover:text-primary-800"
            title="Download Payslip"
          >
            <FileText className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const totalGross = payrolls.reduce((sum, p) => sum + Number(p.grossSalary), 0);
  const totalNet = payrolls.reduce((sum, p) => sum + Number(p.netSalary), 0);
  const totalDeductions = payrolls.reduce(
    (sum, p) => sum + Number(p.totalDeductions),
    0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payroll Management</h1>
          <p className="text-gray-600 mt-1">
            Generate and manage employee payroll
          </p>
        </div>
        <div className="flex space-x-3">
          <button onClick={handleExportP10} className="btn btn-secondary">
            <Download className="w-4 h-4 mr-2" />
            Export P10
          </button>
          <button
            onClick={() => setShowGenerateModal(true)}
            className="btn btn-primary"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Generate Payroll
          </button>
        </div>
      </div>

      {/* Month/Year Selector */}
      <div className="card">
        <div className="flex items-center space-x-4">
          <div>
            <label className="label">Month</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="input"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {format(new Date(2024, i, 1), 'MMMM')}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="input"
            >
              {Array.from({ length: 5 }, (_, i) => {
                const year = new Date().getFullYear() - 2 + i;
                return (
                  <option key={year} value={year}>
                    {year}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-sm text-gray-600">Total Employees</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {payrolls.length}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">Total Gross</p>
          <p className="text-2xl font-bold text-primary-600 mt-1">
            KES {(totalGross / 1000000).toFixed(2)}M
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">Total Deductions</p>
          <p className="text-2xl font-bold text-red-600 mt-1">
            KES {(totalDeductions / 1000000).toFixed(2)}M
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">Total Net</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            KES {(totalNet / 1000000).toFixed(2)}M
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <Table data={payrolls} columns={columns} loading={loading} />
      </div>

      {/* Generate Modal */}
      <Modal
        isOpen={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        title="Generate Payroll"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Generate payroll for all active employees for {format(new Date(selectedYear, selectedMonth - 1), 'MMMM yyyy')}?
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> This will calculate payroll for{' '}
              {employees.filter((e) => e.status === 'active').length} active
              employees including SHIF, NSSF, Housing Levy, and PAYE deductions.
            </p>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowGenerateModal(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button onClick={handleGenerateAll} className="btn btn-primary">
              Generate Payroll
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
