
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Copy, Download, LoaderCircle, RefreshCw, ThumbsDown, ThumbsUp } from "lucide-react";
import StepsIndicator from "./steps-indicator";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Skeleton } from "../ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "../ui/badge";

interface WorkspaceClientProps {
  prompt: string;
  aspectRatio: string;
  variations: number;
  imageUrls: string[];
  onGenerationComplete: () => void;
}

const WorkspaceSkeleton = () => (
    <div className="container mx-auto p-4 md:p-8 flex-1 pb-24 animate-pulse">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
            <div className="lg:col-span-3">
                 <Card>
                    <div className="p-6">
                        <Skeleton className="h-6 w-3/4 mb-4" />
                        <div className="space-y-4">
                            <div className="flex gap-4">
                                <Skeleton className="h-8 w-8 rounded-full" />
                                <Skeleton className="h-8 w-1/2" />
                            </div>
                             <div className="flex gap-4">
                                <Skeleton className="h-8 w-8 rounded-full" />
                                <Skeleton className="h-8 w-3/4" />
                            </div>
                             <div className="flex gap-4">
                                <Skeleton className="h-8 w-8 rounded-full" />
                                <Skeleton className="h-8 w-1/3" />
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
            <div className="lg:col-span-6 flex items-center justify-center">
                <Card className="w-full aspect-square overflow-hidden shadow-2xl shadow-black/50 flex flex-col">
                    <div className="flex-1 flex items-center justify-center bg-muted/50">
                        <LoaderCircle className="h-12 w-12 text-muted-foreground animate-spin" />
                    </div>
                </Card>
            </div>
            <div className="lg:col-span-3 flex flex-col gap-8">
                <div>
                    <Skeleton className="h-5 w-1/2 mb-4" />
                    <div className="grid grid-cols-2 gap-4">
                        <Skeleton className="aspect-square rounded-lg" />
                        <Skeleton className="aspect-square rounded-lg" />
                        <Skeleton className="aspect-square rounded-lg" />
                        <Skeleton className="aspect-square rounded-lg" />
                    </div>
                </div>
            </div>
        </div>
    </div>
);


export default function WorkspaceClient({
  prompt,
  aspectRatio,
  variations,
  imageUrls,
  onGenerationComplete,
}: WorkspaceClientProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [mainImage, setMainImage] = useState(imageUrls[0]);
  const [activeStep, setActiveStep] = useState(2);
  const { toast } = useToast();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      onGenerationComplete();
    }, 3000); // Simulate generation time
    return () => clearTimeout(timer);
  }, [onGenerationComplete]);

  useEffect(() => {
    if (!isLoading) {
      setMainImage(imageUrls[0]);
      setActiveStep(3);
    }
  }, [isLoading, imageUrls]);

  const handleDownload = async () => {
    try {
      const response = await fetch(mainImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${prompt.slice(0, 20)}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
       toast({
        title: "Image Downloaded",
        description: "The selected image has been saved to your device.",
      });
    } catch (error) {
      console.error("Failed to download image:", error);
      toast({
        variant: "destructive",
        title: "Download Failed",
        description: "Could not download the image. Please try again.",
      });
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt);
    toast({
      title: "Prompt Copied!",
      description: "The generation prompt has been copied to your clipboard.",
    });
  };

  const getAspectRatioClass = (ratio: string) => {
    switch (ratio) {
      case '16:9':
        return 'aspect-video';
      case '1:1':
        return 'aspect-square';
      case '9:16':
        return 'aspect-[9/16]';
      case '4:3':
        return 'aspect-[4/3]';
      default:
        return 'aspect-square';
    }
  };

  if (isLoading) {
    return <WorkspaceSkeleton />;
  }

  return (
    <div className="container mx-auto p-4 md:p-8 flex-1 pb-24">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
        {/* Left Panel: Workflow */}
        <div className="lg:col-span-3">
             <StepsIndicator currentStep={activeStep} prompt={prompt} />
        </div>

        {/* Center Panel: Main Image */}
        <div className="lg:col-span-6 flex flex-col gap-4 items-center">
           <div className="flex justify-between items-center w-full">
                <h2 className="text-xl font-headline tracking-tight">Generated images for {prompt}</h2>
                <Button variant="outline" size="sm">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Regenerate
                </Button>
            </div>
          <Card className={cn("w-full overflow-hidden shadow-2xl shadow-black/50 relative group max-w-2xl", getAspectRatioClass(aspectRatio))}>
            <Image
              src={mainImage}
              alt="Main generated image"
              fill
              className="object-contain w-full h-full"
              data-ai-hint="advertisement creative"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                 <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                        <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 hover:text-white">
                            <ThumbsUp />
                        </Button>
                         <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 hover:text-white">
                            <ThumbsDown />
                        </Button>
                    </div>
                    <div className="flex gap-2">
                         <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 hover:text-white" onClick={handleCopy}>
                            <Copy />
                        </Button>
                         <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 hover:text-white" onClick={handleDownload}>
                            <Download />
                        </Button>
                    </div>
                </div>
            </div>
          </Card>
        </div>

        {/* Right Panel: Variations */}
        <div className="lg:col-span-3 flex flex-col gap-8">
          <div className="flex-1 flex flex-col">
            <h3 className="text-lg font-headline mb-4">Variations</h3>
            <div className="grid grid-cols-2 gap-4">
              {imageUrls.map((url, index) => (
                <Card
                  key={index}
                  className={cn(
                    "aspect-square overflow-hidden cursor-pointer transition-all duration-200 relative group/variation",
                    mainImage === url
                      ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                      : "hover:scale-105"
                  )}
                  onClick={() => setMainImage(url)}
                >
                  <Image
                    src={url}
                    alt={`Variation ${index + 1}`}
                    fill
                    className="object-cover w-full h-full"
                    data-ai-hint="product variation"
                  />
                  <Badge 
                    variant="secondary" 
                    className="absolute top-2 left-2 opacity-80 group-hover/variation:opacity-100 transition-opacity"
                  >
                    {index + 1}
                  </Badge>
                </Card>
              ))}
            </div>
            <Button className="mt-8 w-full" size="lg" onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" />
              Download Selected Image
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
