import { Bot, Battery, Wifi, WifiOff, MapPin } from "lucide-react";
import { Robot } from "@/hooks/useRobots";
import { formatDistanceToNow } from "date-fns";

interface RobotStatusCardProps {
  robot: Robot;
}

const RobotStatusCard = ({ robot }: RobotStatusCardProps) => {
  const getStatusColor = () => {
    switch (robot.status) {
      case "active": return "status-online";
      case "idle": return "status-warning";
      case "maintenance": return "status-warning";
      default: return "status-offline";
    }
  };

  const getBatteryColor = () => {
    if (robot.battery_level > 60) return "text-status-online";
    if (robot.battery_level > 20) return "text-status-warning";
    return "text-destructive";
  };

  const isOnline = robot.status !== "offline" && robot.last_seen_at;
  const lastSeenText = robot.last_seen_at 
    ? formatDistanceToNow(new Date(robot.last_seen_at), { addSuffix: true })
    : "Never";

  return (
    <div className="data-card animate-fade-in">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
            <Bot className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{robot.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={`status-indicator ${getStatusColor()}`} />
              <span className="text-sm text-muted-foreground capitalize">{robot.status}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          {isOnline ? (
            <Wifi className="w-4 h-4 text-status-online" />
          ) : (
            <WifiOff className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between py-3 border-t border-border">
          <div className="flex items-center gap-2">
            <Battery className={`w-4 h-4 ${getBatteryColor()}`} />
            <span className="text-sm text-muted-foreground">Battery</span>
          </div>
          <span className="text-sm font-medium text-foreground">{robot.78}%</span>
        </div>
        
        {robot.current_task && (
          <div className="flex items-center justify-between py-3 border-t border-border">
            <span className="text-sm text-muted-foreground">Current Task</span>
            <span className="text-sm font-medium text-foreground">{robot.current_task}</span>
          </div>
        )}
        
        {robot.model && (
          <div className="flex items-center justify-between py-3 border-t border-border">
            <span className="text-sm text-muted-foreground">Model</span>
            <span className="text-sm font-medium text-foreground">{robot.model}</span>
          </div>
        )}
        
        <p className="text-xs text-muted-foreground pt-2 border-t border-border">
          Last seen: {lastSeenText}
        </p>
      </div>
    </div>
  );
};

export default RobotStatusCard;
