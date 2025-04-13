
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminRoute from "@/components/AdminRoute";

// Auth Pages
import Auth from "./pages/Auth";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import DataUpload from "./pages/admin/DataUpload";
import Stores from "./pages/admin/Stores";

// Merchandiser Pages
import MerchandiserHome from "./pages/merchandiser/MerchandiserHome";
import StoreVisit from "./pages/merchandiser/StoreVisit";
import Map from "./pages/merchandiser/Map";
import Profile from "./pages/merchandiser/Profile";

// Shared
import NotFound from "./pages/NotFound";
import { useAuth } from "@/context/AuthContext";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { profile, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
      
      {/* Admin Routes */}
      <Route path="/admin" element={
        <AdminRoute>
          <AdminDashboard />
        </AdminRoute>
      } />
      <Route path="/admin/upload" element={
        <AdminRoute>
          <DataUpload />
        </AdminRoute>
      } />
      <Route path="/admin/stores" element={
        <AdminRoute>
          <Stores />
        </AdminRoute>
      } />
      
      {/* Merchandiser Routes */}
      <Route path="/" element={
        <ProtectedRoute>
          {profile?.role === 'admin' ? <Navigate to="/admin" replace /> : <MerchandiserHome />}
        </ProtectedRoute>
      } />
      <Route path="/visit/:visitId" element={
        <ProtectedRoute>
          <StoreVisit />
        </ProtectedRoute>
      } />
      <Route path="/map" element={
        <ProtectedRoute>
          <Map />
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      } />
      
      {/* Catch-all route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
