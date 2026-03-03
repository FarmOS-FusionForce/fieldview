import { ReactNode } from "react";

interface MobileLayoutProps {
  children: ReactNode;
}

const MobileLayout = ({ children }: MobileLayoutProps) => {
  return (
    <div className="min-h-screen w-full max-w-2xl mx-auto bg-background overflow-x-hidden">
      {children}
    </div>
  );
};

export default MobileLayout;
