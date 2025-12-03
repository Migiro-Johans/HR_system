interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'default';
}

export default function Badge({ children, variant = 'default' }: BadgeProps) {
  const variants = {
    success: 'badge-success',
    warning: 'badge-warning',
    danger: 'badge-danger',
    info: 'badge-info',
    default: 'bg-gray-100 text-gray-800',
  };

  return <span className={`badge ${variants[variant]}`}>{children}</span>;
}
