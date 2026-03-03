import { Database, Wifi, Server, Clock } from "lucide-react";

interface SystemStatusProps {
  lastSync: string;
  dataPoints: number;
  uptime: string;
}

const SystemStatus = ({ lastSync, dataPoints, uptime }: SystemStatusProps) => {
  return (
    <div className="bg-accent/50 border border-border rounded-lg p-4 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="status-indicator status-online" />
            <span className="text-sm text-muted-foreground">System Online</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Wifi className="w-4 h-4 text-status-online" />
            <span className="text-sm text-muted-foreground">Robot Connected</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{dataPoints.toLocaleString()} data points</span>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Uptime: {uptime}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Last sync: {lastSync}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemStatus;
