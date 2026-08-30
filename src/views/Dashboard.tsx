import { Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import EscrowDashboard from "@/components/dashboard/EscrowDashboard";
import PaymentScheduler from "@/components/dashboard/PaymentScheduler";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { WalletButton } from "@/components/web3/WalletButton";

const Dashboard = () => {
  const { user, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center border-b border-border px-4 shrink-0 gap-2">
            <SidebarTrigger className="mr-2" />
            <span className="text-xs text-muted-foreground truncate max-w-[140px] hidden sm:inline">
              {user.email}
            </span>
            <div className="ml-auto flex items-center gap-2">
              <WalletButton />
              <Button variant="ghost" size="icon" onClick={signOut} className="h-8 w-8">
                <LogOut size={14} />
              </Button>
            </div>
          </header>
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
            <Routes>
              <Route index element={<EscrowDashboard />} />
              <Route path="escrows" element={<EscrowDashboard />} />
              <Route path="scheduler" element={<PaymentScheduler />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
