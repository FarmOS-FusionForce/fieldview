import { Bug, ShieldAlert } from "lucide-react";

interface DiseaseRisk {
  name: string;
  likelihood: "low" | "medium" | "high";
  reason: string;
  earlySigns: string;
  preventiveActions: string[];
}

const getLikelihoodStyles = (level: string) => {
  switch (level) {
    case "high":
      return { color: "text-destructive", bg: "bg-destructive/8", badge: "bg-destructive/15 text-destructive" };
    case "medium":
      return { color: "text-warning", bg: "bg-warning/8", badge: "bg-warning/15 text-warning" };
    default:
      return { color: "text-muted-foreground", bg: "bg-muted/50", badge: "bg-muted text-muted-foreground" };
  }
};

interface Props {
  diseaseRisks?: DiseaseRisk[];
}

const PredictionDiseaseRisks = ({ diseaseRisks }: Props) => {
  if (!diseaseRisks || diseaseRisks.length === 0) return null;

  return (
    <div className="px-4 pb-3">
      <div className="flex items-center gap-1.5 mb-2">
        <Bug className="w-3.5 h-3.5 text-warning" />
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
          Disease Risks
        </p>
      </div>
      <div className="space-y-2">
        {diseaseRisks.map((disease, i) => {
          const styles = getLikelihoodStyles(disease.likelihood);
          return (
            <div key={i} className={`p-3 rounded-xl ${styles.bg} space-y-1.5`}>
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-foreground">{disease.name}</p>
                <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md ${styles.badge}`}>
                  {disease.likelihood} risk
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">{disease.reason}</p>
              {disease.earlySigns && (
                <div className="flex items-start gap-1.5 pt-1">
                  <ShieldAlert className="w-3 h-3 text-warning mt-0.5 flex-shrink-0" />
                  <p className="text-[11px] text-foreground">
                    <span className="font-medium">Look for:</span> {disease.earlySigns}
                  </p>
                </div>
              )}
              {disease.preventiveActions && disease.preventiveActions.length > 0 && (
                <div className="pt-1 border-t border-border/20">
                  <p className="text-[10px] font-medium text-muted-foreground mb-0.5">Prevention:</p>
                  <ul className="space-y-0.5">
                    {disease.preventiveActions.map((action, j) => (
                      <li key={j} className="text-[11px] text-foreground flex items-start gap-1">
                        <span className="text-primary mt-0.5">•</span>
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PredictionDiseaseRisks;
