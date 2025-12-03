import { useState, useEffect } from 'react';
import { Plus, CheckCircle, XCircle } from 'lucide-react';
import Table from '@/components/common/Table';
import Modal from '@/components/common/Modal';
import Badge from '@/components/common/Badge';
import { leaveApi, employeeApi } from '@/lib/api';
import type { Leave, Employee } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

export default function LeavePage() {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRequestModal, setShowRequestModal] = useState(false);

  useEffect(() => {
    fetchLeaves();
    if (user?.role !== 'employee') {
      fetchEmployees();
    }
  }, []);

  const fetchLeaves = async () => {
    try {
      if (user?.role === 'employee' && user.employeeId) {
        const response = await leaveApi.getByEmployee(user.employeeId);
        setLeaves(response.data);
      } else {
        const response = await leaveApi.getAll();
        setLeaves(response.data);
      }
    } catch (error) {
      toast.error('Failed to fetch leave requests');
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

  const handleApprove = async (id: string) => {
    try {
      await leaveApi.approve(id, user?.id || '');
      toast.success('Leave approved successfully');
      fetchLeaves();
    } catch (error) {
      toast.error('Failed to approve leave');
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt('Please provide a rejection reason:');
    if (!reason) return;

    try {
      await leaveApi.reject(id, reason);
      toast.success('Leave rejected');
      fetchLeaves();
    } catch (error) {
      toast.error('Failed to reject leave');
    }
  };

  const columns = [
    {
      header: 'Employee',
      accessor: (row: Leave) =>
        row.employee
          ? `${row.employee.firstName} ${row.employee.lastName}`
          : 'N/A',
    },
    {
      header: 'Leave Type',
      accessor: 'leaveType' as keyof Leave,
      cell: (value: string) => (
        <Badge variant="info">
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </Badge>
      ),
    },
    {
      header: 'Start Date',
      accessor: 'startDate' as keyof Leave,
      cell: (value: string) => format(new Date(value), 'MMM dd, yyyy'),
    },
    {
      header: 'End Date',
      accessor: 'endDate' as keyof Leave,
      cell: (value: string) => format(new Date(value), 'MMM dd, yyyy'),
    },
    {
      header: 'Working Days',
      accessor: 'workingDays' as keyof Leave,
      cell: (value: number) => `${value} days`,
    },
    {
      header: 'Status',
      accessor: 'status' as keyof Leave,
      cell: (value: string) => {
        const variant =
          value === 'approved'
            ? 'success'
            : value === 'rejected'
            ? 'danger'
            : value === 'cancelled'
            ? 'danger'
            : 'warning';
        return <Badge variant={variant}>{value}</Badge>;
      },
    },
    ...(user?.role !== 'employee'
      ? [
          {
            header: 'Actions',
            accessor: (row: Leave) =>
              row.status === 'pending' ? (
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleApprove(row.id)}
                    className="text-green-600 hover:text-green-800"
                    title="Approve"
                  >
                    <CheckCircle className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleReject(row.id)}
                    className="text-red-600 hover:text-red-800"
                    title="Reject"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <span className="text-gray-400">-</span>
              ),
          },
        ]
      : []),
  ];

  const pendingLeaves = leaves.filter((l) => l.status === 'pending').length;
  const approvedLeaves = leaves.filter((l) => l.status === 'approved').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Leave Management</h1>
          <p className="text-gray-600 mt-1">
            {user?.role === 'employee'
              ? 'Manage your leave requests'
              : 'Review and approve leave requests'}
          </p>
        </div>
        <button
          onClick={() => setShowRequestModal(true)}
          className="btn btn-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          Request Leave
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-sm text-gray-600">Total Requests</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{leaves.length}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">Pending</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">
            {pendingLeaves}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">Approved</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {approvedLeaves}
          </p>
        </div>
        {user?.role === 'employee' && user.employee && (
          <div className="card">
            <p className="text-sm text-gray-600">Leave Balance</p>
            <p className="text-2xl font-bold text-primary-600 mt-1">
              {user.employee.annualLeaveBalance} days
            </p>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="card">
        <Table data={leaves} columns={columns} loading={loading} />
      </div>

      {/* Request Leave Modal */}
      <Modal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        title="Request Leave"
      >
        <LeaveRequestForm
          employees={employees}
          currentUser={user}
          onSuccess={() => {
            setShowRequestModal(false);
            fetchLeaves();
          }}
        />
      </Modal>
    </div>
  );
}

// Leave Request Form
function LeaveRequestForm({
  employees,
  currentUser,
  onSuccess,
}: {
  employees: Employee[];
  currentUser: any;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    employeeId: currentUser?.employeeId || '',
    leaveType: 'annual',
    startDate: '',
    endDate: '',
    reason: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await leaveApi.create(formData);
      toast.success('Leave request submitted successfully');
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit leave request');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {currentUser?.role !== 'employee' && (
        <div>
          <label className="label">Employee</label>
          <select
            value={formData.employeeId}
            onChange={(e) =>
              setFormData({ ...formData, employeeId: e.target.value })
            }
            className="input"
            required
          >
            <option value="">Select Employee</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.firstName} {emp.lastName} ({emp.employeeNumber})
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="label">Leave Type</label>
        <select
          value={formData.leaveType}
          onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
          className="input"
          required
        >
          <option value="annual">Annual Leave</option>
          <option value="sick">Sick Leave</option>
          <option value="maternity">Maternity Leave</option>
          <option value="paternity">Paternity Leave</option>
          <option value="unpaid">Unpaid Leave</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Start Date</label>
          <input
            type="date"
            value={formData.startDate}
            onChange={(e) =>
              setFormData({ ...formData, startDate: e.target.value })
            }
            className="input"
            required
          />
        </div>
        <div>
          <label className="label">End Date</label>
          <input
            type="date"
            value={formData.endDate}
            onChange={(e) =>
              setFormData({ ...formData, endDate: e.target.value })
            }
            className="input"
            required
          />
        </div>
      </div>

      <div>
        <label className="label">Reason (Optional)</label>
        <textarea
          value={formData.reason}
          onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
          className="input"
          rows={3}
        />
      </div>

      <div className="flex justify-end space-x-3">
        <button type="button" className="btn btn-secondary">
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          Submit Request
        </button>
      </div>
    </form>
  );
}
