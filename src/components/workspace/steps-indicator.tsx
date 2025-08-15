
import { CheckCircle, Circle, Download, LoaderCircle, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepsIndicatorProps {
    currentStep: number;
    prompt: string;
    isDownloaded?: boolean;
}

export default function StepsIndicator({ currentStep, prompt, isDownloaded = false }: StepsIndicatorProps) {
  const steps = [
      { id: 1, title: 'Prompt', description: `"${prompt}"`, icon: CheckCircle },
      { id: 2, title: 'Generate', description: 'AI is creating your ad...', icon: ImageIcon },
      { id: 3, title: 'Download', description: 'Select your favorite variation.', icon: Download },
  ];

  return (
      <div className="flex flex-col justify-between p-4 h-full">
          <div className="space-y-2">
            {steps.map((step, index) => {
                const isDownloadStep = step.id === 3;
                const isCompleted = isDownloadStep ? isDownloaded : currentStep > step.id;
                const isActive = currentStep === step.id && !isCompleted;
                const Icon = step.icon;

                return (
                    <div key={step.id} className="flex items-start gap-4">
                        <div className="flex flex-col items-center self-stretch">
                            <div
                                className={cn(
                                    "flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors duration-300",
                                    isCompleted
                                        ? "border-green-500 bg-green-500/20 text-green-400"
                                        : "border-muted-foreground text-muted-foreground",
                                    isActive && "border-primary text-primary"
                                )}
                            >
                               {isActive ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />}
                            </div>
                            {index < steps.length - 1 && (
                                <div className={cn(
                                    "flex-1 w-px bg-border my-2 transition-colors duration-300",
                                    isCompleted && "bg-green-500"
                                    )} />
                            )}
                        </div>
                        <div className="pt-1">
                            <h4
                                className={cn(
                                    "font-semibold text-sm transition-colors duration-300",
                                    isCompleted && "text-green-400",
                                    isActive && "text-primary"
                                )}
                            >
                                {step.title}
                            </h4>
                            <p className="mt-1 text-xs text-muted-foreground line-clamp-3">{step.description}</p>
                        </div>
                    </div>
                );
            })}
          </div>
      </div>
  );
}
