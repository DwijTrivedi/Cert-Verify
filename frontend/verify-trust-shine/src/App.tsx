import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";

import Index from "./pages/Index";
import Verify from "./pages/Verify";
import Dashboard from "./pages/Dashboard";
import Institutions from "./pages/Institutions";
import NotFound from "./pages/NotFound";

// Auth pages
import SignInPortal from "./pages/signin";
import InstitutionSignIn from "./pages/InstitutionSignIn";
import InstitutionSignUp from "./pages/InstitutionSignUp";
import CompanySignIn from "./pages/CompanySignIn";
import CompanySignUp from "./pages/CompanySignUp";

const queryClient = new QueryClient();

/**
 * AnimatedRoutes — extracted so useLocation() can be called inside BrowserRouter.
 * The `key` on AnimatePresence must change on route change to trigger exit/enter.
 */
const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        {/* Public routes */}
        <Route path="/" element={<Index />} />
        <Route path="/verify" element={<Verify />} />

        {/* Auth routes */}
        <Route path="/signin" element={<SignInPortal />} />
        <Route path="/signin/institution" element={<InstitutionSignIn />} />
        <Route path="/signup/institution" element={<InstitutionSignUp />} />
        <Route path="/signin/company" element={<CompanySignIn />} />
        <Route path="/signup/company" element={<CompanySignUp />} />

        {/* Institution-only protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={["institution"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/institutions"
          element={
            <ProtectedRoute allowedRoles={["institution"]}>
              <Institutions />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Navbar />
            <AnimatedRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
