import { useState, useEffect } from 'react';
import { Plus, Edit, UserX, Download } from 'lucide-react';
import Table from '@/components/common/Table';
import Modal from '@/components/common/Modal';
import Badge from '@/components/common/Badge';
import { employeeApi } from '@/lib/api';
import type { Employee } from '@/types';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await employeeApi.getAll();
      setEmployees(response.data);
    } catch (error) {
      toast.error('Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmployee = () => {
    setSelectedEmployee(null);
    setShowAddModal(true);
  };

  const handleEditEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowAddModal(true);
  };

  const columns = [
    {
      header: 'Employee #',
      accessor: 'employeeNumber' as keyof Employee,
    },
    {
      header: 'Name',
      accessor: (row: Employee) => `${row.firstName} ${row.lastName}`,
    },
    {
      header: 'Email',
      accessor: 'email' as keyof Employee,
    },
    {
      header: 'KRA PIN',
      accessor: 'kraPin' as keyof Employee,
    },
    {
      header: 'Basic Salary',
      accessor: 'basicSalary' as keyof Employee,
      cell: (value: number) => `KES ${value.toLocaleString()}`,
    },
    {
      header: 'Status',
      accessor: 'status' as keyof Employee,
      cell: (value: string) => {
        const variant =
          value === 'active'
            ? 'success'
            : value === 'suspended'
            ? 'warning'
            : 'danger';
        return <Badge variant={variant}>{value}</Badge>;
      },
    },
    {
      header: 'Date Joined',
      accessor: 'dateJoined' as keyof Employee,
      cell: (value: string) => format(new Date(value), 'MMM dd, yyyy'),
    },
    {
      header: 'Actions',
      accessor: (row: Employee) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleEditEmployee(row)}
            className="text-primary-600 hover:text-primary-800"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleTerminate(row.id)}
            className="text-red-600 hover:text-red-800"
          >
            <UserX className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const handleTerminate = async (id: string) => {
    if (confirm('Are you sure you want to terminate this employee?')) {
      try {
        await employeeApi.terminate(id, new Date().toISOString());
        toast.success('Employee terminated successfully');
        fetchEmployees();
      } catch (error) {
        toast.error('Failed to terminate employee');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Employees</h1>
          <p className="text-gray-600 mt-1">
            Manage your organization's employees
          </p>
        </div>
        <div className="flex space-x-3">
          <button className="btn btn-secondary">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
          <button onClick={handleAddEmployee} className="btn btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            Add Employee
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-sm text-gray-600">Total Employees</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {employees.length}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">Active</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {employees.filter((e) => e.status === 'active').length}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">Suspended</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">
            {employees.filter((e) => e.status === 'suspended').length}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">Terminated</p>
          <p className="text-2xl font-bold text-red-600 mt-1">
            {employees.filter((e) => e.status === 'terminated').length}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <Table data={employees} columns={columns} loading={loading} />
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={selectedEmployee ? 'Edit Employee' : 'Add New Employee'}
        size="xl"
      >
        <EmployeeForm
          employee={selectedEmployee}
          onSuccess={() => {
            setShowAddModal(false);
            fetchEmployees();
          }}
        />
      </Modal>
    </div>
  );
}

// Employee Form Component
function EmployeeForm({
  employee,
  onSuccess,
}: {
  employee: Employee | null;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    employeeNumber: employee?.employeeNumber || '',
    firstName: employee?.firstName || '',
    lastName: employee?.lastName || '',
    email: employee?.email || '',
    phoneNumber: employee?.phoneNumber || '',
    idNumber: employee?.idNumber || '',
    kraPin: employee?.kraPin || '',
    nssfNumber: employee?.nssfNumber || '',
    mpesaNumber: employee?.mpesaNumber || '',
    basicSalary: employee?.basicSalary || 0,
    houseAllowance: employee?.houseAllowance || 0,
    commuterAllowance: employee?.commuterAllowance || 0,
    airtimeAllowance: employee?.airtimeAllowance || 0,
    dateJoined: employee?.dateJoined || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (employee) {
        await employeeApi.update(employee.id, formData);
        toast.success('Employee updated successfully');
      } else {
        await employeeApi.create(formData);
        toast.success('Employee created successfully');
      }
      onSuccess();
    } catch (error) {
      toast.error('Failed to save employee');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Employee Number</label>
          <input
            type="text"
            name="employeeNumber"
            value={formData.employeeNumber}
            onChange={handleChange}
            className="input"
            required
          />
        </div>
        <div>
          <label className="label">Date Joined</label>
          <input
            type="date"
            name="dateJoined"
            value={formData.dateJoined}
            onChange={handleChange}
            className="input"
            required
          />
        </div>
        <div>
          <label className="label">First Name</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className="input"
            required
          />
        </div>
        <div>
          <label className="label">Last Name</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className="input"
            required
          />
        </div>
        <div>
          <label className="label">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="input"
            required
          />
        </div>
        <div>
          <label className="label">Phone Number</label>
          <input
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            className="input"
            required
          />
        </div>
        <div>
          <label className="label">ID Number</label>
          <input
            type="text"
            name="idNumber"
            value={formData.idNumber}
            onChange={handleChange}
            className="input"
            required
          />
        </div>
        <div>
          <label className="label">KRA PIN</label>
          <input
            type="text"
            name="kraPin"
            value={formData.kraPin}
            onChange={handleChange}
            className="input"
            required
          />
        </div>
        <div>
          <label className="label">NSSF Number</label>
          <input
            type="text"
            name="nssfNumber"
            value={formData.nssfNumber}
            onChange={handleChange}
            className="input"
          />
        </div>
        <div>
          <label className="label">M-Pesa Number</label>
          <input
            type="tel"
            name="mpesaNumber"
            value={formData.mpesaNumber}
            onChange={handleChange}
            className="input"
          />
        </div>
      </div>

      <div className="border-t pt-4">
        <h3 className="text-lg font-semibold mb-4">Salary Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Basic Salary (KES)</label>
            <input
              type="number"
              name="basicSalary"
              value={formData.basicSalary}
              onChange={handleChange}
              className="input"
              required
            />
          </div>
          <div>
            <label className="label">House Allowance (KES)</label>
            <input
              type="number"
              name="houseAllowance"
              value={formData.houseAllowance}
              onChange={handleChange}
              className="input"
            />
          </div>
          <div>
            <label className="label">Commuter Allowance (KES)</label>
            <input
              type="number"
              name="commuterAllowance"
              value={formData.commuterAllowance}
              onChange={handleChange}
              className="input"
            />
          </div>
          <div>
            <label className="label">Airtime Allowance (KES)</label>
            <input
              type="number"
              name="airtimeAllowance"
              value={formData.airtimeAllowance}
              onChange={handleChange}
              className="input"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button type="button" className="btn btn-secondary">
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          {employee ? 'Update Employee' : 'Add Employee'}
        </button>
      </div>
    </form>
  );
}
