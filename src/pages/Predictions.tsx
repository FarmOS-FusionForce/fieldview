import { useState, useEffect } from "react";
import MobileLayout from "@/components/MobileLayout";
import MobileHeader from "@/components/MobileHeader";
import BottomNav from "@/components/BottomNav";
import { useFarmPreferences } from "@/hooks/useLocalStorage";
import PredictionCard from "@/components/PredictionCard";
import CropChatBot from "@/components/CropChatBot";
import { Skeleton } from "@/components/ui/skeleton";
import { Brain, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { functions } from "@/integrations/firebase/client";
import { httpsCallable } from "firebase/functions";
import { useToast } from "@/hooks/use-toast";

export interface CropPrediction {
  cropId: string;
  cropName: string;
  growthStage: string;
  growthPercentage: number;
  daysToHarvest: number;
  harvestWindow: string;
  healthScore: number;
  confidenceLevel: "high" | "medium" | "low";
  confidenceReason: string;
  status: string;
  reason: string;
  action: string;
  nextStage?: { name: string; estimatedDays: number; description: string };
  assumptions: string[];
  risks: Array<{ type: string; severity: string; message: string }>;
  diseaseRisks?: Array<{
    name: string;
    likelihood: "low" | "medium" | "high";
    reason: string;
    earlySigns: string;
    preventiveActions: string[];
  }>;
  irrigationAdvice?: {
    recommendedMethod: string;
    bestTime: string;
    frequencyAdvice: string;
    adjustment: string;
  };
  harvestGuidance?: {
    estimatedWindow: string;
    signsToLookFor: string[];
    recommendation: string;
  };
  optimalActions: string[];
  reminders?: Array<{ timing: string; action: string }>;
}

export interface WeatherAlert {
  type: string;
  severity: string;
  title: string;
  message: string;
}

const Predictions = () => {
  const [preferences] = useFarmPreferences();
  const [predictions, setPredictions] = useState<CropPrediction[]>([]);
  const [weatherAlerts, setWeatherAlerts] = useState<WeatherAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPredictions();
  }, [
    preferences.selectedCrops,
    preferences.location,
    preferences.cropDetails,
  ]);

  const fetchPredictions = async () => {
    if (preferences.selectedCrops.length === 0) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const call = httpsCallable(functions, "predictive-ai");
      const res = await call({
        crops: preferences.selectedCrops,
        cropDetails: preferences.cropDetails || {},
        location: preferences.location,
        locationName: preferences.locationName,
      });
      setPredictions(res.data?.predictions || []);
      setWeatherAlerts(res.data?.weatherAlerts || []);
    } catch (error: any) {
      console.error("Failed to fetch predictions:", error);
      const msg = error?.message || "Failed to load predictions";
      toast({
        title: "Prediction Error",
        description: msg,
        variant: "destructive",
      });
      setPredictions([]);
    }
    setIsLoading(false);
  };

  if (preferences.selectedCrops.length === 0) {
    return (
      <MobileLayout>
        <MobileHeader />
        <main className="p-4 pb-24">
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/8 flex items-center justify-center mb-4">
              <Brain className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-lg font-bold mb-1.5">No Crops Selected</h2>
            <p className="text-sm text-muted-foreground max-w-[240px]">
              Select crops in settings to get AI-powered predictions.
            </p>
          </div>
        </main>
        <BottomNav />
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <MobileHeader />
      <main className="px-4 pt-4 pb-24 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <Brain className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground tracking-tight">
                AI Predictions
              </h1>
              <p className="text-xs text-muted-foreground">
                {predictions.length} crops analyzed
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="icon"
            className="rounded-xl h-9 w-9"
            onClick={fetchPredictions}
            disabled={isLoading}
          >
            <RefreshCw
              className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
            />
          </Button>
        </div>

        {/* Weather alerts */}
        {weatherAlerts.length > 0 && (
          <div className="space-y-2">
            {weatherAlerts.map((alert, i) => (
              <div
                key={i}
                className={`premium-card p-3 border-l-4 ${
                  alert.severity === "warning"
                    ? "border-l-warning bg-warning/5"
                    : "border-l-primary bg-primary/5"
                }`}
              >
                <p className="text-xs font-semibold text-foreground">
                  {alert.title}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {alert.message}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Predictions */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-64 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {predictions.map((prediction) => (
              <PredictionCard key={prediction.cropId} prediction={prediction} />
            ))}
          </div>
        )}

        <CropChatBot predictions={predictions} />
      </main>
      <BottomNav />
    </MobileLayout>
  );
};

export default Predictions;
