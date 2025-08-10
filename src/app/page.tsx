
"use client";

import { useState, useEffect } from "react";
import AppSidebar from "@/components/layout/app-sidebar";
import Header from "@/components/layout/header";
import PromptForm from "@/components/home/prompt-form";
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
} from "@/components/ui/sidebar";
import ImageGrid from "@/components/home/image-grid";
import AnimatedBackground from "@/components/layout/animated-background";
import WorkspaceClient from "@/components/workspace/workspace-client";

interface Generation {
  id: number;
  prompt: string;
  aspectRatio: string;
  variations: number;
  imageUrls: string[];
  isRefinement: boolean;
  refinedFrom?: string;
}

export default function Home() {
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showImageGrid, setShowImageGrid] = useState(true);
    const [generations, setGenerations] = useState<Generation[]>([]);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [promptForRefinement, setPromptForRefinement] = useState("");

    const initialImages = [
        { id: 1, src: 'https://placehold.co/600x800.png', alt: 'Pagoda at night 1', hint: 'pagoda night' },
        { id: 2, src: 'https://placehold.co/600x800.png', alt: 'Pagoda at night 2', hint: 'pagoda night' },
        { id: 3, src: 'https://placehold.co/600x800.png', alt: 'Pagoda at night 3', hint: 'pagoda night' },
        { id: 4, src: 'https://placehold.co/600x800.png', alt: 'Pagoda at night 4', hint: 'pagoda night' },
        { id: 5, src: 'https://placehold.co/600x800.png', alt: 'Pagoda at night 5', hint: 'pagoda night' },
        { id: 6, src: 'https://placehold.co/600x800.png', alt: 'Pagoda at night 6', hint: 'pagoda night' },
        { id: 7, src: 'https://placehold.co/600x800.png', alt: 'Pagoda at night 7', hint: 'pagoda night' },
        { id: 8, src: 'https://placehold.co/600x800.png', alt: 'Pagoda at night 8', hint: 'pagoda night' },
        { id: 9, src: 'https://placehold.co/600x800.png', alt: 'Pagoda at night 9', hint: 'pagoda night' },
    ];

    const handleGenerate = (data: { prompt: string; aspectRatio: string; variations: number }) => {
        setIsGenerating(true);
        setIsSubmitting(true);
        setShowImageGrid(false);

        const isRefinement = selectedImage !== null;
        const newVariations = isRefinement ? 1 : data.variations;
        const newImageUrls = Array.from({ length: newVariations }, (_, i) => `https://placehold.co/1024x1024.png?text=Generated+${i + 1}`);

        const newGeneration: Generation = {
          id: Date.now(),
          prompt: data.prompt,
          aspectRatio: data.aspectRatio,
          variations: newVariations,
          imageUrls: newImageUrls,
          isRefinement: isRefinement,
          refinedFrom: isRefinement ? selectedImage : undefined,
        };
        
        setGenerations(prev => [...prev, newGeneration]);
        setSelectedImage(null); // Reset selected image after starting a new generation/refinement
        setPromptForRefinement(""); // Clear the prompt for refinement
    };
    
    const handleGenerationComplete = () => {
        setIsSubmitting(false);
    };

    const handleNewChat = () => {
        setIsGenerating(false);
        setIsSubmitting(false);
        setShowImageGrid(false);
        setGenerations([]);
        setSelectedImage(null);
        setPromptForRefinement("");
    };
    
    const handleImageSelect = (imageUrl: string, prompt: string) => {
        setSelectedImage(imageUrl);
        setPromptForRefinement(prompt);
    }
    
    const handleRegenerate = (data: { prompt: string; aspectRatio: string; variations: number }) => {
        // This is a new generation from a previous prompt, not a refinement of a selected image
        setSelectedImage(null);
        setPromptForRefinement("");
        handleGenerate(data);
    };

    const handleCancel = () => {
      setIsSubmitting(false);
      // Optionally remove the last generation if it was just added
      // generations.pop();
      // setGenerations([...generations]);
    };

  return (
    <SidebarProvider>
       <AnimatedBackground />
      <Sidebar side="left" variant="floating" collapsible="offcanvas" className="border-r border-sidebar-border">
        <AppSidebar onNewChat={handleNewChat} />
      </Sidebar>
      <SidebarInset className="relative flex flex-col min-h-screen">
        <Header onNewChat={handleNewChat} />
        <main className="flex-1 px-4 py-8 lg:px-8">
            {isGenerating ? (
                <WorkspaceClient 
                    generations={generations}
                    onGenerationComplete={handleGenerationComplete}
                    onImageSelect={handleImageSelect}
                    onRegenerate={handleRegenerate}
                />
            ) : (
                <>
                    <div className="text-center my-12 md:my-24">
                        <h1 className="text-5xl md:text-7xl font-bold font-headline tracking-tighter">Create with AI</h1>
                        <p className="mt-4 max-w-xl mx-auto text-muted-foreground text-lg">
                        Transform your ideas into stunning visuals with our advanced AI image generation technology
                        </p>
                    </div>
                    {showImageGrid && <ImageGrid images={initialImages} />}
                </>
            )}
        </main>
        <PromptForm 
            onGenerate={handleGenerate} 
            isSubmitting={isSubmitting}
            selectedImage={selectedImage}
            initialPrompt={promptForRefinement}
            onCancel={handleCancel}
        />
      </SidebarInset>
    </SidebarProvider>
  );
}
