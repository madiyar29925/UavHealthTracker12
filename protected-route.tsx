import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Route, useLocation, Redirect } from "wouter";

export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  const { user, isLoading } = useAuth();
  const [location] = useLocation();

  // Check if the route matches the current path
  const isActive = location === path;

  if (isLoading && isActive) {
    return (
      <div className="flex items-center justify-center w-full min-h-screen">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <Route path={path}>
      {() => {
        // If user is not authenticated, redirect to the authentication page
        if (!user) {
          return <Redirect to="/auth" />;
        }
        
        // Otherwise render the component
        return <Component />;
      }}
    </Route>
  );
}