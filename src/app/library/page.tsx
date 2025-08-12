
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
import AnimatedBackground from "@/components/layout/animated-background";
import MasonryGrid from "@/components/library/masonry-grid";
import { useRouter } from "next/navigation";
import { getLibraryImages } from "@/lib/actions/library";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";

interface LibraryImage {
  _id: string;
  src: string;
  alt: string;
}

const LibrarySkeleton = () => (
    <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4 p-4">
        {[...Array(9)].map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-xl" />
        ))}
    </div>
)


export default function LibraryPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [images, setImages] = useState<LibraryImage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const { user, isLoading: isAuthLoading } = useAuth();

    useEffect(() => {
        if (!isAuthLoading && !user) {
            router.push('/login');
        }
    }, [user, isAuthLoading, router]);
    
    useEffect(() => {
        if (user) {
            setIsLoading(true);
            getLibraryImages().then(result => {
                if (result.success) {
                    setImages(result.images.map((img: any) => ({...img, id: img._id})));
                }
                setIsLoading(false);
            });
        }
    }, [user]);

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
                    A collection of all your downloaded masterpieces.
                </p>
            </div>
            {isLoading ? <LibrarySkeleton /> : <MasonryGrid images={images} />}
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
