import PromptForm from "@/components/home/prompt-form";
import WorkspaceClient from "@/components/workspace/workspace-client";
import { Suspense } from "react";
import type { Metadata } from 'next';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Rocket } from "lucide-react";

export const metadata: Metadata = {
  title: 'Workspace - AdFleek.io',
  description: 'Review and refine your generated ad creatives.',
};

function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-lg px-4 md:px-6">
        <Button variant="outline" asChild className="gap-2">
            <Link href="/">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
            </Link>
        </Button>
        <div className="flex-1 flex justify-center">
          <Link href="/" className="flex items-center gap-2 font-headline text-lg font-bold">
              <Rocket className="h-6 w-6" />
              <span className="text-primary">AdFleek.io</span>
          </Link>
        </div>
        <div className="w-[145px]"></div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}

function WorkspaceContent({
  prompt,
  aspectRatio,
  variations,
}: {
  prompt: string;
  aspectRatio: string;
  variations: number;
}) {
  const imageUrls = Array.from({ length: variations }, (_, i) => 
    `https://placehold.co/1024x1024.png?text=Variation+${i+1}`
  );

  return (
    <div className="relative flex flex-col flex-1 h-full">
      <WorkspaceClient
        prompt={prompt}
        aspectRatio={aspectRatio}
        variations={variations}
        imageUrls={imageUrls}
      />
      <PromptForm initialPrompt={prompt} imageUrls={imageUrls} />
    </div>
  );
}


export default function WorkspacePage({
  searchParams,
}: {
  searchParams: { [key:string]: string | string[] | undefined };
}) {
  const prompt = Array.isArray(searchParams.prompt)
    ? searchParams.prompt[0]
    : searchParams.prompt || "";
  const aspectRatio = Array.isArray(searchParams.aspectRatio)
    ? searchParams.aspectRatio[0]
    : searchParams.aspectRatio || "1:1";
  const variations = Number(searchParams.variations) || 4;

  return (
    <WorkspaceLayout>
        <Suspense fallback={<div className="flex items-center justify-center h-full">Loading workspace...</div>}>
            <WorkspaceContent
                prompt={prompt}
                aspectRatio={aspectRatio}
                variations={variations}
            />
        </Suspense>
    </WorkspaceLayout>
  );
}
