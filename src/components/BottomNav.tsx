import { Home, Brain, Map, Bell, Settings } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface Alert {
  id: string;
  read: boolean;
}

const BottomNav = () => {
  const location = useLocation();
  const [alerts] = useLocalStorage<Alert[]>("farmOS-alerts", []);
  const unreadCount = alerts.filter((a) => !a.read).length;

  const tabs = [
    { to: "/", icon: Home, label: "Home", match: (p: string) => p === "/" },
    { to: "/predictions", icon: Brain, label: "AI", match: (p: string) => p === "/predictions" },
    { to: "/fields", icon: Map, label: "Fields", match: (p: string) => p.startsWith("/fields") },
    { to: "/alerts", icon: Bell, label: "Alerts", match: (p: string) => p === "/alerts", badge: unreadCount },
    { to: "/settings", icon: Settings, label: "Settings", match: (p: string) => p === "/settings" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-t border-border/60 safe-bottom">
      <div className="max-w-2xl mx-auto flex">
        {tabs.map((tab) => {
          const active = tab.match(location.pathname);
          return (
            <Link
              key={tab.to}
              to={tab.to}
              className={`flex-1 flex flex-col items-center py-2 pt-2.5 text-[10px] font-medium transition-colors relative ${
                active
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            >
              <div className="relative">
                <tab.icon className={`w-5 h-5 mb-0.5 transition-all ${active ? "stroke-[2.5]" : ""}`} />
                {tab.badge && tab.badge > 0 ? (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 rounded-full bg-destructive text-destructive-foreground text-[9px] flex items-center justify-center font-bold px-1">
                    {tab.badge > 9 ? "9+" : tab.badge}
                  </span>
                ) : null}
              </div>
              {label(tab.label)}
              {active && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

function label(text: string) {
  return <span>{text}</span>;
}

export default BottomNav;
