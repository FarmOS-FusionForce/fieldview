import { useState } from "react";
import { Link } from "react-router-dom";
import MobileLayout from "@/components/MobileLayout";
import MobileHeader from "@/components/MobileHeader";
import BottomNav from "@/components/BottomNav";
import { useFields, useCreateField } from "@/hooks/useFields";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Plus, ChevronRight, Leaf } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Fields = () => {
  const { data: fields, isLoading } = useFields();
  const createField = useCreateField();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [area, setArea] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createField.mutateAsync({
        name,
        area_hectares: area ? parseFloat(area) : undefined,
        location: location || undefined,
      });
      toast({ title: "Field created", description: `${name} has been added.` });
      setOpen(false);
      setName(""); setArea(""); setLocation(""); setNotes("");
    } catch {
      toast({ title: "Failed to create field", variant: "destructive" });
    }
  };

  return (
    <MobileLayout>
      <MobileHeader />
      <main className="px-4 pt-4 pb-24">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-lg font-bold text-foreground tracking-tight">Your Fields</h1>
            <p className="text-xs text-muted-foreground">{fields?.length || 0} fields registered</p>
          </div>
          
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="rounded-xl h-9">
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-base">Add New Field</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-xs">Field Name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="North Field" required className="rounded-xl h-10" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="area" className="text-xs">Area (hectares)</Label>
                  <Input id="area" type="number" step="0.01" value={area} onChange={(e) => setArea(e.target.value)} placeholder="12.5" className="rounded-xl h-10" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="location" className="text-xs">Location</Label>
                  <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Maharashtra, India" className="rounded-xl h-10" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="notes" className="text-xs">Notes (optional)</Label>
                  <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any additional notes..." className="rounded-xl resize-none" rows={2} />
                </div>
                <Button type="submit" className="w-full rounded-xl h-10" disabled={createField.isPending}>
                  {createField.isPending ? "Creating..." : "Create Field"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        
        {isLoading ? (
          <div className="space-y-2.5">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}
          </div>
        ) : fields && fields.length > 0 ? (
          <div className="space-y-2.5">
            {fields.map((field) => (
              <Link key={field.id} to={`/fields/${field.id}`}>
                <div className="premium-card p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center">
                      <Leaf className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">{field.name}</h3>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                        {field.location && (
                          <span className="flex items-center gap-0.5">
                            <MapPin className="w-2.5 h-2.5" />
                            {field.location}
                          </span>
                        )}
                        {field.area_hectares && <span>• {field.area_hectares} ha</span>}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="premium-card p-8 text-center">
            <div className="w-12 h-12 rounded-2xl bg-muted mx-auto mb-3 flex items-center justify-center">
              <Leaf className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground mb-3">No fields registered yet</p>
            <Button className="rounded-xl" onClick={() => setOpen(true)}>
              <Plus className="w-4 h-4 mr-1.5" /> Add Field
            </Button>
          </div>
        )}
      </main>
      <BottomNav />
    </MobileLayout>
  );
};

export default Fields;
