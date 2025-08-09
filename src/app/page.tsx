
"use client";

import { useState } from "react";
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

export default function Home() {
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [generationProps, setGenerationProps] = useState({
      prompt: "",
      aspectRatio: "1:1",
      variations: 4,
    });

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

    const imageUrls = Array.from({ length: generationProps.variations }, (_, i) => `https://placehold.co/1024x1024.png?text=Variation+${i+1}`);

    const handleGenerate = (data: { prompt: string; aspectRatio: string; variations: number }) => {
        setGenerationProps(data);
        setIsGenerating(true);
        setIsSubmitting(true);
    };
    
    const handleGenerationComplete = () => {
        setIsSubmitting(false);
    };

    const handleNewChat = () => {
        setIsGenerating(false);
        setIsSubmitting(false);
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
                    prompt={generationProps.prompt}
                    aspectRatio={generationProps.aspectRatio}
                    variations={generationProps.variations}
                    imageUrls={imageUrls}
                    onGenerationComplete={handleGenerationComplete}
                />
            ) : (
                <>
                    <div className="text-center my-12 md:my-24">
                        <h1 className="text-5xl md:text-7xl font-bold font-headline tracking-tighter">Create with AI</h1>
                        <p className="mt-4 max-w-xl mx-auto text-muted-foreground text-lg">
                        Transform your ideas into stunning visuals with our advanced AI image generation technology
                        </p>
                    </div>
                    <ImageGrid images={initialImages} />
                </>
            )}
        </main>
        <PromptForm 
            imageUrls={initialImages.map(i => i.src)} 
            onGenerate={handleGenerate} 
            isSubmitting={isSubmitting} 
        />
      </SidebarInset>
    </SidebarProvider>
  );
}
