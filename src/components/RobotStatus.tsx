import { Bot, Battery, Wifi, MapPin } from "lucide-react";

interface RobotStatusProps {
  status: "active" | "idle" | "offline";
  battery: number;
  currentTask?: string;
  location?: string;
  lastUpdate?: string;
}

const RobotStatus = ({ 
  status, 
  battery, 
  currentTask, 
  location,
  lastUpdate 
}: RobotStatusProps) => {
  const getStatusColor = () => {
    switch (status) {
      case "active": return "status-online";
      case "idle": return "status-warning";
      default: return "status-offline";
    }
  };

  const getBatteryColor = () => {
    if (battery > 60) return "text-status-online";
    if (battery > 20) return "text-status-warning";
    return "text-destructive";
  };

  return (
    <div className="data-card animate-fade-in">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
            <Bot className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Field Robot</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={`status-indicator ${getStatusColor()}`} />
              <span className="text-sm text-muted-foreground capitalize">{status}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <Wifi className="w-4 h-4 text-status-online" />
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between py-3 border-t border-border">
          <div className="flex items-center gap-2">
            <Battery className={`w-4 h-4 ${getBatteryColor()}`} />
            <span className="text-sm text-muted-foreground">Battery</span>
          </div>
          <span className="text-sm font-medium text-foreground">{battery}%</span>
        </div>
        
        {currentTask && (
          <div className="flex items-center justify-between py-3 border-t border-border">
            <span className="text-sm text-muted-foreground">Current Task</span>
            <span className="text-sm font-medium text-foreground">{currentTask}</span>
          </div>
        )}
        
        {location && (
          <div className="flex items-center justify-between py-3 border-t border-border">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Location</span>
            </div>
            <span className="text-sm font-medium text-foreground">{location}</span>
          </div>
        )}
        
        {lastUpdate && (
          <p className="text-xs text-muted-foreground pt-2 border-t border-border">
            Last update: {lastUpdate}
          </p>
        )}
      </div>
    </div>
  );
};

export default RobotStatus;
