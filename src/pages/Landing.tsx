import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Sparkles, Users, Compass, MessageCircle } from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Compass className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold gradient-text">Ikigai Match</span>
        </div>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={() => navigate("/auth")}>
            Sign In
          </Button>
          <Button onClick={() => navigate("/auth")}>
            Get Started
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <h1 className="text-5xl md:text-7xl font-bold leading-tight">
            Find Your Perfect{" "}
            <span className="gradient-text">Cofounder Match</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            AI-powered matching based on your Ikigai - connect with people who share your purpose, passion, and professional goals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Button size="lg" onClick={() => navigate("/auth")} className="text-lg px-8 py-6">
              Start Your Journey
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <FeatureCard
            icon={<Sparkles className="h-12 w-12" />}
            title="AI-Powered Matching"
            description="Natural language search powered by advanced AI to find your perfect match based on purpose and skills."
          />
          <FeatureCard
            icon={<Compass className="h-12 w-12" />}
            title="Ikigai Discovery"
            description="Discover your purpose through our guided Ikigai questionnaire and connect with aligned individuals."
          />
          <FeatureCard
            icon={<MessageCircle className="h-12 w-12" />}
            title="Meaningful Connections"
            description="In-app messaging with AI-suggested conversation starters to build authentic relationships."
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto card-gradient border border-primary/20 rounded-2xl p-12 glow-effect">
          <Users className="h-16 w-16 mx-auto mb-6 text-primary" />
          <h2 className="text-4xl font-bold mb-4">
            Ready to Find Your Match?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join our community of purpose-driven individuals and discover your perfect cofounder, team member, or mentor.
          </p>
          <Button size="lg" onClick={() => navigate("/auth")} className="text-lg px-12 py-6">
            Join Now - It's Free
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p>© 2025 Ikigai Match. Find your purpose, find your people.</p>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <div className="card-gradient border border-primary/10 rounded-xl p-8 smooth-transition hover:border-primary/30 hover:shadow-card">
    <div className="text-primary mb-4">{icon}</div>
    <h3 className="text-xl font-semibold mb-3">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </div>
);

export default Landing;