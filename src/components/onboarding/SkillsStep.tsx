import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, X } from "lucide-react";

interface SkillsStepProps {
  onNext: () => void;
  onBack: () => void;
}

interface Skill {
  name: string;
  proficiency: string;
  years: number;
}

const SkillsStep = ({ onNext, onBack }: SkillsStepProps) => {
  const [skills, setSkills] = useState<Skill[]>([{ name: "", proficiency: "intermediate", years: 1 }]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const addSkill = () => {
    setSkills([...skills, { name: "", proficiency: "intermediate", years: 1 }]);
  };

  const removeSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const updateSkill = (index: number, field: keyof Skill, value: string | number) => {
    const updated = [...skills];
    updated[index] = { ...updated[index], [field]: value };
    setSkills(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // Filter out empty skills
      const validSkills = skills.filter(skill => skill.name.trim());

      if (validSkills.length === 0) {
        toast({
          title: "Add at least one skill",
          description: "Please add at least one skill to continue.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Insert skills
      const { error } = await supabase.from("skills").insert(
        validSkills.map(skill => ({
          user_id: user.id,
          skill_name: skill.name,
          proficiency: skill.proficiency as any,
          years_of_experience: skill.years,
        }))
      );

      if (error) throw error;

      toast({
        title: "Skills added!",
        description: "Your profile is complete.",
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
        <h2 className="text-2xl font-bold mb-2">Add Your Skills</h2>
        <p className="text-muted-foreground">
          Add your skills and expertise to help find the best matches.
        </p>
      </div>

      <div className="space-y-4">
        {skills.map((skill, index) => (
          <div key={index} className="flex gap-3 items-end">
            <div className="flex-1 space-y-2">
              <Label htmlFor={`skill-${index}`}>Skill {index + 1}</Label>
              <Input
                id={`skill-${index}`}
                placeholder="e.g., React, Product Design"
                value={skill.name}
                onChange={(e) => updateSkill(index, "name", e.target.value)}
              />
            </div>
            
            <div className="w-40 space-y-2">
              <Label htmlFor={`proficiency-${index}`}>Proficiency</Label>
              <Select
                value={skill.proficiency}
                onValueChange={(value) => updateSkill(index, "proficiency", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-24 space-y-2">
              <Label htmlFor={`years-${index}`}>Years</Label>
              <Input
                id={`years-${index}`}
                type="number"
                min="0"
                value={skill.years}
                onChange={(e) => updateSkill(index, "years", parseInt(e.target.value) || 0)}
              />
            </div>

            {skills.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeSkill(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}

        <Button type="button" variant="outline" onClick={addSkill} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add Another Skill
        </Button>
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onBack} className="w-full">
          Back
        </Button>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Saving..." : "Complete Setup"}
        </Button>
      </div>
    </form>
  );
};

export default SkillsStep;