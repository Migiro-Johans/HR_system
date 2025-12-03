import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Wallet,
  Calendar,
  Send,
  FileText,
  Settings,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: ('admin' | 'hr' | 'employee')[];
}

const navItems: NavItem[] = [
  {
    name: 'Dashboard',
    path: '/',
    icon: LayoutDashboard,
    roles: ['admin', 'hr', 'employee'],
  },
  {
    name: 'Employees',
    path: '/employees',
    icon: Users,
    roles: ['admin', 'hr'],
  },
  {
    name: 'Payroll',
    path: '/payroll',
    icon: Wallet,
    roles: ['admin', 'hr'],
  },
  {
    name: 'Leave Management',
    path: '/leave',
    icon: Calendar,
    roles: ['admin', 'hr', 'employee'],
  },
  {
    name: 'Disbursements',
    path: '/disbursements',
    icon: Send,
    roles: ['admin', 'hr'],
  },
  {
    name: 'Reports',
    path: '/reports',
    icon: FileText,
    roles: ['admin', 'hr'],
  },
  {
    name: 'My Payslips',
    path: '/my-payslips',
    icon: FileText,
    roles: ['employee'],
  },
  {
    name: 'Settings',
    path: '/settings',
    icon: Settings,
    roles: ['admin', 'hr', 'employee'],
  },
];

export default function Sidebar() {
  const location = useLocation();
  const { user, logout } = useAuth();

  const filteredNavItems = navItems.filter((item) =>
    item.roles.includes(user?.role || 'employee')
  );

  return (
    <div className="flex flex-col h-screen bg-white border-r border-gray-200 w-64">
      {/* Logo */}
      <div className="flex items-center justify-center h-16 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-primary-600">KaziHR</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="px-3 space-y-1">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
                  ${
                    isActive
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User Info */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center mb-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-medium">
              {user?.email.charAt(0).toUpperCase()}
            </div>
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-gray-900">{user?.email}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Logout
        </button>
      </div>
    </div>
  );
}
