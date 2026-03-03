import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import MobileLayout from "@/components/MobileLayout";
import MobileHeader from "@/components/MobileHeader";
import BottomNav from "@/components/BottomNav";
import { useField, useZones, useCreateZone } from "@/hooks/useFields";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Plus, MapPin, Ruler, Leaf, Sprout } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const FieldDetail = () => {
  const { fieldId } = useParams<{ fieldId: string }>();
  const { data: field, isLoading: fieldLoading } = useField(fieldId);
  const { data: zones, isLoading: zonesLoading } = useZones(fieldId);
  const createZone = useCreateZone();
  const { toast } = useToast();
  
  const [open, setOpen] = useState(false);
  const [zoneName, setZoneName] = useState("");
  const [zoneArea, setZoneArea] = useState("");
  const [grassType, setGrassType] = useState("");

  const isLoading = fieldLoading || zonesLoading;

  const handleCreateZone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fieldId) return;
    try {
      await createZone.mutateAsync({
        field_id: fieldId,
        name: zoneName,
        area_hectares: zoneArea ? parseFloat(zoneArea) : undefined,
        grass_type: grassType || undefined,
      });
      toast({ title: "Zone created", description: `${zoneName} has been added.` });
      setOpen(false);
      setZoneName(""); setZoneArea(""); setGrassType("");
    } catch {
      toast({ title: "Failed to create zone", variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <MobileLayout>
        <MobileHeader />
        <main className="p-4 pb-24">
          <Skeleton className="h-8 w-32 mb-4 rounded-xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </main>
        <BottomNav />
      </MobileLayout>
    );
  }

  if (!field) {
    return (
      <MobileLayout>
        <MobileHeader />
        <main className="p-4 pb-24">
          <Link to="/fields">
            <Button variant="ghost" size="sm" className="mb-4 rounded-xl">
              <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
            </Button>
          </Link>
          <div className="premium-card p-8 text-center">
            <p className="text-sm text-muted-foreground">Field not found</p>
          </div>
        </main>
        <BottomNav />
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <MobileHeader />
      <main className="px-4 pt-4 pb-24">
        <Link to="/fields">
          <Button variant="ghost" size="sm" className="mb-3 -ml-2 rounded-xl text-xs">
            <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back
          </Button>
        </Link>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-xl gradient-primary flex items-center justify-center">
            <Leaf className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">{field.name}</h1>
            {field.location && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="w-2.5 h-2.5" /> {field.location}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5 mb-5">
          <div className="premium-card p-3.5">
            <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
              <Ruler className="w-3.5 h-3.5" />
              <span className="text-[10px] font-medium">Area</span>
            </div>
            <p className="text-base font-bold">{field.area_hectares ? `${field.area_hectares} ha` : "—"}</p>
          </div>
          <div className="premium-card p-3.5">
            <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
              <Sprout className="w-3.5 h-3.5" />
              <span className="text-[10px] font-medium">Zones</span>
            </div>
            <p className="text-base font-bold">{zones?.length || 0}</p>
          </div>
        </div>

        {/* Zones */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Zones & Crops
            </h2>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="rounded-xl h-8 text-xs">
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-2xl">
                <DialogHeader>
                  <DialogTitle className="text-base">Add Zone to {field.name}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateZone} className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="zone-name" className="text-xs">Zone Name</Label>
                    <Input id="zone-name" value={zoneName} onChange={(e) => setZoneName(e.target.value)} placeholder="Section A" required className="rounded-xl h-10" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="zone-area" className="text-xs">Area (hectares)</Label>
                    <Input id="zone-area" type="number" step="0.01" value={zoneArea} onChange={(e) => setZoneArea(e.target.value)} placeholder="2.5" className="rounded-xl h-10" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="grass-type" className="text-xs">Crop / Type</Label>
                    <Input id="grass-type" value={grassType} onChange={(e) => setGrassType(e.target.value)} placeholder="Tomato, Wheat, etc." className="rounded-xl h-10" />
                  </div>
                  <Button type="submit" className="w-full rounded-xl h-10" disabled={createZone.isPending}>
                    {createZone.isPending ? "Creating..." : "Create Zone"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          
          {zones?.length === 0 ? (
            <div className="premium-card p-6 text-center">
              <p className="text-xs text-muted-foreground">No zones defined yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {zones?.map((zone) => (
                <div key={zone.id} className="premium-card p-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                        <Sprout className="w-4 h-4 text-accent-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{zone.name}</p>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                          {zone.area_hectares && <span>{zone.area_hectares} ha</span>}
                          {zone.grass_type && <span>• {zone.grass_type}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <BottomNav />
    </MobileLayout>
  );
};

export default FieldDetail;
