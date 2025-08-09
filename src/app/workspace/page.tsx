
import { Suspense } from "react";
import type { Metadata } from 'next';
import AnimatedBackground from "@/components/layout/animated-background";
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
} from "@/components/ui/sidebar";
import AppSidebar from "@/components/layout/app-sidebar";
import WorkspaceHeader from "@/components/workspace/workspace-header";
import WorkspaceClient from "@/components/workspace/workspace-client";
import PromptForm from "@/components/home/prompt-form";

export const metadata: Metadata = {
  title: 'Workspace - AdFleek.io',
  description: 'Your creative workspace.',
};

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

  const variations = parseInt(
    Array.isArray(searchParams.variations)
      ? searchParams.variations[0]
      : searchParams.variations || "4",
    10
  );

  const imageUrls = Array.from({ length: variations }, (_, i) => `https://placehold.co/1024x1024.png?text=Variation+${i+1}`);

  return (
    <SidebarProvider>
      <AnimatedBackground />
      <Sidebar side="left" variant="floating" collapsible="offcanvas" className="border-r border-sidebar-border">
        <AppSidebar />
      </Sidebar>
      <SidebarInset className="relative flex flex-col min-h-screen">
        <WorkspaceHeader />
        <main className="flex-1 flex flex-col">
          <Suspense fallback={<div className="flex items-center justify-center h-full flex-1">Loading...</div>}>
            <WorkspaceClient 
              prompt={prompt}
              aspectRatio={aspectRatio}
              variations={variations}
              imageUrls={imageUrls}
            />
          </Suspense>
        </main>
        <PromptForm initialPrompt={prompt} imageUrls={[]} onGenerate={() => {}} />
      </SidebarInset>
    </SidebarProvider>
  );
}
