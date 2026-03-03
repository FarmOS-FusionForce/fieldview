import { Wheat, CheckCircle2 } from "lucide-react";

interface HarvestGuidance {
  estimatedWindow: string;
  signsToLookFor: string[];
  recommendation: string;
}

interface Props {
  harvestGuidance?: HarvestGuidance;
}

const PredictionHarvest = ({ harvestGuidance }: Props) => {
  if (!harvestGuidance) return null;

  return (
    <div className="px-4 pb-3">
      <div className="flex items-center gap-1.5 mb-2">
        <Wheat className="w-3.5 h-3.5 text-primary" />
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
          Harvest Guidance
        </p>
      </div>
      <div className="p-3 bg-accent/40 rounded-xl space-y-2">
        <div>
          <p className="text-[10px] text-muted-foreground">Estimated Window</p>
          <p className="text-xs font-bold text-foreground">{harvestGuidance.estimatedWindow}</p>
        </div>
        {harvestGuidance.signsToLookFor && harvestGuidance.signsToLookFor.length > 0 && (
          <div className="pt-1 border-t border-border/20">
            <p className="text-[10px] font-medium text-muted-foreground mb-1">Signs to look for:</p>
            <ul className="space-y-0.5">
              {harvestGuidance.signsToLookFor.map((sign, i) => (
                <li key={i} className="text-[11px] text-foreground flex items-start gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
                  {sign}
                </li>
              ))}
            </ul>
          </div>
        )}
        <p className="text-[11px] text-muted-foreground italic pt-1 border-t border-border/20">
          {harvestGuidance.recommendation}
        </p>
      </div>
    </div>
  );
};

export default PredictionHarvest;
