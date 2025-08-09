"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Copy, Download, LoaderCircle, RefreshCw, ThumbsDown, ThumbsUp } from "lucide-react";
import StepsIndicator from "./steps-indicator";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Skeleton } from "../ui/skeleton";

interface WorkspaceClientProps {
  prompt: string;
  aspectRatio: string;
  variations: number;
  imageUrls: string[];
}

const WorkspaceSkeleton = () => (
    <div className="container mx-auto p-4 md:p-8 flex-1 pb-24 animate-pulse">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
            <div className="lg:col-span-7 flex items-center justify-center">
                <Card className="w-full aspect-square overflow-hidden shadow-2xl shadow-black/50 flex flex-col">
                    <div className="flex justify-end p-2">
                        <RefreshCw className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 flex items-center justify-center bg-muted/50">
                        <LoaderCircle className="h-12 w-12 text-muted-foreground animate-spin" />
                    </div>
                    <div className="flex justify-between items-center p-4 bg-card">
                        <div className="flex gap-2">
                            <ThumbsUp className="h-5 w-5 text-muted-foreground" />
                            <ThumbsDown className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="flex gap-2">
                            <Copy className="h-5 w-5 text-muted-foreground" />
                            <Download className="h-5 w-5 text-muted-foreground" />
                        </div>
                    </div>
                </Card>
            </div>
            <div className="lg:col-span-5 flex flex-col gap-8">
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
                <div>
                    <Skeleton className="h-5 w-1/4 mb-4" />
                    <div className="grid grid-cols-2 gap-4">
                        <Skeleton className="aspect-square rounded-lg" />
                        <Skeleton className="aspect-square rounded-lg" />
                        <Skeleton className="aspect-square rounded-lg" />
                        <Skeleton className="aspect-square rounded-lg" />
                    </div>
                    <Skeleton className="h-12 w-full mt-8" />
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
}: WorkspaceClientProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [mainImage, setMainImage] = useState(imageUrls[0]);
  const [activeStep, setActiveStep] = useState(2);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000); // Simulate generation time
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      setMainImage(imageUrls[0]);
      setActiveStep(3);
    }
  }, [isLoading, imageUrls]);

  if (isLoading) {
    return <WorkspaceSkeleton />;
  }

  return (
    <div className="container mx-auto p-4 md:p-8 flex-1 pb-24">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
        {/* Main Image */}
        <div className="lg:col-span-7 flex flex-col gap-4">
           <div className="flex justify-between items-center">
                <h2 className="text-xl font-headline tracking-tight">"{prompt}"</h2>
                <Button variant="outline" size="sm">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Regenerate
                </Button>
            </div>
          <Card className="w-full aspect-square overflow-hidden shadow-2xl shadow-black/50 relative group max-w-2xl mx-auto">
            <Image
              src={mainImage}
              alt="Main generated image"
              width={1024}
              height={1024}
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
                         <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 hover:text-white">
                            <Copy />
                        </Button>
                         <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 hover:text-white">
                            <Download />
                        </Button>
                    </div>
                </div>
            </div>
          </Card>
        </div>

        {/* Side Panel */}
        <div className="lg:col-span-5 flex flex-col gap-8">
          <StepsIndicator currentStep={activeStep} prompt={prompt} />

          {/* Variations */}
          <div className="flex-1 flex flex-col">
            <h3 className="text-lg font-headline mb-4">Variations</h3>
            <div className="grid grid-cols-2 gap-4">
              {imageUrls.map((url, index) => (
                <Card
                  key={index}
                  className={cn(
                    "aspect-square overflow-hidden cursor-pointer transition-all duration-200",
                    mainImage === url
                      ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                      : "hover:scale-105"
                  )}
                  onClick={() => setMainImage(url)}
                >
                  <Image
                    src={url}
                    alt={`Variation ${index + 1}`}
                    width={200}
                    height={200}
                    className="object-cover w-full h-full"
                    data-ai-hint="product variation"
                  />
                </Card>
              ))}
            </div>
            <Button className="mt-8 w-full" size="lg">
              <Download className="mr-2 h-4 w-4" />
              Download Selected Image
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
