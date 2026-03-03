import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MobileLayout from "@/components/MobileLayout";
import MobileHeader from "@/components/MobileHeader";
import BottomNav from "@/components/BottomNav";
import { useFarmPreferences } from "@/hooks/useLocalStorage";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { CropDetails } from "@/hooks/useLocalStorage";
import CropDetailsDialog from "@/components/CropDetailsDialog";
import { useAuth } from "@/hooks/useAuth";
import { useValidateRoverKey } from "@/hooks/useRoverData";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Settings as SettingsIcon,
  MapPin,
  Bell,
  Leaf,
  RefreshCw,
  Trash2,
  Plus,
  Pencil,
  Bot,
  Key,
  CheckCircle2,
  XCircle,
  LogOut,
  CloudRain,
  Thermometer,
  AlertTriangle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const cropOptions = [
  { id: "banana", name: "Banana", icon: "🍌" },
  { id: "brinjal", name: "Brinjal", icon: "🍆" },
  { id: "chilli", name: "Chilli", icon: "🌶️" },
  { id: "cabbage", name: "Cabbage", icon: "🥬" },
  { id: "barley", name: "Barley", icon: "🌾" },
  { id: "apple", name: "Apple", icon: "🍎" },
  { id: "tomato", name: "Tomato", icon: "🍅" },
  { id: "onion", name: "Onion", icon: "🧅" },
  { id: "potato", name: "Potato", icon: "🥔" },
  { id: "rice", name: "Rice", icon: "🌾" },
  { id: "wheat", name: "Wheat", icon: "🌾" },
  { id: "corn", name: "Corn", icon: "🌽" },
];

const Settings = () => {
  const [preferences, setPreferences] = useFarmPreferences();
  const [selectedCrops, setSelectedCrops] = useState<string[]>(preferences.selectedCrops);
  const [customCrop, setCustomCrop] = useState("");
  const [editingCrop, setEditingCrop] = useState<string | null>(null);
  const [roverApiKey, setRoverApiKey] = useLocalStorage<string>("farmOS-rover-api-key", "");
  const [roverKeyInput, setRoverKeyInput] = useState(roverApiKey);
  const [roverValidating, setRoverValidating] = useState(false);
  const [roverStatus, setRoverStatus] = useState<"idle" | "valid" | "invalid">(roverApiKey ? "valid" : "idle");
  const [roverName, setRoverName] = useState<string | null>(null);
  const { signOut } = useAuth();
  const validateRoverKey = useValidateRoverKey();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Notification preferences
  const [notifPrefs, setNotifPrefs] = useLocalStorage("farmOS-notif-prefs", {
    weather: true,
    disease: true,
    irrigation: true,
    rover: true,
    harvest: true,
  });

  const handleCropToggle = (cropId: string) => {
    let newCrops: string[];
    if (selectedCrops.includes(cropId)) {
      newCrops = selectedCrops.filter((c) => c !== cropId);
      const newDetails = { ...preferences.cropDetails };
      delete newDetails[cropId];
      setSelectedCrops(newCrops);
      setPreferences({ ...preferences, selectedCrops: newCrops, cropDetails: newDetails });
    } else if (selectedCrops.length < 8) {
      newCrops = [...selectedCrops, cropId];
      setSelectedCrops(newCrops);
      setPreferences({ ...preferences, selectedCrops: newCrops });
      setEditingCrop(cropId);
    } else {
      toast({ title: "Maximum 8 crops", variant: "destructive" });
    }
  };

  const handleAddCustomCrop = () => {
    if (!customCrop.trim()) return;
    const cropId = customCrop.trim().toLowerCase().replace(/\s+/g, "-");
    if (selectedCrops.includes(cropId)) {
      toast({ title: "Already added", variant: "destructive" });
      return;
    }
    if (selectedCrops.length >= 8) {
      toast({ title: "Maximum 8 crops", variant: "destructive" });
      return;
    }
    const newCrops = [...selectedCrops, cropId];
    setSelectedCrops(newCrops);
    setPreferences({ ...preferences, selectedCrops: newCrops });
    setCustomCrop("");
    toast({ title: `${customCrop.trim()} added` });
    setEditingCrop(cropId);
  };

  const handleSaveCropDetails = (details: CropDetails) => {
    const newDetails = { ...preferences.cropDetails, [details.cropId]: details };
    setPreferences({ ...preferences, cropDetails: newDetails });
    toast({ title: "Crop details saved" });
  };

  const handleLocationRefresh = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          let locationName = "Your Location";
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
            );
            const data = await response.json();
            locationName = data.address?.city || data.address?.town || data.address?.village || "Your Area";
          } catch {}
          setPreferences({ ...preferences, locationEnabled: true, location: { lat: latitude, lng: longitude }, locationName });
          toast({ title: "Location updated", description: `Now using ${locationName}.` });
        },
        () => { toast({ title: "Location access denied", variant: "destructive" }); }
      );
    }
  };

  const handleNotificationToggle = async () => {
    if (!preferences.notificationsEnabled) {
      if ("Notification" in window) {
        const permission = await Notification.requestPermission();
        setPreferences({ ...preferences, notificationsEnabled: permission === "granted" });
        if (permission === "granted") {
          toast({ title: "Notifications enabled" });
        }
      }
    } else {
      setPreferences({ ...preferences, notificationsEnabled: false });
    }
  };

  const handleSaveRoverKey = async () => {
    if (!roverKeyInput.trim()) {
      toast({ title: "Enter an API key", variant: "destructive" });
      return;
    }
    setRoverValidating(true);
    try {
      const result = await validateRoverKey(roverKeyInput.trim());
      if (result.valid) {
        setRoverApiKey(roverKeyInput.trim());
        setRoverStatus("valid");
        setRoverName(result.roverName || null);
        toast({ title: "Rover connected!", description: `Connected to ${result.roverName || "rover"}.` });
      } else {
        setRoverStatus("invalid");
        toast({ title: "Invalid API key", description: result.message, variant: "destructive" });
      }
    } catch {
      setRoverStatus("invalid");
      toast({ title: "Connection failed", variant: "destructive" });
    }
    setRoverValidating(false);
  };

  const handleDisconnectRover = () => {
    setRoverApiKey("");
    setRoverKeyInput("");
    setRoverStatus("idle");
    setRoverName(null);
    toast({ title: "Rover disconnected" });
  };

  const handleResetApp = () => {
    if (confirm("Reset all app data? This will clear preferences and restart onboarding.")) {
      localStorage.clear();
      navigate("/onboarding");
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const getCropName = (id: string) => {
    const found = cropOptions.find(c => c.id === id);
    if (found) return found.name;
    return id.charAt(0).toUpperCase() + id.slice(1).replace(/-/g, " ");
  };

  const getCropDisplay = (id: string) => {
    const found = cropOptions.find(c => c.id === id);
    if (found) return `${found.icon} ${found.name}`;
    return `🌱 ${getCropName(id)}`;
  };

  const getCropDetailsSummary = (id: string) => {
    const details = preferences.cropDetails?.[id];
    if (!details) return "No details — tap to configure";
    const parts: string[] = [];
    if (details.fieldArea) parts.push(`${details.fieldArea} ${details.fieldAreaUnit || "acres"}`);
    if (details.irrigationFrequency) parts.push(details.irrigationFrequency === "custom" ? (details.irrigationCustom || "custom") : details.irrigationFrequency);
    if (details.cropStage) parts.push(details.cropStage);
    return parts.length > 0 ? parts.join(" • ") : "No details — tap to configure";
  };

  return (
    <MobileLayout>
      <MobileHeader />
      <main className="px-4 pt-4 pb-24 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center">
            <SettingsIcon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground tracking-tight">Settings</h1>
            <p className="text-xs text-muted-foreground">Manage your preferences</p>
          </div>
        </div>

        {/* Location */}
        <div className="premium-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold">Location</h3>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{preferences.locationName || "Not set"}</p>
              <p className="text-[10px] text-muted-foreground">
                {preferences.location ? `${preferences.location.lat.toFixed(4)}, ${preferences.location.lng.toFixed(4)}` : "Enable for weather data"}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={handleLocationRefresh} className="rounded-xl h-8">
              <RefreshCw className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* Rover API Configuration */}
        <div className="premium-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Bot className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold">Rover API Configuration</h3>
          </div>
          {roverStatus === "valid" ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-xl">
                <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">Connected</p>
                  <p className="text-[10px] text-muted-foreground truncate">{roverName || "Rover active"}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full rounded-xl h-9 text-xs" onClick={handleDisconnectRover}>
                <XCircle className="w-3.5 h-3.5 mr-1.5" /> Disconnect Rover
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs">API Key</Label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input
                    type="password"
                    value={roverKeyInput}
                    onChange={(e) => { setRoverKeyInput(e.target.value); setRoverStatus("idle"); }}
                    placeholder="Enter your Rover API key"
                    className="pl-9 rounded-xl h-9 text-xs"
                  />
                </div>
                {roverStatus === "invalid" && (
                  <p className="text-[10px] text-destructive flex items-center gap-1">
                    <XCircle className="w-3 h-3" /> Invalid key. Please check and try again.
                  </p>
                )}
              </div>
              <Button
                size="sm"
                className="w-full rounded-xl h-9 text-xs gradient-primary border-0"
                onClick={handleSaveRoverKey}
                disabled={roverValidating || !roverKeyInput.trim()}
              >
                {roverValidating ? "Validating..." : "Connect Rover"}
              </Button>
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="premium-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Bell className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold">Notifications</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Push Notifications</p>
                <p className="text-[10px] text-muted-foreground">Master toggle for all alerts</p>
              </div>
              <Switch checked={preferences.notificationsEnabled} onCheckedChange={handleNotificationToggle} />
            </div>

            {preferences.notificationsEnabled && (
              <div className="space-y-2 pt-2 border-t border-border/40">
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Alert Types</p>
                {[
                  { key: "weather", icon: CloudRain, label: "Weather Alerts", desc: "Rain, storms, temperature" },
                  { key: "disease", icon: AlertTriangle, label: "Disease Risks", desc: "Crop disease warnings" },
                  { key: "irrigation", icon: RefreshCw, label: "Irrigation", desc: "Watering reminders" },
                  { key: "rover", icon: Bot, label: "Rover Updates", desc: "Robot status & sensor data" },
                  { key: "harvest", icon: Leaf, label: "Harvest Alerts", desc: "Harvest readiness" },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between py-1.5">
                    <div className="flex items-center gap-2.5">
                      <item.icon className="w-3.5 h-3.5 text-muted-foreground" />
                      <div>
                        <p className="text-xs font-medium text-foreground">{item.label}</p>
                        <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                    <Switch
                      checked={(notifPrefs as any)[item.key]}
                      onCheckedChange={(val) => setNotifPrefs({ ...notifPrefs, [item.key]: val })}
                      className="scale-90"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Crops */}
        <div className="premium-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Leaf className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold">Your Crops ({selectedCrops.length}/8)</h3>
          </div>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {cropOptions.map((crop) => (
              <Badge
                key={crop.id}
                variant={selectedCrops.includes(crop.id) ? "default" : "outline"}
                className="cursor-pointer text-xs py-1 px-2.5 rounded-lg"
                onClick={() => handleCropToggle(crop.id)}
              >
                {crop.icon} {crop.name}
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={customCrop}
              onChange={(e) => setCustomCrop(e.target.value)}
              placeholder="Add custom crop..."
              className="rounded-xl h-9 text-xs"
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddCustomCrop())}
            />
            <Button size="sm" variant="outline" className="rounded-xl h-9" onClick={handleAddCustomCrop}>
              <Plus className="w-3.5 h-3.5" />
            </Button>
          </div>
          {selectedCrops.filter(c => !cropOptions.find(o => o.id === c)).length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2 pt-2 border-t border-border/40">
              {selectedCrops.filter(c => !cropOptions.find(o => o.id === c)).map(c => (
                <Badge key={c} variant="default" className="cursor-pointer text-xs py-1 px-2.5 rounded-lg" onClick={() => handleCropToggle(c)}>
                  {getCropDisplay(c)} ×
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Crop Details */}
        {selectedCrops.length > 0 && (
          <div className="premium-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Pencil className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold">Crop Details</h3>
            </div>
            <p className="text-[10px] text-muted-foreground mb-3">
              Add irrigation, stage, and planting info for better AI predictions.
            </p>
            <div className="space-y-2">
              {selectedCrops.map((cropId) => (
                <button
                  key={cropId}
                  onClick={() => setEditingCrop(cropId)}
                  className="w-full flex items-center justify-between p-3 bg-muted/40 rounded-xl text-left hover:bg-muted/60 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">{getCropDisplay(cropId)}</p>
                    <p className="text-[10px] text-muted-foreground truncate mt-0.5">{getCropDetailsSummary(cropId)}</p>
                  </div>
                  <Pencil className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0 ml-2" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* App Actions */}
        <div className="premium-card p-4 space-y-2">
          <h3 className="text-sm font-semibold mb-3">Account</h3>
          <Button
            variant="outline"
            className="w-full justify-start rounded-xl h-10 text-sm"
            onClick={handleSignOut}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start rounded-xl h-10 text-destructive hover:text-destructive text-sm"
            onClick={handleResetApp}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Reset All Data
          </Button>
        </div>

        <p className="text-center text-[10px] text-muted-foreground pt-2">FarmOS v2.0</p>
      </main>
      <BottomNav />

      {editingCrop && (
        <CropDetailsDialog
          open={!!editingCrop}
          onOpenChange={(open) => { if (!open) setEditingCrop(null); }}
          cropId={editingCrop}
          cropName={getCropName(editingCrop)}
          initialDetails={preferences.cropDetails?.[editingCrop]}
          onSave={handleSaveCropDetails}
        />
      )}
    </MobileLayout>
  );
};

export default Settings;
