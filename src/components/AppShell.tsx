
import { ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  HomeIcon, 
  WalletIcon, 
  HistoryIcon, 
  UserIcon, 
  LogOutIcon,
  ArrowRightIcon,
  SettingsIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { Logo } from "./Logo";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const navItems = [
    { icon: HomeIcon, label: "Accueil", path: "/" },
    { icon: WalletIcon, label: "Transactions", path: "/transactions" },
    { icon: HistoryIcon, label: "Historique", path: "/history" },
    { icon: UserIcon, label: "Profil", path: "/profile" },
    { icon: SettingsIcon, label: "Paramètres", path: "/settings" },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Removed the user check to always render the full UI

  return (
    <div className="flex min-h-screen flex-col">
      {/* Top header */}
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <Logo />
        <div className="ml-auto flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="hidden md:flex"
            onClick={handleLogout}
          >
            <LogOutIcon className="mr-2 h-4 w-4" />
            Déconnexion
          </Button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-auto p-4 md:p-6">
        {/* Logo display at the top of content area on every page */}
        <div className="mb-6 flex justify-center">
          <Logo showImage={true} size="lg" className="text-kioska-navy" />
        </div>
        {children}
      </main>

      {/* Bottom navigation bar (for mobile) */}
      <div className="sticky bottom-0 z-30 md:hidden">
        <nav className="grid grid-cols-5 items-center gap-1 border-t bg-background p-2">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <button
                key={index}
                className={cn(
                  "flex flex-col items-center justify-center rounded-md px-2 py-2 text-xs font-medium",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
                onClick={() => handleNavigation(item.path)}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Side navigation (for desktop) */}
      <div className="fixed bottom-0 left-0 top-0 z-30 hidden w-56 border-r bg-background pt-16 md:flex">
        <nav className="flex w-full flex-col gap-2 p-4">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <button
                key={index}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
                onClick={() => handleNavigation(item.path)}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
                {isActive && <ArrowRightIcon className="ml-auto h-4 w-4" />}
              </button>
            );
          })}
          
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-auto"
            onClick={handleLogout}
          >
            <LogOutIcon className="mr-2 h-4 w-4" />
            Déconnexion
          </Button>
        </nav>
      </div>
    </div>
  );
}
