import { Sprout } from "lucide-react";
import { Link } from "react-router-dom";

const MobileHeader = () => {
  return (
    <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-xl border-b border-border/40">
      <div className="px-4 py-3 flex items-center gap-2.5">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center shadow-sm">
            <Sprout className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-base text-foreground tracking-tight">FarmOS</span>
        </Link>
      </div>
    </header>
  );
};

export default MobileHeader;
