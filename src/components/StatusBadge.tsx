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

const StatusBadge = ({
  status,
  variant = "default",
  color,
  className = "",
}: StatusBadgeProps) => (
  <span
    className={`inline-flex items-center px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded border ${
      variantClasses[variant as keyof typeof variantClasses] ||
      variantClasses.default
    } ${className}`}
    style={
      color
        ? {
            backgroundColor: "white",
            color: color,
            borderColor: `${color}40`,
          }
        : {}
    }
  >
    {status}
  </span>
);

export default StatusBadge;
