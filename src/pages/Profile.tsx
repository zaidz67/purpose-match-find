import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { IkigaiVisualization } from "@/components/profile/IkigaiVisualization";
import { Loader2, MapPin, Briefcase, Link as LinkIcon, Github, Linkedin, Twitter, Mail, Sparkles, UserPlus, Check, X, UserCheck, Pencil } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useConnection } from "@/hooks/useConnection";
import { Navbar } from "@/components/layout/Navbar";

const Profile = () => {
  const { userId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const matchScore = searchParams.get("score");
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { toast } = useToast();

  const profileId = userId || "";
  const {
    connectionStatus,
    isLoading: connectionLoading,
    sendConnectionRequest,
    acceptConnection,
    declineConnection,
  } = useConnection(profileId);

  const isOwnProfile = currentUserId === profileId || (!userId && currentUserId);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUserId(user?.id || null);
        const id = userId || user?.id;

        if (!id) {
          toast({
            title: "Profile not found",
            variant: "destructive"
          });
          return;
        }

        const { data, error } = await supabase
          .from('profiles')
          .select(`
            *,
            ikigai_responses(*),
            skills(*),
            portfolio_items(*)
          `)
          .eq('id', id)
          .single();

        if (error) throw error;
        setProfile(data);
      } catch (error: any) {
        console.error('Error fetching profile:', error);
        toast({
          title: "Error loading profile",
          description: error.message,
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [userId, toast]);

  const handleSendMessage = () => {
    if (profile?.id) {
      navigate(`/messages/${profile.id}`);
    }
  };

  const handleConnect = async () => {
    await sendConnectionRequest();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10 flex items-center justify-center">
        <p className="text-xl text-muted-foreground">Profile not found</p>
      </div>
    );
  }

  const initials = profile.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || '?';
  const ikigai = profile.ikigai_responses?.[0] || {};

  const renderConnectionButton = () => {
    if (isOwnProfile) return null;
    if (connectionLoading) return <Button disabled><Loader2 className="h-4 w-4 animate-spin" /></Button>;

    switch (connectionStatus) {
      case "accepted":
        return (
          <Badge className="bg-emerald-500 text-white px-4 py-2 text-sm">
            <UserCheck className="h-4 w-4 mr-2" />
            Connected
          </Badge>
        );
      case "pending_sent":
        return (
          <Button variant="secondary" disabled>
            <UserPlus className="h-4 w-4 mr-2" />
            Request Sent
          </Button>
        );
      case "pending_received":
        return (
          <div className="flex gap-2">
            <Button onClick={acceptConnection} className="gap-1">
              <Check className="h-4 w-4" />
              Accept
            </Button>
            <Button variant="outline" onClick={declineConnection}>
              <X className="h-4 w-4" />
              Decline
            </Button>
          </div>
        );
      default:
        return (
          <Button variant="outline" onClick={handleConnect}>
            <UserPlus className="h-4 w-4 mr-2" />
            Connect
          </Button>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10">
      <Navbar />
      <div className="container mx-auto max-w-6xl space-y-8 p-8">
        {/* Match Score Banner */}
        {matchScore && (
          <Card className="p-6 bg-gradient-to-r from-primary/10 to-secondary/10 border-2 border-primary/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sparkles className="h-6 w-6 text-primary" />
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Why You Matched</h3>
                  <p className="text-sm text-muted-foreground">AI-powered compatibility analysis</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-primary">{matchScore}%</div>
                <p className="text-sm text-muted-foreground">Match Score</p>
              </div>
            </div>
            <Progress value={parseInt(matchScore)} className="h-2 mt-4" />
          </Card>
        )}

        {/* Profile Header */}
        <Card className="p-8">
          <div className="flex flex-col md:flex-row gap-6">
            <Avatar className="h-32 w-32 ring-4 ring-primary/20">
              <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
              <AvatarFallback className="bg-primary/10 text-primary text-3xl font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-4xl font-bold text-foreground">{profile.full_name}</h1>
                {profile.location && (
                  <p className="text-muted-foreground flex items-center gap-2 mt-2">
                    <MapPin className="h-4 w-4" />
                    {profile.location}
                  </p>
                )}
              </div>

              {profile.bio && (
                <p className="text-foreground/80 text-lg">{profile.bio}</p>
              )}

              {/* Intent & Availability */}
              <div className="flex flex-wrap gap-3">
                {profile.current_intent?.map((intent: string) => (
                  <Badge key={intent} className="bg-primary/10 text-primary hover:bg-primary/20">
                    {intent.replace('_', ' ')}
                  </Badge>
                ))}
                {profile.availability && (
                  <Badge variant="outline">
                    <Briefcase className="h-3 w-3 mr-1" />
                    {profile.availability.replace('_', ' ')}
                  </Badge>
                )}
              </div>

              {/* Social Links */}
              <div className="flex gap-2">
                {profile.linkedin_url && (
                  <Button size="sm" variant="outline" asChild>
                    <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer">
                      <Linkedin className="h-4 w-4" />
                    </a>
                  </Button>
                )}
                {profile.github_url && (
                  <Button size="sm" variant="outline" asChild>
                    <a href={profile.github_url} target="_blank" rel="noopener noreferrer">
                      <Github className="h-4 w-4" />
                    </a>
                  </Button>
                )}
                {profile.twitter_url && (
                  <Button size="sm" variant="outline" asChild>
                    <a href={profile.twitter_url} target="_blank" rel="noopener noreferrer">
                      <Twitter className="h-4 w-4" />
                    </a>
                  </Button>
                )}
                {profile.portfolio_url && (
                  <Button size="sm" variant="outline" asChild>
                    <a href={profile.portfolio_url} target="_blank" rel="noopener noreferrer">
                      <LinkIcon className="h-4 w-4" />
                    </a>
                  </Button>
                )}
              </div>

              {/* Action Buttons */}
              {isOwnProfile ? (
                <div className="flex flex-wrap gap-3">
                  <Button className="w-full md:w-auto" size="lg" onClick={() => navigate("/profile/edit")}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>
              ) : (
                <div className="flex flex-wrap gap-3">
                  <Button className="w-full md:w-auto" size="lg" onClick={handleSendMessage}>
                    <Mail className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                  {renderConnectionButton()}
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Professional Background */}
        {profile.professional_background && (
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-foreground mb-4">Professional Background</h2>
            <p className="text-foreground/80">{profile.professional_background}</p>
          </Card>
        )}

        {/* Skills */}
        {profile.skills && profile.skills.length > 0 && (
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-foreground mb-4">Skills & Expertise</h2>
            <div className="space-y-3">
              {profile.skills.map((skill: any) => (
                <div key={skill.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-foreground">{skill.skill_name}</span>
                    <Badge variant="secondary">{skill.proficiency}</Badge>
                  </div>
                  <Progress 
                    value={
                      skill.proficiency === 'expert' ? 100 :
                      skill.proficiency === 'advanced' ? 75 :
                      skill.proficiency === 'intermediate' ? 50 : 25
                    } 
                    className="h-2"
                  />
                  {skill.years_of_experience && (
                    <p className="text-xs text-muted-foreground">
                      {skill.years_of_experience} years of experience
                    </p>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Ikigai Visualization */}
        {ikigai && Object.keys(ikigai).length > 0 && (
          <IkigaiVisualization ikigai={ikigai} />
        )}

        {/* Portfolio */}
        {profile.portfolio_items && profile.portfolio_items.length > 0 && (
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-foreground mb-4">Portfolio</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {profile.portfolio_items.map((item: any) => (
                <Card key={item.id} className="p-4 bg-card/50 hover:shadow-lg transition-shadow">
                  {item.image_url && (
                    <img 
                      src={item.image_url} 
                      alt={item.title}
                      className="w-full h-48 object-cover rounded-lg mb-3"
                    />
                  )}
                  <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                  {item.description && (
                    <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                  )}
                  {item.link_url && (
                    <Button size="sm" variant="outline" asChild>
                      <a href={item.link_url} target="_blank" rel="noopener noreferrer">
                        <LinkIcon className="h-3 w-3 mr-1" />
                        View Project
                      </a>
                    </Button>
                  )}
                </Card>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Profile;
