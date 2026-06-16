import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/Dashboard";
import Sales from "@/pages/Sales";
import Inventory from "@/pages/Inventory";
import Forecasting from "@/pages/Forecasting";
import Reports from "@/pages/Reports";
import Customers from "@/pages/Customers";
import Settings from "@/pages/Settings";
import AiInsights from "@/pages/AiInsights";
import NotFound from "@/pages/not-found";

import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute, RoleGuard } from "./components/ProtectedRoutes";
import Login from "./pages/Login";

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      
      <Route path="/">
        <ProtectedRoute><RoleGuard allowedRoles={["admin", "user"]}><Dashboard /></RoleGuard></ProtectedRoute>
      </Route>
      <Route path="/sales">
        <ProtectedRoute><RoleGuard allowedRoles={["admin", "user"]}><Sales /></RoleGuard></ProtectedRoute>
      </Route>
      <Route path="/inventory">
        <ProtectedRoute><RoleGuard allowedRoles={["admin", "user"]}><Inventory /></RoleGuard></ProtectedRoute>
      </Route>
      <Route path="/customers">
        <ProtectedRoute><RoleGuard allowedRoles={["admin", "user"]}><Customers /></RoleGuard></ProtectedRoute>
      </Route>

      <Route path="/forecasting">
        <ProtectedRoute><RoleGuard allowedRoles={["admin"]}><Forecasting /></RoleGuard></ProtectedRoute>
      </Route>
      <Route path="/reports">
        <ProtectedRoute><RoleGuard allowedRoles={["admin"]}><Reports /></RoleGuard></ProtectedRoute>
      </Route>
      <Route path="/settings">
        <ProtectedRoute><RoleGuard allowedRoles={["admin"]}><Settings /></RoleGuard></ProtectedRoute>
      </Route>
      <Route path="/ai-insights">
        <ProtectedRoute><RoleGuard allowedRoles={["admin"]}><AiInsights /></RoleGuard></ProtectedRoute>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AuthProvider>
            <Router />
          </AuthProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
