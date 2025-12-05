import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AvatarUpload, ResumeUpload } from "@/components/ui/file-upload";

interface ProfileStepProps {
  onNext: () => void;
  onBack: () => void;
}

const ProfileStep = ({ onNext, onBack }: ProfileStepProps) => {
  const [formData, setFormData] = useState({
    fullName: "",
    location: "",
    bio: "",
    professionalBackground: "",
    intent: [] as string[],
    availability: "",
    commitmentLevel: "",
    avatarUrl: "",
    resumeUrl: "",
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        
        if (profile) {
          setFormData({
            fullName: profile.full_name || "",
            location: profile.location || "",
            bio: profile.bio || "",
            professionalBackground: profile.professional_background || "",
            intent: profile.current_intent || [],
            availability: profile.availability || "",
            commitmentLevel: profile.commitment_level || "",
            avatarUrl: profile.avatar_url || "",
            resumeUrl: profile.resume_url || "",
          });
        }
      }
    };
    loadProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { error } = await supabase.from("profiles").update({
        full_name: formData.fullName,
        location: formData.location,
        bio: formData.bio,
        professional_background: formData.professionalBackground,
        current_intent: formData.intent as any,
        availability: formData.availability as any,
        commitment_level: formData.commitmentLevel,
        avatar_url: formData.avatarUrl || null,
        resume_url: formData.resumeUrl || null,
      }).eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Profile updated!",
        description: "Your profile information has been saved.",
      });
      onNext();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const initials = formData.fullName
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "?";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Build Your Profile</h2>
        <p className="text-muted-foreground">
          Tell us about yourself to help others understand who you are.
        </p>
      </div>

      {/* Avatar Upload */}
      <div className="flex justify-center">
        <AvatarUpload
          currentUrl={formData.avatarUrl}
          onUpload={(url) => setFormData({ ...formData, avatarUrl: url })}
          initials={initials}
        />
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            placeholder="City, Country"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            placeholder="Tell us about yourself..."
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="professionalBackground">Professional Background</Label>
          <Textarea
            id="professionalBackground"
            placeholder="Your experience and expertise..."
            value={formData.professionalBackground}
            onChange={(e) => setFormData({ ...formData, professionalBackground: e.target.value })}
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="availability">Availability</Label>
          <Select value={formData.availability} onValueChange={(value) => setFormData({ ...formData, availability: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select availability" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="full_time">Full Time</SelectItem>
              <SelectItem value="part_time">Part Time</SelectItem>
              <SelectItem value="flexible">Flexible</SelectItem>
              <SelectItem value="weekends">Weekends</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="commitmentLevel">Commitment Level</Label>
          <Input
            id="commitmentLevel"
            placeholder="e.g., 20 hours/week"
            value={formData.commitmentLevel}
            onChange={(e) => setFormData({ ...formData, commitmentLevel: e.target.value })}
          />
        </div>

        {/* Resume Upload */}
        <div className="space-y-2">
          <Label>Resume (Optional)</Label>
          <ResumeUpload
            currentUrl={formData.resumeUrl}
            onUpload={(url) => setFormData({ ...formData, resumeUrl: url })}
          />
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onBack} className="w-full">
          Back
        </Button>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Saving..." : "Continue to Skills"}
        </Button>
      </div>
    </form>
  );
};

export default ProfileStep;