import { Card } from "@/components/ui/card";
import { Heart, Award, Globe, DollarSign } from "lucide-react";

interface IkigaiVisualizationProps {
  ikigai: {
    what_you_love?: string;
    what_youre_good_at?: string;
    what_world_needs?: string;
    what_you_can_be_paid_for?: string;
    purpose_statement?: string;
    career_aspirations?: string;
  };
}

export const IkigaiVisualization = ({ ikigai }: IkigaiVisualizationProps) => {
  const circles = [
    {
      title: "What You Love",
      content: ikigai.what_you_love,
      icon: Heart,
      color: "from-rose-500/20 to-pink-500/20",
      border: "border-rose-500/30"
    },
    {
      title: "What You're Good At",
      content: ikigai.what_youre_good_at,
      icon: Award,
      color: "from-amber-500/20 to-orange-500/20",
      border: "border-amber-500/30"
    },
    {
      title: "What the World Needs",
      content: ikigai.what_world_needs,
      icon: Globe,
      color: "from-emerald-500/20 to-green-500/20",
      border: "border-emerald-500/30"
    },
    {
      title: "What You Can Be Paid For",
      content: ikigai.what_you_can_be_paid_for,
      icon: DollarSign,
      color: "from-primary/20 to-secondary/20",
      border: "border-primary/30"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">Ikigai Profile</h2>
        <p className="text-muted-foreground">
          The intersection of passion, mission, vocation, and profession
        </p>
      </div>

      {/* Four Circles */}
      <div className="grid md:grid-cols-2 gap-6">
        {circles.map((circle, idx) => {
          const Icon = circle.icon;
          return (
            <Card 
              key={idx}
              className={`p-6 bg-gradient-to-br ${circle.color} border-2 ${circle.border} hover:scale-105 transition-transform duration-300`}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-background/50">
                  <Icon className="h-5 w-5 text-foreground" />
                </div>
                <div className="flex-1 space-y-2">
                  <h3 className="font-semibold text-foreground">{circle.title}</h3>
                  <p className="text-sm text-foreground/80">
                    {circle.content || "Not specified"}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Purpose Statement */}
      {ikigai.purpose_statement && (
        <Card className="p-6 bg-gradient-to-r from-primary/10 to-secondary/10 border-2 border-primary/20">
          <div className="text-center space-y-3">
            <h3 className="text-lg font-semibold text-foreground">Purpose Statement</h3>
            <p className="text-foreground/90 italic text-lg">
              "{ikigai.purpose_statement}"
            </p>
          </div>
        </Card>
      )}

      {/* Career Aspirations */}
      {ikigai.career_aspirations && (
        <Card className="p-6 bg-card/50 border border-border/50">
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground">Career Aspirations</h3>
            <p className="text-foreground/80">
              {ikigai.career_aspirations}
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};
