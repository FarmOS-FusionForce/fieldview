import { Bell } from "lucide-react";

interface Reminder {
  timing: string;
  action: string;
}

interface Props {
  reminders?: Reminder[];
}

const PredictionReminders = ({ reminders }: Props) => {
  if (!reminders || reminders.length === 0) return null;

  return (
    <div className="px-4 pb-3">
      <div className="flex items-center gap-1.5 mb-2">
        <Bell className="w-3.5 h-3.5 text-primary" />
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
          Reminders
        </p>
      </div>
      <div className="space-y-1.5">
        {reminders.map((reminder, i) => (
          <div key={i} className="flex items-start gap-2 p-2.5 bg-muted/40 rounded-xl">
            <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-md whitespace-nowrap">
              {reminder.timing}
            </span>
            <p className="text-xs text-foreground">{reminder.action}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PredictionReminders;
