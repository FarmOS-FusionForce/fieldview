import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useFarmPreferences } from "@/hooks/useLocalStorage";
import { useAuth } from "@/hooks/useAuth";
import Dashboard from "./pages/Dashboard";
import FarmerDashboard from "./pages/FarmerDashboard";
import Onboarding from "./pages/Onboarding";
import Predictions from "./pages/Predictions";
import Alerts from "./pages/Alerts";
import Settings from "./pages/Settings";
import History from "./pages/History";
import Fields from "./pages/Fields";
import FieldDetail from "./pages/FieldDetail";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import { Skeleton } from "@/components/ui/skeleton";

const queryClient = new QueryClient();

const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Skeleton className="w-12 h-12 rounded-xl" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

const RequireOnboarding = ({ children }: { children: React.ReactNode }) => {
  const [preferences] = useFarmPreferences();

  if (!preferences.onboardingCompleted) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};

const OnboardingRoute = () => {
  const [preferences] = useFarmPreferences();

  if (preferences.onboardingCompleted) {
    return <Navigate to="/" replace />;
  }

  return <Onboarding />;
};

const AuthRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Skeleton className="w-12 h-12 rounded-xl" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <Auth />;
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => (
  <RequireAuth>
    <RequireOnboarding>{children}</RequireOnboarding>
  </RequireAuth>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<AuthRoute />} />
          <Route path="/onboarding" element={<RequireAuth><OnboardingRoute /></RequireAuth>} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/farmerdashboard" element={<ProtectedRoute><FarmerDashboard /></ProtectedRoute>} />
          {/* <Route path="/predictions" element={<ProtectedRoute><Predictions /></ProtectedRoute>} />
          <Route path="/alerts" element={<ProtectedRoute><Alerts /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
          <Route path="/fields" element={<ProtectedRoute><Fields /></ProtectedRoute>} />
          <Route path="/fields/:fieldId" element={<ProtectedRoute><FieldDetail /></ProtectedRoute>} /> */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
