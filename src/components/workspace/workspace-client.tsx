
"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Copy, Download, LoaderCircle, RefreshCw, ThumbsDown, ThumbsUp } from "lucide-react";
import StepsIndicator from "./steps-indicator";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Skeleton } from "../ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "../ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { addImageToLibrary } from "@/lib/actions/library";

interface Generation {
  id: number;
  prompt: string;
  aspectRatio: string;
  variations: number;
  imageUrls: string[];
  isRefinement: boolean;
  refinedFrom?: string;
}

interface WorkspaceClientProps {
  generations: Generation[];
  onGenerationComplete: () => void;
  onImageSelect: (imageUrl: string, prompt: string) => void;
  onRegenerate: (data: { prompt: string; aspectRatio: string; variations: number }) => void;
  isLoading: boolean;
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


const GenerationBlock = ({ 
    generation, 
    isLast, 
    onImageSelect,
    onGenerationComplete,
    onRegenerate,
}: { 
    generation: Generation; 
    isLast: boolean;
    onImageSelect: (imageUrl: string, prompt: string) => void;
    onGenerationComplete: () => void;
    onRegenerate: (data: { prompt: string; aspectRatio: string; variations: number }) => void;
}) => {
  const [isLoading, setIsLoading] = useState(isLast);
  const [mainImage, setMainImage] = useState(generation.isRefinement ? generation.imageUrls[0] : (generation.refinedFrom ?? generation.imageUrls[0]));
  const [activeStep, setActiveStep] = useState(isLast ? 2 : 4);
  const { toast } = useToast();
  const blockRef = useRef<HTMLDivElement>(null);
  const [feedback, setFeedback] = useState<'liked' | 'disliked' | null>(null);
  const { user } = useAuth();
  const [isDownloaded, setIsDownloaded] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isLast) {
      setIsLoading(true);
      setActiveStep(2); // Prompt is done, Generate is active
      timer = setTimeout(() => {
        setIsLoading(false);
        onGenerationComplete();
        setActiveStep(3); // Generate is done, Download is active
        if (generation.isRefinement) {
            setMainImage(generation.imageUrls[0])
        }
      }, 2000); // Simulate generation time
    } else {
        setIsLoading(false);
        setActiveStep(4); // Block is not the last one, all steps are "done"
    }
    return () => clearTimeout(timer);
  }, [generation, isLast, onGenerationComplete]);

  useEffect(() => {
    if (isLast && blockRef.current && !isLoading) {
      blockRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [isLast, isLoading]);

  const handleDownload = async () => {
    try {
      if (user) {
        await addImageToLibrary(mainImage);
      }

      const response = await fetch(mainImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${generation.prompt.slice(0, 20)}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
       toast({
        title: "Image Downloaded",
        description: "The selected image has been saved to your device and library.",
      });
      setIsDownloaded(true);
      setActiveStep(4); // Mark download as complete
    } catch (error) {
      console.error("Failed to download image:", error);
      toast({
        variant: "destructive",
        title: "Download Failed",
        description: "Could not download the image. Please try again.",
      });
    }
  };

  const handleCopy = async () => {
    try {
        if (!mainImage) return;
        const response = await fetch(mainImage);
        const blob = await response.blob();
        await navigator.clipboard.write([
            new ClipboardItem({ [blob.type]: blob })
        ]);
        toast({
            title: "Image Copied!",
            description: "The image has been copied to your clipboard.",
        });
    } catch (error) {
        console.error("Failed to copy image:", error);
        toast({
            variant: "destructive",
            title: "Copy Failed",
            description: "Could not copy the image. Your browser might not support this feature.",
        });
    }
  };
  
  const handleSelectAndNotify = (url: string) => {
    setMainImage(url);
    if(isLast) {
      onImageSelect(url, generation.prompt);
    }
  };

  const handleFeedback = (newFeedback: 'liked' | 'disliked') => {
    setFeedback(prev => (prev === newFeedback ? null : newFeedback));
  };
  
  const handleRegenerate = () => {
    onRegenerate({
        prompt: generation.prompt,
        aspectRatio: generation.aspectRatio,
        variations: generation.variations
    });
  }


  const getAspectRatioClass = (ratio: string) => {
    switch (ratio) {
      case '16:9': return 'aspect-video';
      case '1:1': return 'aspect-square';
      case '9:16': return 'aspect-[9/16]';
      case '4:3': return 'aspect-[4/3]';
      default: return 'aspect-square';
    }
  };
  
  const displayImage = mainImage;

  return (
    <div ref={blockRef} className="container mx-auto p-4 md:p-8 flex-1 pb-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
        <div className="lg:col-span-3">
             <StepsIndicator currentStep={activeStep} prompt={generation.prompt} isDownloaded={isDownloaded}/>
        </div>

        <div className="lg:col-span-6 flex flex-col gap-4 items-center">
           <div className="flex justify-between items-center w-full">
                <h2 className="text-xl font-headline tracking-tight">{generation.isRefinement ? "Refinement of:" : "Generated images for:"} <span className="text-muted-foreground">{generation.prompt}</span></h2>
                {isLast && !isLoading && (
                    <Button variant="outline" size="sm" onClick={handleRegenerate}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Regenerate
                    </Button>
                )}
            </div>
          <Card className={cn("w-full overflow-hidden shadow-2xl shadow-black/50 relative group max-w-2xl", getAspectRatioClass(generation.aspectRatio))}>
            {isLoading ? (
                <div className="flex-1 flex items-center justify-center bg-muted/50 w-full h-full">
                    <LoaderCircle className="h-12 w-12 text-muted-foreground animate-spin" />
                </div>
            ) : (
                <>
                <Image
                src={displayImage!}
                alt="Main generated image"
                fill
                className="object-contain w-full h-full"
                data-ai-hint="advertisement creative"
                />
                {isLast && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex justify-between items-center">
                            <div className="flex gap-2">
                                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 hover:text-white" onClick={() => handleFeedback('liked')}>
                                    <ThumbsUp className={cn(feedback === 'liked' && "fill-current")} />
                                </Button>
                                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 hover:text-white" onClick={() => handleFeedback('disliked')}>
                                    <ThumbsDown className={cn(feedback === 'disliked' && "fill-current")} />
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
                )}
                </>
            )}
          </Card>
        </div>
        
        <div className="lg:col-span-3 flex flex-col gap-8">
            {!generation.isRefinement && (
                <div className="flex-1 flex flex-col">
                    <h3 className="text-lg font-headline mb-4">Variations</h3>
                    <div className={cn("grid gap-4", generation.variations > 1 ? "grid-cols-2" : "grid-cols-1")}>
                    {generation.imageUrls.map((url, index) => (
                        <Card
                        key={index}
                        className={cn(
                            "aspect-square overflow-hidden cursor-pointer transition-all duration-200 relative group/variation",
                            mainImage === url
                            ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                            : "hover:scale-105"
                        )}
                        onClick={() => handleSelectAndNotify(url)}
                        >
                        <Image
                            src={url}
                            alt={`Image ${index + 1}`}
                            fill
                            className="object-cover w-full h-full"
                            data-ai-hint="product variation"
                        />
                        {generation.variations > 1 && (
                            <Badge 
                            variant="secondary" 
                            className="absolute top-2 left-2 opacity-80 group-hover/variation:opacity-100 transition-opacity"
                            >
                            {index + 1}
                            </Badge>
                        )}
                        </Card>
                    ))}
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};


export default function WorkspaceClient({
  generations,
  onGenerationComplete,
  onImageSelect,
  onRegenerate,
  isLoading,
}: WorkspaceClientProps) {
  
  if (isLoading) {
      return <WorkspaceSkeleton />
  }

  return (
    <div className="flex flex-col gap-8">
      {generations.map((gen, index) => (
        <GenerationBlock
          key={gen.id}
          generation={gen}
          isLast={index === generations.length - 1}
          onImageSelect={onImageSelect}
          onGenerationComplete={onGenerationComplete}
          onRegenerate={onRegenerate}
        />
      ))}
    </div>
  );
}
