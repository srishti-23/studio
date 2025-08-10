
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
import AnimatedBackground from "@/components/layout/animated-background";
import MasonryGrid from "@/components/library/masonry-grid";
import { useRouter } from "next/navigation";

export default function LibraryPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    const libraryImages = [
        { id: 1, src: 'https://placehold.co/500x700.png', alt: 'Futuristic city concept' },
        { id: 2, src: 'https://placehold.co/500x400.png', alt: 'Enchanted forest illustration' },
        { id: 3, src: 'https://placehold.co/500x800.png', alt: 'Cyberpunk warrior character' },
        { id: 4, src: 'https://placehold.co/500x500.png', alt: 'Abstract watercolor painting' },
        { id: 5, src: 'https://placehold.co/500x600.png', alt: 'Steampunk airship design' },
        { id: 6, src: 'https://placehold.co/500x450.png', alt: 'Minimalist logo concept' },
        { id: 7, src: 'https://placehold.co/500x750.png', alt: 'Photorealistic portrait' },
        { id: 8, src: 'https://placehold.co/500x550.png', alt: 'Fantasy landscape with dragons' },
        { id: 9, src: 'https://placehold.co/500x650.png', alt: 'Vintage car advertisement' },
    ];
    
    const handleGenerate = (data: { prompt: string; aspectRatio: string; variations: number }) => {
        setIsSubmitting(true);
        const params = new URLSearchParams({
            prompt: data.prompt,
            aspectRatio: data.aspectRatio,
            variations: data.variations.toString(),
        });
        router.push(`/workspace?${params.toString()}`);
    };

    const handleNewChat = () => {
        router.push("/");
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
            <div className="text-center my-12">
                <h1 className="text-5xl md:text-7xl font-bold font-headline tracking-tighter">Your Creative Library</h1>
                <p className="mt-4 max-w-xl mx-auto text-muted-foreground text-lg">
                    A collection of all your generated masterpieces.
                </p>
            </div>
            <MasonryGrid images={libraryImages} />
        </main>
        <PromptForm 
            onGenerate={handleGenerate} 
            isSubmitting={isSubmitting}
            selectedImage={null}
        />
      </SidebarInset>
    </SidebarProvider>
  );
}
