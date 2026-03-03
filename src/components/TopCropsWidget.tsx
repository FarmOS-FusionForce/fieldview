import { Leaf, Droplet, Sun, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCrops } from "@/hooks/useCrops";

const TopCropsWidget = () => {
  const { data: crops, isLoading } = useCrops();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  const topCrops = crops?.slice(0, 10) || [];

  const getWaterIcon = (requirement: string | null) => {
    if (!requirement) return null;
    const level = requirement.toLowerCase();
    if (level === "high") return "💧💧💧";
    if (level === "moderate") return "💧💧";
    return "💧";
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <Leaf className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-foreground">Top 10 Profitable Crops</h3>
      </div>

      {topCrops.map((crop, index) => (
        <Card key={crop.id} className="p-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-primary">{index + 1}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-foreground">{crop.name}</h4>
                <span className="text-xs text-muted-foreground">
                  {getWaterIcon(crop.water_requirement)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                {crop.description}
              </p>
              <div className="flex items-center gap-3 mt-2 text-xs">
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  {crop.growing_period}
                </span>
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Sun className="w-3 h-3" />
                  {crop.season}
                </span>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default TopCropsWidget;
