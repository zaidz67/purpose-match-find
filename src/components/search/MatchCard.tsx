import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface MatchCardProps {
  match: {
    profile_id: string;
    score: number;
    explanation: string;
    top_attributes: string[];
    profile: {
      id: string;
      full_name: string;
      avatar_url?: string;
      bio?: string;
      location?: string;
      current_intent?: string[];
      availability?: string;
      skills?: Array<{
        skill_name: string;
        proficiency: string;
      }>;
    };
  };
}

export const MatchCard = ({ match }: MatchCardProps) => {
  const navigate = useNavigate();
  const { profile, score, explanation, top_attributes } = match;

  const getMatchCategory = (score: number) => {
    if (score >= 90) return { label: "Perfect Match", color: "bg-emerald-500" };
    if (score >= 70) return { label: "Strong Match", color: "bg-primary" };
    return { label: "Potential Match", color: "bg-accent" };
  };

  const category = getMatchCategory(score);
  const initials = profile.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';

  return (
    <Card className="p-6 hover:shadow-lg transition-all duration-300 border-border/50 bg-card/50 backdrop-blur-sm">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Profile Section */}
        <div className="flex items-start gap-4 flex-1">
          <Avatar className="h-16 w-16 ring-2 ring-primary/20">
            <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-xl font-semibold text-foreground">
                  {profile.full_name}
                </h3>
                {profile.location && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {profile.location}
                  </p>
                )}
              </div>
              <Badge className={`${category.color} text-white`}>
                {category.label}
              </Badge>
            </div>

            {profile.bio && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {profile.bio}
              </p>
            )}

            {/* Intent Tags */}
            {profile.current_intent && profile.current_intent.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {profile.current_intent.map((intent) => (
                  <Badge key={intent} variant="secondary" className="text-xs">
                    {intent.replace('_', ' ')}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Match Details */}
        <div className="md:w-80 space-y-4">
          {/* Match Score */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Match Score</span>
              <span className="text-2xl font-bold text-primary">{score}%</span>
            </div>
            <Progress value={score} className="h-2" />
          </div>

          {/* AI Explanation */}
          <div className="bg-primary/5 rounded-lg p-3 border border-primary/10">
            <div className="flex items-start gap-2">
              <Sparkles className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-sm text-foreground/90">{explanation}</p>
            </div>
          </div>

          {/* Top Attributes */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Top Matching Attributes
            </p>
            <div className="flex flex-wrap gap-2">
              {top_attributes?.slice(0, 3).map((attr, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {attr}
                </Badge>
              ))}
            </div>
          </div>

          {/* Top Skills */}
          {profile.skills && profile.skills.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Top Skills
              </p>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill) => (
                  <Badge key={skill.skill_name} variant="secondary" className="text-xs">
                    {skill.skill_name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button 
              onClick={() => navigate(`/profile/${profile.id}?score=${score}`)}
              className="flex-1"
            >
              View Profile
            </Button>
            <Button variant="outline" className="flex-1">
              Connect
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
