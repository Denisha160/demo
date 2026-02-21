import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon?: ReactNode;
}

const StatCard = ({ title, value, change, changeType = "neutral", icon }: StatCardProps) => {
  const changeColor = {
    positive: "text-success",
    negative: "text-destructive",
    neutral: "text-muted-foreground",
  }[changeType];

  return (
    <div className="shadow-card border border-border bg-card p-3 rounded-sm hover:shadow-card-hover transition-shadow">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-muted-foreground font-medium">{title}</span>
        {icon && <span className="text-muted-foreground">{icon}</span>}
      </div>
      <div className="text-xl font-semibold text-foreground">{value}</div>
      {change && (
        <span className={`text-sm ${changeColor}`}>{change}</span>
      )}
    </div>
  );
};

export default StatCard;
