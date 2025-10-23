
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AnimatePresence } from "framer-motion";
import Index from "./pages/Index";

import Settings from "./pages/Settings";
import MyReports from "./pages/MyReports";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SidebarProvider>
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={<Index />} />
                
                <Route path="/settings" element={<Settings />} />
                <Route path="/my-reports" element={<MyReports />} />
              </Routes>
            </AnimatePresence>
          </SidebarProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
