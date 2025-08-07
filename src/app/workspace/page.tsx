import PromptForm from "@/components/home/prompt-form";
import { Suspense } from "react";
import type { Metadata } from 'next';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Rocket } from "lucide-react";
import AnimatedBackground from "@/components/layout/animated-background";

export const metadata: Metadata = {
  title: 'Workspace - AdFleek.io',
  description: 'Start a new creation.',
};

export default function WorkspacePage({
  searchParams,
}: {
  searchParams: { [key:string]: string | string[] | undefined };
}) {
  const prompt = Array.isArray(searchParams.prompt)
    ? searchParams.prompt[0]
    : searchParams.prompt || "";
  
  const imageUrls: string[] = [];

  return (
    <div className="relative flex flex-col min-h-screen">
       <AnimatedBackground />
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-lg px-4 md:px-6">
        <div className="flex-1 flex justify-center">
          <Link href="/" className="flex items-center gap-2 font-headline text-lg font-bold">
              <Rocket className="h-6 w-6" />
              <span className="text-primary">AdFleek.io</span>
          </Link>
        </div>
      </header>
      <main className="flex-1 flex flex-col justify-center">
        <Suspense fallback={<div className="flex items-center justify-center h-full">Loading...</div>}>
            <div className="text-center my-12 md:my-24">
                <h1 className="text-5xl md:text-7xl font-bold font-headline tracking-tighter">Create with AI</h1>
                <p className="mt-4 max-w-xl mx-auto text-muted-foreground text-lg">
                    Transform your ideas into stunning visuals.
                </p>
            </div>
        </Suspense>
      </main>
      <PromptForm initialPrompt={prompt} imageUrls={imageUrls} />
    </div>
  );
}
