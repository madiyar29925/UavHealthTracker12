import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import FleetPage from "@/pages/fleet-page";
import AnalyticsPage from "@/pages/analytics-page";
import AuthPage from "@/pages/auth-page";
import SystemMonitoring from "@/pages/system-monitoring";
import DroneHealthPage from "@/pages/drone-health-page";
import { UavProvider } from "./contexts/UavContext";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={Dashboard} />
      <ProtectedRoute path="/fleet" component={FleetPage} />
      <ProtectedRoute path="/analytics" component={AnalyticsPage} />
      <ProtectedRoute path="/system" component={SystemMonitoring} />
      <ProtectedRoute path="/health" component={DroneHealthPage} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <AuthProvider>
        <UavProvider>
          <Router />
        </UavProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
