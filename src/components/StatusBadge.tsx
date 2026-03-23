interface StatusBadgeProps {
  status: string;
  variant?: string | "default" | "success" | "warning" | "destructive" | "info";
  color?: string;
  className?: string;
}

const variantClasses = {
  default: "bg-secondary text-secondary-foreground",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  destructive: "bg-destructive/10 text-destructive",
  info: "bg-primary/10 text-primary",
};

const StatusBadge = ({ status, variant = "default", color, className = "" }: StatusBadgeProps) => (
  <span 
    className={`inline-flex items-center px-1.5 py-0.5 text-[11px] font-medium rounded-sm ${variantClasses[variant as keyof typeof variantClasses] || variantClasses.default} ${className}`}
    style={color ? { backgroundColor: `${color}15`, color: color } : {}}
  >
    {status}
  </span>
);

export default StatusBadge;
