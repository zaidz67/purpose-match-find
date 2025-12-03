import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Compass, Search, LogOut, User, MessageSquare, Users, Home } from "lucide-react";
import { cn } from "@/lib/utils";

export const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const navItems = [
    { label: "Dashboard", icon: Home, path: "/dashboard" },
    { label: "Search", icon: Search, path: "/search" },
    { label: "Messages", icon: MessageSquare, path: "/messages" },
    { label: "Profile", icon: User, path: "/profile" },
  ];

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate("/dashboard")}
        >
          <Compass className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold gradient-text hidden sm:inline">
            Ikigai Match
          </span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Button
              key={item.path}
              variant={isActive(item.path) ? "secondary" : "ghost"}
              size="sm"
              onClick={() => navigate(item.path)}
              className={cn(
                "gap-2",
                isActive(item.path) && "bg-primary/10 text-primary"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Button>
          ))}
        </nav>

        {/* Mobile Navigation */}
        <nav className="flex md:hidden items-center gap-1">
          {navItems.map((item) => (
            <Button
              key={item.path}
              variant={isActive(item.path) ? "secondary" : "ghost"}
              size="icon"
              onClick={() => navigate(item.path)}
              className={cn(
                isActive(item.path) && "bg-primary/10 text-primary"
              )}
            >
              <item.icon className="h-5 w-5" />
            </Button>
          ))}
        </nav>

        <Button variant="ghost" size="icon" onClick={handleLogout}>
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
};
