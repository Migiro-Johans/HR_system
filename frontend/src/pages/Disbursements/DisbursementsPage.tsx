import { useState, useEffect } from 'react';
import { Send, RefreshCw } from 'lucide-react';
import Table from '@/components/common/Table';
import Badge from '@/components/common/Badge';
import { disbursementApi, payrollApi } from '@/lib/api';
import type { Disbursement, Payroll } from '@/types';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

export default function DisbursementsPage() {
  const [disbursements, setDisbursements] = useState<Disbursement[]>([]);
  const [approvedPayrolls, setApprovedPayrolls] = useState<Payroll[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayrolls, setSelectedPayrolls] = useState<string[]>([]);

  useEffect(() => {
    fetchDisbursements();
    fetchApprovedPayrolls();
  }, []);

  const fetchDisbursements = async () => {
    try {
      const response = await disbursementApi.getAll();
      setDisbursements(response.data);
    } catch (error) {
      toast.error('Failed to fetch disbursements');
    } finally {
      setLoading(false);
    }
  };

  const fetchApprovedPayrolls = async () => {
    try {
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      const response = await payrollApi.getByMonth(currentMonth, currentYear);
      const approved = response.data.filter((p) => p.status === 'approved');
      setApprovedPayrolls(approved);
    } catch (error) {
      console.error('Failed to fetch payrolls');
    }
  };

  const handleBulkDisbursement = async () => {
    if (selectedPayrolls.length === 0) {
      toast.warning('Please select payrolls to disburse');
      return;
    }

    if (
      !confirm(
        `Initiate M-Pesa disbursement for ${selectedPayrolls.length} employees?`
      )
    ) {
      return;
    }

    try {
      await disbursementApi.bulkInitiate(selectedPayrolls);
      toast.success('Bulk disbursement initiated successfully');
      fetchDisbursements();
      fetchApprovedPayrolls();
      setSelectedPayrolls([]);
    } catch (error) {
      toast.error('Failed to initiate bulk disbursement');
    }
  };

  const handleRetry = async (id: string) => {
    try {
      await disbursementApi.retry(id);
      toast.success('Disbursement retry initiated');
      fetchDisbursements();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to retry disbursement');
    }
  };

  const columns = [
    {
      header: 'Employee',
      accessor: (row: Disbursement) =>
        row.payroll?.employee
          ? `${row.payroll.employee.firstName} ${row.payroll.employee.lastName}`
          : 'N/A',
    },
    {
      header: 'Phone Number',
      accessor: 'phoneNumber' as keyof Disbursement,
    },
    {
      header: 'Amount',
      accessor: 'amount' as keyof Disbursement,
      cell: (value: number) => `KES ${value.toLocaleString()}`,
    },
    {
      header: 'M-Pesa Receipt',
      accessor: 'mpesaReceiptNumber' as keyof Disbursement,
      cell: (value: string) => value || '-',
    },
    {
      header: 'Status',
      accessor: 'status' as keyof Disbursement,
      cell: (value: string) => {
        const variant =
          value === 'completed'
            ? 'success'
            : value === 'processing'
            ? 'info'
            : value === 'failed'
            ? 'danger'
            : 'warning';
        return <Badge variant={variant}>{value}</Badge>;
      },
    },
    {
      header: 'Retry Count',
      accessor: 'retryCount' as keyof Disbursement,
    },
    {
      header: 'Date',
      accessor: 'createdAt' as keyof Disbursement,
      cell: (value: string) => format(new Date(value), 'MMM dd, yyyy HH:mm'),
    },
    {
      header: 'Actions',
      accessor: (row: Disbursement) =>
        row.status === 'failed' ? (
          <button
            onClick={() => handleRetry(row.id)}
            className="text-primary-600 hover:text-primary-800"
            title="Retry"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        ) : (
          <span className="text-gray-400">-</span>
        ),
    },
  ];

  const totalAmount = disbursements.reduce(
    (sum, d) => sum + Number(d.amount),
    0
  );
  const successfulDisbursements = disbursements.filter(
    (d) => d.status === 'completed'
  ).length;
  const failedDisbursements = disbursements.filter(
    (d) => d.status === 'failed'
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            M-Pesa Disbursements
          </h1>
          <p className="text-gray-600 mt-1">
            Manage salary disbursements via M-Pesa
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-sm text-gray-600">Total Disbursements</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {disbursements.length}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">Total Amount</p>
          <p className="text-2xl font-bold text-primary-600 mt-1">
            KES {(totalAmount / 1000000).toFixed(2)}M
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">Successful</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {successfulDisbursements}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">Failed</p>
          <p className="text-2xl font-bold text-red-600 mt-1">
            {failedDisbursements}
          </p>
        </div>
      </div>

      {/* Approved Payrolls for Disbursement */}
      {approvedPayrolls.length > 0 && (
        <div className="card bg-blue-50 border-blue-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Ready for Disbursement
              </h3>
              <p className="text-sm text-blue-700 mb-4">
                {approvedPayrolls.length} approved payrolls are ready for M-Pesa
                disbursement
              </p>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {approvedPayrolls.map((payroll) => (
                  <label
                    key={payroll.id}
                    className="flex items-center space-x-3 p-2 bg-white rounded hover:bg-blue-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedPayrolls.includes(payroll.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedPayrolls([...selectedPayrolls, payroll.id]);
                        } else {
                          setSelectedPayrolls(
                            selectedPayrolls.filter((id) => id !== payroll.id)
                          );
                        }
                      }}
                      className="rounded text-primary-600"
                    />
                    <span className="flex-1 text-sm">
                      {payroll.employee?.firstName} {payroll.employee?.lastName} -{' '}
                      KES {Number(payroll.netSalary).toLocaleString()}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleBulkDisbursement}
              disabled={selectedPayrolls.length === 0}
              className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4 mr-2" />
              Disburse Selected ({selectedPayrolls.length})
            </button>
          </div>
        </div>
      )}

      {/* Disbursements Table */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Disbursement History
        </h3>
        <Table data={disbursements} columns={columns} loading={loading} />
      </div>
    </div>
  );
}
