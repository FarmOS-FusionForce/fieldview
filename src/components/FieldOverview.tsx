import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface FieldData {
  name: string;
  grassHealth: number;
  trend: "up" | "down" | "stable";
  area: string;
}

interface FieldOverviewProps {
  fields: FieldData[];
}

const FieldOverview = ({ fields }: FieldOverviewProps) => {
  const getTrendIcon = (trend: "up" | "down" | "stable") => {
    switch (trend) {
      case "up": return <TrendingUp className="w-4 h-4 text-status-online" />;
      case "down": return <TrendingDown className="w-4 h-4 text-destructive" />;
      default: return <Minus className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getHealthColor = (health: number) => {
    if (health >= 80) return "bg-status-online";
    if (health >= 50) return "bg-status-warning";
    return "bg-destructive";
  };

  return (
    <div className="data-card animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-foreground">Field Overview</h3>
        <span className="text-sm text-muted-foreground">{fields.length} fields</span>
      </div>
      
      <div className="space-y-4">
        {fields.map((field, index) => (
          <div 
            key={field.name}
            className={`flex items-center justify-between py-4 ${
              index !== fields.length - 1 ? "border-b border-border" : ""
            }`}
          >
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h4 className="font-medium text-foreground">{field.name}</h4>
                {getTrendIcon(field.trend)}
              </div>
              <p className="text-xs text-muted-foreground">{field.area}</p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${getHealthColor(field.grassHealth)}`}
                  style={{ width: `${field.grassHealth}%` }}
                />
              </div>
              <span className="text-sm font-medium text-foreground w-10 text-right">
                {field.grassHealth}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FieldOverview;
