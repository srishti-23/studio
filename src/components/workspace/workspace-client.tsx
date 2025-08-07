"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { LoaderCircle } from "lucide-react";
import StepsIndicator from "./steps-indicator";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface WorkspaceClientProps {
  prompt: string;
  aspectRatio: string;
  variations: number;
  imageUrls: string[];
}

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
    }, 2000); // Simulate generation time
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      setMainImage(imageUrls[0]);
      setActiveStep(3);
    }
  }, [isLoading, imageUrls]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full flex-1 text-center p-8">
        <LoaderCircle className="h-12 w-12 animate-spin text-primary mb-4" />
        <h2 className="text-2xl font-headline mb-2">Generating your vision...</h2>
        <p className="max-w-md text-muted-foreground">
          &quot;{prompt}&quot;
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8 flex-1 pb-24">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
        {/* Main Image */}
        <div className="lg:col-span-7 xl:col-span-8 flex items-center justify-center">
          <Card className="w-full aspect-square overflow-hidden shadow-2xl shadow-black/50">
            <Image
              src={mainImage}
              alt="Main generated image"
              width={1024}
              height={1024}
              className="object-contain w-full h-full"
              data-ai-hint="advertisement creative"
            />
          </Card>
        </div>

        {/* Side Panel */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-8">
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
              Download Selected Image
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
