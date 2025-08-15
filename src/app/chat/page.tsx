
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
} from '@/components/ui/sidebar';
import AppSidebar from '@/components/layout/app-sidebar';
import Header from '@/components/layout/header';
import PromptForm from '@/components/home/prompt-form';
import AnimatedBackground from '@/components/layout/animated-background';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { createConversation } from '@/lib/actions/history';

interface Generation {
  prompt: string;
  aspectRatio: string;
  variations: number;
  imageUrls: string[];
  isRefinement: boolean;
  refinedFrom?: string;
}

export default function NewChatPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();

  const handleNewChat = () => {
    // Already on the new chat page, so this just ensures we are at the root
    router.push('/chat');
  };

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

    const newImageUrls = Array.from({ length: data.variations }, (_, i) => `https://placehold.co/1024x1024.png?text=Generated+${i + 1}`);

    const newGeneration: Omit<Generation, 'id'> = {
      prompt: data.prompt,
      aspectRatio: data.aspectRatio,
      variations: data.variations,
      imageUrls: newImageUrls,
      isRefinement: false,
    };

    const result = await createConversation(newGeneration);

    if (result.success && result.conversationId) {
      // Redirect to the newly created conversation
      router.push(`/?conversationId=${result.conversationId}`);
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.message || 'Failed to start a new conversation.',
      });
      setIsSubmitting(false);
    }
  };

  return (
    <SidebarProvider>
      <AnimatedBackground />
      <Sidebar side="left" variant="floating" collapsible="offcanvas" className="border-r border-sidebar-border">
        <AppSidebar onNewChat={handleNewChat} />
      </Sidebar>
      <SidebarInset className="relative flex flex-col min-h-screen">
        <Header onNewChat={handleNewChat} />
        <main className="flex-1 flex flex-col justify-center items-center px-4 py-8 lg:px-8">
            <div className="text-center">
                <h1 className="text-4xl md:text-6xl font-bold font-headline tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-foreground to-muted-foreground">
                    What&apos;s on your creative mind?
                </h1>
                <p className="mt-4 max-w-xl mx-auto text-muted-foreground text-lg">
                    Begin by typing a prompt below. Describe anything you can imagine.
                </p>
            </div>
        </main>
        <PromptForm
          onGenerate={handleGenerate}
          isSubmitting={isSubmitting}
          selectedImage={null}
          onCancel={() => {}}
        />
      </SidebarInset>
    </SidebarProvider>
  );
}
