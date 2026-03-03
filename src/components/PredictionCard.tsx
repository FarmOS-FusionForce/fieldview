import { Badge } from "@/components/ui/badge";
import {
  Sprout,
  Calendar,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Info,
  TrendingUp,
  Droplets,
  Bug,
  ArrowRight,
} from "lucide-react";
import type { CropPrediction } from "@/pages/Predictions";
import PredictionGrowthChart from "./prediction/PredictionGrowthChart";
import PredictionDiseaseRisks from "./prediction/PredictionDiseaseRisks";
import PredictionIrrigation from "./prediction/PredictionIrrigation";
import PredictionHarvest from "./prediction/PredictionHarvest";
import PredictionReminders from "./prediction/PredictionReminders";

const growthStages = ["Seeded", "Vegetative", "Flowering", "Fruiting", "Harvest Ready"];

const getStageIndex = (stage: string) => {
  const idx = growthStages.findIndex(
    (s) => s.toLowerCase() === stage.toLowerCase()
  );
  return idx >= 0 ? idx : 1;
};

const getConfidenceStyles = (level: string) => {
  switch (level) {
    case "high":
      return { label: "High", color: "text-primary", bg: "bg-primary/10" };
    case "medium":
      return { label: "Medium", color: "text-warning", bg: "bg-warning/10" };
    default:
      return { label: "Low", color: "text-destructive", bg: "bg-destructive/10" };
  }
};

interface PredictionCardProps {
  prediction: CropPrediction;
}

const PredictionCard = ({ prediction }: PredictionCardProps) => {
  const stageIdx = getStageIndex(prediction.growthStage);
  const stageProgress = ((stageIdx + 1) / growthStages.length) * 100;
  const confidence = getConfidenceStyles(prediction.confidenceLevel);

  return (
    <div className="premium-card overflow-hidden">
      {/* Header */}
      <div className="p-4 pb-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sprout className="w-4 h-4 text-primary" />
            <h3 className="text-base font-bold text-foreground">
              {prediction.cropName}
            </h3>
          </div>
          <Badge
            variant="secondary"
            className={`text-[10px] font-semibold rounded-lg px-2 ${confidence.bg} ${confidence.color} border-0`}
          >
            {confidence.label} Confidence
          </Badge>
        </div>

        {/* Growth Progress */}
        <div className="mb-3">
          <div className="flex justify-between text-[10px] text-muted-foreground mb-1.5">
            {growthStages.map((stage, i) => (
              <span
                key={stage}
                className={i <= stageIdx ? "text-primary font-medium" : ""}
              >
                {stage.split(" ")[0]}
              </span>
            ))}
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full gradient-primary rounded-full transition-all duration-700"
              style={{ width: `${stageProgress}%` }}
            />
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-2.5 bg-muted/50 rounded-xl">
            <Calendar className="w-3.5 h-3.5 mx-auto text-primary mb-1" />
            <p className="text-[10px] text-muted-foreground">Harvest</p>
            <p className="font-bold text-xs truncate">{prediction.harvestWindow || "—"}</p>
          </div>
          <div className="text-center p-2.5 bg-muted/50 rounded-xl">
            <Clock className="w-3.5 h-3.5 mx-auto text-primary mb-1" />
            <p className="text-[10px] text-muted-foreground">Days Left</p>
            <p className="font-bold text-xs">{prediction.daysToHarvest}d</p>
          </div>
          <div className="text-center p-2.5 bg-muted/50 rounded-xl">
            <TrendingUp className="w-3.5 h-3.5 mx-auto text-primary mb-1" />
            <p className="text-[10px] text-muted-foreground">Progress</p>
            <p className="font-bold text-xs">{prediction.growthPercentage}%</p>
          </div>
        </div>
      </div>

      {/* Growth Chart */}
      <PredictionGrowthChart prediction={prediction} />

      {/* Explainable Status */}
      <div className="px-4 pb-3 space-y-2">
        <div className="p-3 bg-accent/40 rounded-xl space-y-1.5">
          <div className="flex items-start gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-foreground">{prediction.status}</p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {prediction.reason}
              </p>
            </div>
          </div>
          {prediction.action && prediction.action !== "No immediate action required" && (
            <div className="flex items-start gap-2 pt-1 border-t border-border/30">
              <Info className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-xs text-foreground">{prediction.action}</p>
            </div>
          )}
        </div>

        {/* Next Stage */}
        {prediction.nextStage && (
          <div className="flex items-center gap-2 p-2.5 bg-primary/5 rounded-xl">
            <ArrowRight className="w-3.5 h-3.5 text-primary flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground">
                Next: {prediction.nextStage.name}
                {prediction.nextStage.estimatedDays > 0 && (
                  <span className="text-muted-foreground font-normal"> — ~{prediction.nextStage.estimatedDays} days</span>
                )}
              </p>
              <p className="text-[11px] text-muted-foreground">{prediction.nextStage.description}</p>
            </div>
          </div>
        )}
      </div>

      {/* Disease Risks */}
      <PredictionDiseaseRisks diseaseRisks={prediction.diseaseRisks} />

      {/* Irrigation Advice */}
      <PredictionIrrigation irrigationAdvice={prediction.irrigationAdvice} />

      {/* Harvest Guidance */}
      <PredictionHarvest harvestGuidance={prediction.harvestGuidance} />

      {/* General risks */}
      {prediction.risks && prediction.risks.length > 0 && (
        <div className="px-4 pb-3 space-y-1.5">
          {prediction.risks.map((risk, i) => (
            <div
              key={i}
              className={`flex items-start gap-2 p-2.5 rounded-xl ${
                risk.severity === "warning"
                  ? "bg-warning/8"
                  : risk.severity === "critical"
                  ? "bg-destructive/8"
                  : "bg-muted/50"
              }`}
            >
              <AlertTriangle
                className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${
                  risk.severity === "warning"
                    ? "text-warning"
                    : risk.severity === "critical"
                    ? "text-destructive"
                    : "text-muted-foreground"
                }`}
              />
              <p className="text-xs text-foreground">{risk.message}</p>
            </div>
          ))}
        </div>
      )}

      {/* Reminders */}
      <PredictionReminders reminders={prediction.reminders} />

      {/* Actions */}
      <div className="px-4 pb-3">
        <div className="flex flex-wrap gap-1.5">
          {prediction.optimalActions?.map((action, i) => (
            <Badge
              key={i}
              variant="outline"
              className="text-[10px] rounded-lg font-medium"
            >
              {action}
            </Badge>
          ))}
        </div>
      </div>

      {/* Assumptions */}
      {prediction.assumptions && prediction.assumptions.length > 0 && (
        <div className="px-4 pb-3">
          <div className="p-2.5 bg-muted/30 rounded-xl">
            <p className="text-[10px] font-semibold text-muted-foreground mb-1 uppercase tracking-wider">
              Assumptions
            </p>
            <ul className="space-y-0.5">
              {prediction.assumptions.map((assumption, i) => (
                <li key={i} className="text-[11px] text-muted-foreground flex items-start gap-1">
                  <span className="text-primary mt-0.5">•</span>
                  {assumption}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Confidence reason footer */}
      <div className="px-4 pb-3">
        <p className="text-[10px] text-muted-foreground italic">
          {prediction.confidenceReason}
        </p>
      </div>
    </div>
  );
};

export default PredictionCard;
