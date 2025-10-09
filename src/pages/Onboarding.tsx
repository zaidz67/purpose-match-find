import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Compass } from "lucide-react";
import IkigaiStep from "@/components/onboarding/IkigaiStep";
import ProfileStep from "@/components/onboarding/ProfileStep";
import SkillsStep from "@/components/onboarding/SkillsStep";

const TOTAL_STEPS = 3;

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const navigate = useNavigate();

  const progress = (currentStep / TOTAL_STEPS) * 100;

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    } else {
      navigate("/dashboard");
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-8">
            <Compass className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold gradient-text">Ikigai Match</span>
          </div>

          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-semibold">Complete Your Profile</h2>
              <span className="text-sm text-muted-foreground">
                Step {currentStep} of {TOTAL_STEPS}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="card-gradient border border-primary/20 rounded-xl p-8 glow-effect">
            {currentStep === 1 && <IkigaiStep onNext={handleNext} />}
            {currentStep === 2 && <ProfileStep onNext={handleNext} onBack={handleBack} />}
            {currentStep === 3 && <SkillsStep onNext={handleNext} onBack={handleBack} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;