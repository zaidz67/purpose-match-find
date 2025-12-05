import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Users, Sparkles } from "lucide-react";
import { ConnectionsManager } from "@/components/connections/ConnectionsManager";
import { RecommendationsSection } from "@/components/dashboard/RecommendationsSection";
import { Navbar } from "@/components/layout/Navbar";

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState<any>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        setUser(profile);

        // Fetch pending connection count
        const { count } = await supabase
          .from("connections")
          .select("*", { count: "exact", head: true })
          .eq("recipient_id", user.id)
          .eq("status", "pending");
        
        setPendingCount(count || 0);
      }
    };
    getUser();
  }, []);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10">
      <Navbar />

      <div className="container mx-auto px-4 py-12">
        {/* Welcome Section */}
        <div className="max-w-4xl mx-auto mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Welcome back, {user?.full_name || "there"}!
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Find your perfect cofounder, team member, or mentor using AI-powered natural language search
          </p>

          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <Input
              placeholder='Try "Find me a technical cofounder who loves sustainable tech..."'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              className="h-14 text-lg pr-12 bg-card/50 backdrop-blur-sm"
            />
            <Button
              size="icon"
              className="absolute right-1 top-1 h-12 w-12"
              onClick={handleSearch}
            >
              <Search className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-8">
          {/* Connections Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <Users className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">Your Network</h2>
              {pendingCount > 0 && (
                <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                  {pendingCount} new
                </span>
              )}
            </div>
            <ConnectionsManager />
          </div>

          {/* Recommendations Section */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">Recommended</h2>
            </div>
            <RecommendationsSection />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
