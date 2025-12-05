import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, MapPin, ArrowRight } from "lucide-react";

interface Profile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  current_intent: string[] | null;
  skills: { skill_name: string; proficiency: string }[];
}

export const RecommendationsSection = () => {
  const [recommendations, setRecommendations] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch searchable profiles excluding current user
        const { data, error } = await supabase
          .from("profiles")
          .select(`
            id,
            full_name,
            avatar_url,
            bio,
            location,
            current_intent,
            skills(skill_name, proficiency)
          `)
          .eq("is_searchable", true)
          .neq("id", user.id)
          .limit(5);

        if (error) throw error;
        setRecommendations(data || []);
      } catch (error) {
        console.error("Error fetching recommendations:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
            <Skeleton className="h-3 w-full mb-2" />
            <Skeleton className="h-3 w-2/3" />
          </Card>
        ))}
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <Card className="p-6 text-center">
        <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground">No recommendations yet</p>
        <p className="text-sm text-muted-foreground mt-1">
          Complete your profile to get personalized matches
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {recommendations.map((profile) => {
        const initials = profile.full_name
          ?.split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase() || "?";
        const topSkills = profile.skills?.slice(0, 2) || [];

        return (
          <Card
            key={profile.id}
            className="p-4 cursor-pointer hover:border-primary/30 hover:shadow-md transition-all"
            onClick={() => navigate(`/profile/${profile.id}`)}
          >
            <div className="flex items-start gap-3">
              <Avatar className="h-12 w-12 ring-2 ring-primary/10">
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary text-sm">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-foreground truncate">
                  {profile.full_name || "Anonymous"}
                </h4>
                {profile.location && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {profile.location}
                  </p>
                )}
              </div>

              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </div>

            {profile.bio && (
              <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                {profile.bio}
              </p>
            )}

            <div className="flex flex-wrap gap-1.5 mt-3">
              {profile.current_intent?.slice(0, 2).map((intent) => (
                <Badge
                  key={intent}
                  variant="secondary"
                  className="text-xs bg-primary/10 text-primary"
                >
                  {intent.replace("_", " ")}
                </Badge>
              ))}
              {topSkills.map((skill) => (
                <Badge key={skill.skill_name} variant="outline" className="text-xs">
                  {skill.skill_name}
                </Badge>
              ))}
            </div>
          </Card>
        );
      })}

      <Button
        variant="ghost"
        className="w-full"
        onClick={() => navigate("/search")}
      >
        <Sparkles className="h-4 w-4 mr-2" />
        Find More Matches
      </Button>
    </div>
  );
};
