import { Droplets, Clock, Repeat } from "lucide-react";

interface IrrigationAdvice {
  recommendedMethod: string;
  bestTime: string;
  frequencyAdvice: string;
  adjustment: string;
}

interface Props {
  irrigationAdvice?: IrrigationAdvice;
}

const PredictionIrrigation = ({ irrigationAdvice }: Props) => {
  if (!irrigationAdvice) return null;

  return (
    <div className="px-4 pb-3">
      <div className="flex items-center gap-1.5 mb-2">
        <Droplets className="w-3.5 h-3.5 text-primary" />
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
          Irrigation Guidance
        </p>
      </div>
      <div className="p-3 bg-primary/5 rounded-xl space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-start gap-1.5">
            <Droplets className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-[10px] text-muted-foreground">Method</p>
              <p className="text-xs font-medium text-foreground">{irrigationAdvice.recommendedMethod}</p>
            </div>
          </div>
          <div className="flex items-start gap-1.5">
            <Clock className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-[10px] text-muted-foreground">Best Time</p>
              <p className="text-xs font-medium text-foreground">{irrigationAdvice.bestTime}</p>
            </div>
          </div>
        </div>
        <div className="flex items-start gap-1.5 pt-1 border-t border-border/20">
          <Repeat className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-medium text-foreground">{irrigationAdvice.frequencyAdvice}</p>
            {irrigationAdvice.adjustment && irrigationAdvice.adjustment !== "No adjustment" && (
              <p className="text-[11px] text-muted-foreground mt-0.5">{irrigationAdvice.adjustment}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictionIrrigation;
