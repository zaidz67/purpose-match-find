import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface IkigaiStepProps {
  onNext: () => void;
}

const IkigaiStep = ({ onNext }: IkigaiStepProps) => {
  const [formData, setFormData] = useState({
    whatYouLove: "",
    whatYoureGoodAt: "",
    whatWorldNeeds: "",
    whatYouCanBePaidFor: "",
    careerAspirations: "",
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { error } = await supabase.from("ikigai_responses").upsert({
        user_id: user.id,
        what_you_love: formData.whatYouLove,
        what_youre_good_at: formData.whatYoureGoodAt,
        what_world_needs: formData.whatWorldNeeds,
        what_you_can_be_paid_for: formData.whatYouCanBePaidFor,
        career_aspirations: formData.careerAspirations,
      });

      if (error) throw error;

      toast({
        title: "Great start!",
        description: "Your Ikigai has been saved.",
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Discover Your Ikigai</h2>
        <p className="text-muted-foreground">
          Answer these questions to help us find your perfect match based on your purpose and passion.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="whatYouLove">What do you love doing?</Label>
          <Textarea
            id="whatYouLove"
            placeholder="Share your passions and what energizes you..."
            value={formData.whatYouLove}
            onChange={(e) => setFormData({ ...formData, whatYouLove: e.target.value })}
            required
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="whatYoureGoodAt">What are you good at?</Label>
          <Textarea
            id="whatYoureGoodAt"
            placeholder="Describe your skills and talents..."
            value={formData.whatYoureGoodAt}
            onChange={(e) => setFormData({ ...formData, whatYoureGoodAt: e.target.value })}
            required
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="whatWorldNeeds">What does the world need?</Label>
          <Textarea
            id="whatWorldNeeds"
            placeholder="What problems do you want to solve?"
            value={formData.whatWorldNeeds}
            onChange={(e) => setFormData({ ...formData, whatWorldNeeds: e.target.value })}
            required
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="whatYouCanBePaidFor">What can you be paid for?</Label>
          <Textarea
            id="whatYouCanBePaidFor"
            placeholder="What valuable services or products can you create?"
            value={formData.whatYouCanBePaidFor}
            onChange={(e) => setFormData({ ...formData, whatYouCanBePaidFor: e.target.value })}
            required
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="careerAspirations">Career Aspirations & Purpose</Label>
          <Textarea
            id="careerAspirations"
            placeholder="Where do you see yourself in the future?"
            value={formData.careerAspirations}
            onChange={(e) => setFormData({ ...formData, careerAspirations: e.target.value })}
            required
            rows={3}
          />
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Saving..." : "Continue to Profile"}
      </Button>
    </form>
  );
};

export default IkigaiStep;