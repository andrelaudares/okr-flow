import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import ResetConfirmation from "./pages/ResetConfirmation";
import Dashboard from "./pages/Dashboard";
import History from "./pages/History";
import Users from "./pages/Users";
import Profile from "./pages/Profile";
import CompanySettings from "./pages/CompanySettings";
import Cycles from "./pages/cycles/Cycles";
import ObjectiveKeyResults from "./pages/objectives/ObjectiveKeyResults";
import CompanySettingsPage from "./pages/company/CompanySettings";
import TestSimple from "./pages/TestSimple";
import Navbar from "./components/layout/navbar";
import { AuthProvider, useAuth } from "./hooks/use-auth";
import Index from './pages/Index';
import { TooltipProvider } from "@/components/ui/tooltip";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// This component must be used inside AuthProvider
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <>
      <Navbar />
      {children}
    </>
  );
};

// This component must be used inside AuthProvider
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/test" element={<TestSimple />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/reset-confirmation" element={<ResetConfirmation />} />
      <Route path="/" element={<Index />} />
      
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/history" element={
        <ProtectedRoute>
          <History />
        </ProtectedRoute>
      } />
      <Route path="/users" element={
        <ProtectedRoute>
          <Users />
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      } />
      <Route path="/company-settings" element={
        <ProtectedRoute>
          <CompanySettingsPage />
        </ProtectedRoute>
      } />
      <Route path="/cycles" element={
        <ProtectedRoute>
          <Cycles />
        </ProtectedRoute>
      } />
      <Route path="/objectives/:objectiveId/key-results" element={
        <ProtectedRoute>
          <ObjectiveKeyResults />
        </ProtectedRoute>
      } />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
