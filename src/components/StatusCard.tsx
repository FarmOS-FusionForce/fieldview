import { LucideIcon } from "lucide-react";

interface StatusCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  status?: "online" | "offline" | "warning";
  subtitle?: string;
  compact?: boolean;
}

const StatusCard = ({ 
  title, 
  value, 
  unit, 
  icon: Icon, 
  status,
  subtitle,
  compact = false
}: StatusCardProps) => {
  return (
    <div className="premium-card p-3.5 animate-fade-in">
      <div className="flex items-center justify-between mb-2.5">
        <div className="w-9 h-9 rounded-xl bg-primary/8 flex items-center justify-center">
          <Icon className="w-4 h-4 text-primary" />
        </div>
        {status && (
          <span className={`status-indicator ${
            status === "online" ? "status-online" : 
            status === "warning" ? "status-warning" : 
            "status-offline"
          }`} />
        )}
      </div>
      
      <p className="data-label mb-0.5">{title}</p>
      <p className="text-xl font-bold text-foreground tracking-tight">
        {value}
        {unit && <span className="text-xs text-muted-foreground font-medium ml-0.5">{unit}</span>}
      </p>
      {subtitle && (
        <p className="text-[10px] text-muted-foreground mt-0.5 font-medium">{subtitle}</p>
      )}
    </div>
  );
};

export default StatusCard;
