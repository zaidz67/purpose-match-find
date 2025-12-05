import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Navbar } from "@/components/layout/Navbar";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, ArrowLeft } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { AvatarUpload, ResumeUpload } from "@/components/ui/file-upload";

const INTENT_OPTIONS = [
  { value: "cofounder", label: "Looking for a Cofounder" },
  { value: "team_member", label: "Looking for Team Members" },
  { value: "client", label: "Looking for Clients" },
  { value: "mentor", label: "Looking for a Mentor" },
  { value: "advisor", label: "Looking for Advisors" },
  { value: "investor", label: "Looking for Investors" },
];

const AVAILABILITY_OPTIONS = [
  { value: "full_time", label: "Full Time" },
  { value: "part_time", label: "Part Time" },
  { value: "flexible", label: "Flexible" },
  { value: "weekends", label: "Weekends Only" },
];

const EditProfile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState({
    full_name: "",
    bio: "",
    location: "",
    professional_background: "",
    commitment_level: "",
    current_intent: [] as string[],
    availability: "",
    linkedin_url: "",
    github_url: "",
    twitter_url: "",
    portfolio_url: "",
    is_searchable: true,
    avatar_url: "",
    resume_url: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate("/auth");
          return;
        }

        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) throw error;
        if (data) {
          setProfile({
            full_name: data.full_name || "",
            bio: data.bio || "",
            location: data.location || "",
            professional_background: data.professional_background || "",
            commitment_level: data.commitment_level || "",
            current_intent: data.current_intent || [],
            availability: data.availability || "",
            linkedin_url: data.linkedin_url || "",
            github_url: data.github_url || "",
            twitter_url: data.twitter_url || "",
            portfolio_url: data.portfolio_url || "",
            is_searchable: data.is_searchable ?? true,
            avatar_url: data.avatar_url || "",
            resume_url: data.resume_url || "",
          });
        }
      } catch (error: any) {
        console.error("Error fetching profile:", error);
        toast({
          title: "Error loading profile",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: profile.full_name,
          bio: profile.bio,
          location: profile.location,
          professional_background: profile.professional_background,
          commitment_level: profile.commitment_level,
          current_intent: profile.current_intent as ("cofounder" | "team_member" | "client" | "mentor" | "advisor" | "investor")[],
          availability: profile.availability as "full_time" | "part_time" | "flexible" | "weekends" | null,
          linkedin_url: profile.linkedin_url || null,
          github_url: profile.github_url || null,
          twitter_url: profile.twitter_url || null,
          portfolio_url: profile.portfolio_url || null,
          is_searchable: profile.is_searchable,
          avatar_url: profile.avatar_url || null,
          resume_url: profile.resume_url || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your changes have been saved successfully.",
      });
      navigate("/profile");
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error saving profile",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleIntentChange = (value: string, checked: boolean) => {
    setProfile((prev) => ({
      ...prev,
      current_intent: checked
        ? [...prev.current_intent, value]
        : prev.current_intent.filter((i) => i !== value),
    }));
  };

  const initials = profile.full_name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "?";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10">
      <Navbar />
      <div className="container mx-auto max-w-3xl px-4 py-8">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate("/profile")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Profile
        </Button>

        <Card className="p-6 md:p-8">
          <h1 className="text-3xl font-bold mb-6">Edit Profile</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Photo */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Profile Photo</h2>
              <div className="flex justify-center">
                <AvatarUpload
                  currentUrl={profile.avatar_url}
                  onUpload={(url) => setProfile({ ...profile, avatar_url: url })}
                  initials={initials}
                />
              </div>
            </div>

            {/* Basic Info */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Basic Information</h2>
              
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={profile.full_name}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                  placeholder="Your full name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={profile.location}
                  onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                  placeholder="City, Country"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  placeholder="Tell others about yourself..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="professional_background">Professional Background</Label>
                <Textarea
                  id="professional_background"
                  value={profile.professional_background}
                  onChange={(e) => setProfile({ ...profile, professional_background: e.target.value })}
                  placeholder="Your experience and expertise..."
                  rows={4}
                />
              </div>
            </div>

            {/* Intent & Availability */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Intent & Availability</h2>
              
              <div className="space-y-2">
                <Label>What are you looking for?</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {INTENT_OPTIONS.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={option.value}
                        checked={profile.current_intent.includes(option.value)}
                        onCheckedChange={(checked) =>
                          handleIntentChange(option.value, checked as boolean)
                        }
                      />
                      <Label htmlFor={option.value} className="font-normal cursor-pointer">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="availability">Availability</Label>
                <Select
                  value={profile.availability}
                  onValueChange={(value) => setProfile({ ...profile, availability: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your availability" />
                  </SelectTrigger>
                  <SelectContent>
                    {AVAILABILITY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="commitment_level">Commitment Level</Label>
                <Input
                  id="commitment_level"
                  value={profile.commitment_level}
                  onChange={(e) => setProfile({ ...profile, commitment_level: e.target.value })}
                  placeholder="e.g., 10-20 hours/week"
                />
              </div>
            </div>

            {/* Social Links */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Social Links</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="linkedin_url">LinkedIn</Label>
                  <Input
                    id="linkedin_url"
                    value={profile.linkedin_url}
                    onChange={(e) => setProfile({ ...profile, linkedin_url: e.target.value })}
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="github_url">GitHub</Label>
                  <Input
                    id="github_url"
                    value={profile.github_url}
                    onChange={(e) => setProfile({ ...profile, github_url: e.target.value })}
                    placeholder="https://github.com/..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="twitter_url">Twitter / X</Label>
                  <Input
                    id="twitter_url"
                    value={profile.twitter_url}
                    onChange={(e) => setProfile({ ...profile, twitter_url: e.target.value })}
                    placeholder="https://twitter.com/..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="portfolio_url">Portfolio</Label>
                  <Input
                    id="portfolio_url"
                    value={profile.portfolio_url}
                    onChange={(e) => setProfile({ ...profile, portfolio_url: e.target.value })}
                    placeholder="https://yoursite.com"
                  />
                </div>
              </div>
            </div>

            {/* Resume */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Resume</h2>
              <ResumeUpload
                currentUrl={profile.resume_url}
                onUpload={(url) => setProfile({ ...profile, resume_url: url })}
              />
            </div>

            {/* Visibility */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Profile Visibility</h2>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_searchable"
                  checked={profile.is_searchable}
                  onCheckedChange={(checked) =>
                    setProfile({ ...profile, is_searchable: checked as boolean })
                  }
                />
                <Label htmlFor="is_searchable" className="font-normal cursor-pointer">
                  Make my profile visible in search results
                </Label>
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isSaving} className="flex-1">
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Changes
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/profile")}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default EditProfile;
