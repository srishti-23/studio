
"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import { useSearchParams, useRouter } from 'next/navigation';
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
import { useAuth } from "@/hooks/use-auth";
import { createConversation, addMessageToConversation, getConversationById } from "@/lib/actions/history";
import { useToast } from "@/hooks/use-toast";

interface Generation {
  id: number;
  prompt: string;
  aspectRatio: string;
  variations: number;
  imageUrls: string[];
  isRefinement: boolean;
  refinedFrom?: string;
}

function HomePageContent() {
    const { user, isLoading: isAuthLoading } = useAuth();
    const { toast } = useToast();
    const router = useRouter();
    const searchParams = useSearchParams();
    const conversationIdFromUrl = searchParams.get('conversationId');

    const [isGenerating, setIsGenerating] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showImageGrid, setShowImageGrid] = useState(true);
    const [generations, setGenerations] = useState<Generation[]>([]);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [promptForRefinement, setPromptForRefinement] = useState("");
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
    const [isLoadingConversation, setIsLoadingConversation] = useState(false);

    const handleNewChat = useCallback(() => {
        setIsGenerating(false);
        setIsSubmitting(false);
        setShowImageGrid(true); 
        setGenerations([]);
        setSelectedImage(null);
        setPromptForRefinement("");
        setActiveConversationId(null);
        if (conversationIdFromUrl) {
            router.push('/');
        }
    }, [conversationIdFromUrl, router]);

    useEffect(() => {
        if (conversationIdFromUrl) {
            if (conversationIdFromUrl !== activeConversationId) {
                setActiveConversationId(conversationIdFromUrl);
                setIsLoadingConversation(true);
                setIsGenerating(true);
                setShowImageGrid(false);

                getConversationById(conversationIdFromUrl).then(result => {
                    if (result.success && result.conversation) {
                        setGenerations(result.conversation.messages);
                    } else {
                        toast({
                            variant: "destructive",
                            title: "Load Error",
                            description: result.message || "Could not load conversation.",
                        });
                        handleNewChat();
                    }
                    setIsLoadingConversation(false);
                });
            }
        } else {
           handleNewChat();
        }
    }, [conversationIdFromUrl, activeConversationId, handleNewChat, toast]);

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

    const handleGenerate = async (data: { prompt: string; aspectRatio: string; variations: number }) => {
        if (!user) {
            toast({
                variant: "destructive",
                title: "Authentication Error",
                description: "You must be logged in to start a chat.",
            });
            router.push('/login');
            return;
        }

        setIsSubmitting(true);
        if (!activeConversationId) {
            setIsGenerating(true);
            setShowImageGrid(false);
        }

        const isRefinement = selectedImage !== null;
        const newVariations = isRefinement ? 1 : data.variations;
        // This is a placeholder. In a real app, you'd get this from an AI service.
        const newImageUrls = Array.from({ length: newVariations }, (_, i) => `https://placehold.co/1024x1024.png?text=Generated+${i + 1}`);

        const newGeneration: Omit<Generation, 'id'> = {
          prompt: data.prompt,
          aspectRatio: data.aspectRatio,
          variations: newVariations,
          imageUrls: newImageUrls,
          isRefinement: isRefinement,
          refinedFrom: isRefinement ? selectedImage : undefined,
        };
        
        // Optimistically update UI
        setGenerations(prev => [...prev, {...newGeneration, id: Date.now() }]);
        setSelectedImage(null); 
        setPromptForRefinement(data.prompt); 

        let result;
        if (activeConversationId) {
            result = await addMessageToConversation(activeConversationId, newGeneration);
        } else {
            result = await createConversation(newGeneration);
            if (result.success && result.conversationId) {
                // IMPORTANT: Update URL to reflect the new conversation ID
                router.push(`/?conversationId=${result.conversationId}`);
                setActiveConversationId(result.conversationId);
            }
        }

        if (!result.success) {
            toast({
                variant: "destructive",
                title: "History Error",
                description: result.message,
            });
            // Optional: revert optimistic update if save fails
            setGenerations(prev => prev.slice(0, -1));
        }

        // This would be replaced by a real check on the AI generation status
        setTimeout(() => setIsSubmitting(false), 2000); 
    };
    
    const handleGenerationComplete = () => {
        setIsSubmitting(false);
    };
    
    const handleImageSelect = (imageUrl: string, prompt: string) => {
        setSelectedImage(imageUrl);
        setPromptForRefinement(prompt);
    }
    
    const handleRegenerate = (data: { prompt: string; aspectRatio: string; variations: number }) => {
        setSelectedImage(null);
        handleGenerate(data);
    };

    const handleCancel = () => {
      setIsSubmitting(false);
      setSelectedImage(null);
    };
    
    const lastGenerationPrompt = generations.length > 0 ? generations[generations.length - 1].prompt : "";
    const displayPrompt = promptForRefinement || lastGenerationPrompt;

  return (
    <SidebarProvider>
       <AnimatedBackground />
      <Sidebar side="left" variant="floating" collapsible="offcanvas" className="border-r border-sidebar-border">
        <AppSidebar onNewChat={handleNewChat} />
      </Sidebar>
      <SidebarInset className="relative flex flex-col min-h-screen">
        <Header onNewChat={handleNewChat} />
        <main className="flex-1 px-4 py-8 lg:px-8">
            {isGenerating || isLoadingConversation ? (
                <WorkspaceClient 
                    generations={generations}
                    onGenerationComplete={handleGenerationComplete}
                    onImageSelect={handleImageSelect}
                    onRegenerate={handleRegenerate}
                    isLoading={isLoadingConversation || (isGenerating && generations.length === 0)}
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
            initialPrompt={displayPrompt}
            onCancel={handleCancel}
        />
      </SidebarInset>
    </SidebarProvider>
  );
}

export default function Home() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <HomePageContent />
        </Suspense>
    )
}
