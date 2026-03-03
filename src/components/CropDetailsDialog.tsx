import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CropDetails } from "@/hooks/useLocalStorage";
import {
  Droplets,
  Sprout,
  Calendar,
  Ruler,
  ChevronRight,
} from "lucide-react";

interface CropDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cropId: string;
  cropName: string;
  initialDetails?: CropDetails;
  onSave: (details: CropDetails) => void;
}

const irrigationFrequencies = [
  { value: "daily" as const, label: "Daily" },
  { value: "every-2-3-days" as const, label: "Every 2–3 days" },
  { value: "weekly" as const, label: "Weekly" },
  { value: "custom" as const, label: "Custom" },
];

const irrigationMethods = [
  { value: "drip" as const, label: "Drip" },
  { value: "sprinkler" as const, label: "Sprinkler" },
  { value: "flood" as const, label: "Flood" },
  { value: "other" as const, label: "Other" },
];

const cropStages = [
  { value: "seeded" as const, label: "Seeded" },
  { value: "vegetative" as const, label: "Vegetative" },
  { value: "flowering" as const, label: "Flowering" },
  { value: "fruiting" as const, label: "Fruiting" },
  { value: "not-sure" as const, label: "Not sure" },
];

const CropDetailsDialog = ({
  open,
  onOpenChange,
  cropId,
  cropName,
  initialDetails,
  onSave,
}: CropDetailsDialogProps) => {
  const [details, setDetails] = useState<CropDetails>(
    initialDetails || { cropId }
  );

  const handleSave = () => {
    onSave({ ...details, cropId });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl max-w-sm mx-auto max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base">
            {cropName} — Crop Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Field Area */}
          <div className="space-y-1.5">
            <Label className="text-xs flex items-center gap-1.5">
              <Ruler className="w-3.5 h-3.5 text-primary" />
              Field Area
            </Label>
            <div className="flex gap-2">
              <Input
                type="number"
                step="0.01"
                value={details.fieldArea || ""}
                onChange={(e) =>
                  setDetails({
                    ...details,
                    fieldArea: e.target.value ? parseFloat(e.target.value) : undefined,
                  })
                }
                placeholder="e.g. 5"
                className="rounded-xl h-10 flex-1"
              />
              <div className="flex rounded-xl border border-input overflow-hidden">
                {(["acres", "hectares"] as const).map((unit) => (
                  <button
                    key={unit}
                    type="button"
                    onClick={() => setDetails({ ...details, fieldAreaUnit: unit })}
                    className={`px-3 text-xs font-medium transition-colors ${
                      (details.fieldAreaUnit || "acres") === unit
                        ? "bg-primary text-primary-foreground"
                        : "bg-background text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {unit === "acres" ? "Ac" : "Ha"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Irrigation Frequency */}
          <div className="space-y-1.5">
            <Label className="text-xs flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5 text-primary" />
              Irrigation Frequency
            </Label>
            <div className="grid grid-cols-2 gap-1.5">
              {irrigationFrequencies.map((freq) => (
                <button
                  key={freq.value}
                  type="button"
                  onClick={() =>
                    setDetails({ ...details, irrigationFrequency: freq.value })
                  }
                  className={`p-2.5 rounded-xl border-2 text-xs font-medium transition-all ${
                    details.irrigationFrequency === freq.value
                      ? "border-primary bg-primary/8 text-foreground"
                      : "border-border bg-card text-muted-foreground hover:border-primary/30"
                  }`}
                >
                  {freq.label}
                </button>
              ))}
            </div>
            {details.irrigationFrequency === "custom" && (
              <Input
                value={details.irrigationCustom || ""}
                onChange={(e) =>
                  setDetails({ ...details, irrigationCustom: e.target.value })
                }
                placeholder="e.g. Twice a week"
                className="rounded-xl h-9 text-xs mt-1.5"
              />
            )}
          </div>

          {/* Irrigation Method */}
          <div className="space-y-1.5">
            <Label className="text-xs flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5 text-primary" />
              Irrigation Method
            </Label>
            <div className="grid grid-cols-2 gap-1.5">
              {irrigationMethods.map((method) => (
                <button
                  key={method.value}
                  type="button"
                  onClick={() =>
                    setDetails({ ...details, irrigationMethod: method.value })
                  }
                  className={`p-2.5 rounded-xl border-2 text-xs font-medium transition-all ${
                    details.irrigationMethod === method.value
                      ? "border-primary bg-primary/8 text-foreground"
                      : "border-border bg-card text-muted-foreground hover:border-primary/30"
                  }`}
                >
                  {method.label}
                </button>
              ))}
            </div>
            {details.irrigationMethod === "other" && (
              <Input
                value={details.irrigationMethodCustom || ""}
                onChange={(e) =>
                  setDetails({ ...details, irrigationMethodCustom: e.target.value })
                }
                placeholder="e.g. Canal irrigation"
                className="rounded-xl h-9 text-xs mt-1.5"
              />
            )}
          </div>

          {/* Crop Stage */}
          <div className="space-y-1.5">
            <Label className="text-xs flex items-center gap-1.5">
              <Sprout className="w-3.5 h-3.5 text-primary" />
              Current Crop Stage (if known)
            </Label>
            <div className="flex flex-wrap gap-1.5">
              {cropStages.map((stage) => (
                <button
                  key={stage.value}
                  type="button"
                  onClick={() =>
                    setDetails({ ...details, cropStage: stage.value })
                  }
                  className={`px-3 py-2 rounded-xl border-2 text-xs font-medium transition-all ${
                    details.cropStage === stage.value
                      ? "border-primary bg-primary/8 text-foreground"
                      : "border-border bg-card text-muted-foreground hover:border-primary/30"
                  }`}
                >
                  {stage.label}
                </button>
              ))}
            </div>
          </div>

          {/* Planting Date */}
          <div className="space-y-1.5">
            <Label className="text-xs flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-primary" />
              Planting Date (approximate)
            </Label>
            <Input
              type="date"
              value={details.plantingDate || ""}
              onChange={(e) =>
                setDetails({ ...details, plantingDate: e.target.value })
              }
              className="rounded-xl h-10"
            />
          </div>

          <Button
            onClick={handleSave}
            className="w-full h-11 rounded-xl gradient-primary border-0 text-sm"
          >
            Save Details
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CropDetailsDialog;
