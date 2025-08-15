
import { CheckCircle, Circle, Download, LoaderCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StepProps {
  step: number;
  title: string;
  description?: string;
  isCompleted: boolean;
  isActive: boolean;
}

const Step = ({ step, title, description, isCompleted, isActive }: StepProps) => {
  const Icon = isCompleted ? CheckCircle : isActive ? LoaderCircle : Circle;
  return (
    <div className="flex items-start gap-4">
      <div className="flex flex-col items-center">
        <div
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full border-2",
            isCompleted
              ? "border-green-500 bg-green-500/20 text-green-400"
              : "border-muted-foreground",
            isActive && "border-primary text-primary"
          )}
        >
          <Icon className={cn("h-4 w-4", isActive && "animate-spin")} />
        </div>
        <div className="h-16 w-px bg-border" />
      </div>
      <div className="pt-1">
        <h4
          className={cn(
            "font-semibold",
            isCompleted && "text-green-400",
            isActive && "text-primary"
          )}
        >
          {title}
        </h4>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  );
};


interface StepsIndicatorProps {
    currentStep: number;
    prompt: string;
}

export default function StepsIndicator({ currentStep, prompt }: StepsIndicatorProps) {
    const steps = [
        { id: 1, title: 'Prompt', description: `"${prompt}"` },
        { id: 2, title: 'Generate', description: 'AI is creating your ad...' },
        { id: 3, title: 'Download', description: 'Select your favorite variation.' },
    ];

    return (
        <Card className="border-none shadow-none bg-transparent">
            <CardContent className="p-0">
                <div className="flex flex-col">
                    {steps.map((step, index) => (
                        <Step
                            key={step.id}
                            step={step.id}
                            title={step.title}
                            description={step.id === 1 ? step.description : undefined}
                            isCompleted={currentStep > step.id}
                            isActive={currentStep === step.id}
                        />
                    ))}
                     <div className="flex items-start gap-4">
                        <div className="flex flex-col items-center">
                            <div
                            className={cn(
                                "flex h-8 w-8 items-center justify-center rounded-full border-2",
                                currentStep > 3 ? "border-green-500 bg-green-500/20 text-green-400" : "border-muted-foreground"
                            )}
                            >
                            <Download className="h-4 w-4" />
                            </div>
                        </div>
                        <div className="pt-1">
                            <h4 className={cn("font-semibold", currentStep > 3 && "text-green-400")}>Done</h4>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
