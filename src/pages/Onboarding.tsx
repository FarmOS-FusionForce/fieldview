import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFarmPreferences } from "@/hooks/useLocalStorage";
import MobileLayout from "@/components/MobileLayout";
import { Button } from "@/components/ui/button";
import { 
  Scan, 
  Lightbulb, 
  Bell, 
  MapPin, 
  ChevronRight,
  Leaf,
  Sprout
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

const Onboarding = () => {
  const [step, setStep] = useState(0);
  const [selectedCrops, setSelectedCrops] = useState<string[]>([]);
  const [preferences, setPreferences] = useFarmPreferences();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleNext = () => { if (step < 4) setStep(step + 1); };
  const handleSkip = () => { if (step < 4) setStep(step + 1); };

  const handleNotificationPermission = async () => {
    try {
      if ("Notification" in window) {
        const permission = await Notification.requestPermission();
        setPreferences({ ...preferences, notificationsEnabled: permission === "granted" });
        if (permission === "granted") {
          toast({ title: "Notifications enabled" });
        }
      }
    } catch {}
    handleNext();
  };

  const handleLocationPermission = async () => {
    try {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            let locationName = "Your Location";
            try {
              const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
              const data = await response.json();
              locationName = data.address?.city || data.address?.town || data.address?.village || "Your Area";
            } catch {}
            setPreferences({ ...preferences, locationEnabled: true, location: { lat: latitude, lng: longitude }, locationName });
            toast({ title: "Location enabled", description: `Using ${locationName}.` });
            handleNext();
          },
          () => { toast({ title: "Location denied", variant: "destructive" }); handleNext(); }
        );
      } else { handleNext(); }
    } catch { handleNext(); }
  };

  const handleCropSelection = (cropId: string) => {
    if (selectedCrops.includes(cropId)) {
      setSelectedCrops(selectedCrops.filter((c) => c !== cropId));
    } else if (selectedCrops.length < 8) {
      setSelectedCrops([...selectedCrops, cropId]);
    } else {
      toast({ title: "Max 8 crops selected", variant: "destructive" });
    }
  };

  const handleComplete = () => {
    setPreferences({ ...preferences, onboardingCompleted: true, selectedCrops });
    navigate("/");
  };

  const screens = [
    {
      icon: <Scan className="w-12 h-12 text-primary" />,
      bg: "from-primary/8 to-accent/40",
      badge: <Leaf className="w-4 h-4 text-primary-foreground" />,
      badgeBg: "bg-primary",
      title: "Instant Disease Detection",
      description: "Detect plant diseases using images captured by robot rovers. Get instant alerts and treatment advice.",
      onAction: handleNext,
      onSkip: handleSkip,
    },
    {
      icon: <Lightbulb className="w-12 h-12 text-warning" />,
      bg: "from-warning/8 to-accent/30",
      title: "Helpful Growing Tips",
      description: "Get AI-powered growing and farming suggestions tailored to your crops, weather, and conditions.",
      onAction: handleNext,
      onSkip: handleSkip,
    },
    {
      icon: <Bell className="w-12 h-12 text-primary" />,
      bg: "from-primary/8 to-secondary/40",
      title: "Allow Notifications",
      description: "Stay informed with disease alerts, weather updates, harvest predictions, and robot notifications.",
      onAction: handleNotificationPermission,
      onSkip: handleSkip,
      actionLabel: "Allow",
    },
    {
      icon: <MapPin className="w-12 h-12 text-primary" />,
      bg: "from-accent/40 to-secondary/40",
      title: "Access Device Location",
      description: "Enable location for accurate weather reports and localized crop advice for your region.",
      onAction: handleLocationPermission,
      onSkip: handleSkip,
      actionLabel: "Allow",
    },
  ];

  return (
    <MobileLayout>
      <div className="min-h-screen flex flex-col bg-background">
        {/* Progress */}
        <div className="flex gap-1.5 p-4 pt-6">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-500 ${i <= step ? "gradient-primary" : "bg-muted"}`} />
          ))}
        </div>
        
        <div className="flex-1 flex flex-col">
          {step < 4 ? (
            <div className="flex flex-col h-full p-6">
              <div className="flex-1 flex flex-col items-center justify-center">
                <div className={`w-full h-44 bg-gradient-to-br ${screens[step].bg} rounded-3xl flex items-center justify-center mb-8 relative`}>
                  <div className="w-24 h-24 rounded-full bg-background/60 backdrop-blur-sm flex items-center justify-center">
                    {screens[step].icon}
                  </div>
                  {screens[step].badge && (
                    <div className={`absolute top-4 right-4 w-8 h-8 rounded-full ${screens[step].badgeBg} flex items-center justify-center`}>
                      {screens[step].badge}
                    </div>
                  )}
                </div>
                <h2 className="text-xl font-bold text-foreground text-center mb-2 tracking-tight">{screens[step].title}</h2>
                <p className="text-muted-foreground text-center text-sm leading-relaxed max-w-[280px]">{screens[step].description}</p>
              </div>
              <div className="flex gap-3 mt-8">
                <Button variant="outline" onClick={screens[step].onSkip} className="flex-1 h-12 rounded-xl text-sm">Skip</Button>
                <Button onClick={screens[step].onAction} className="flex-1 h-12 rounded-xl text-sm gradient-primary border-0">
                  {screens[step].actionLabel || "Next"}
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-full p-6">
              <div className="text-center mb-5">
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mx-auto mb-3">
                  <Sprout className="w-6 h-6 text-primary-foreground" />
                </div>
                <h2 className="text-xl font-bold text-foreground tracking-tight mb-1">Select Your Crops</h2>
                <p className="text-sm text-muted-foreground">Choose up to 8 crops ({selectedCrops.length}/8)</p>
              </div>
              
              <div className="grid grid-cols-3 gap-2.5 flex-1 overflow-y-auto mb-5">
                {cropOptions.map((crop) => (
                  <button
                    key={crop.id}
                    onClick={() => handleCropSelection(crop.id)}
                    className={`p-3.5 rounded-2xl border-2 transition-all flex flex-col items-center gap-1.5 ${
                      selectedCrops.includes(crop.id)
                        ? "border-primary bg-primary/8 shadow-sm"
                        : "border-border bg-card hover:border-primary/30"
                    }`}
                  >
                    <span className="text-2xl">{crop.icon}</span>
                    <span className="text-xs font-medium text-foreground">{crop.name}</span>
                  </button>
                ))}
              </div>

              <Button
                onClick={handleComplete}
                disabled={selectedCrops.length === 0}
                className="w-full h-12 rounded-xl text-sm gradient-primary border-0"
              >
                Get Started
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </MobileLayout>
  );
};

export default Onboarding;
