import PromptForm from "@/components/home/prompt-form";
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
    <SidebarProvider>
      <AnimatedBackground />
      <Sidebar side="left" variant="floating" collapsible="offcanvas" className="border-r border-sidebar-border">
        <AppSidebar />
      </Sidebar>
      <SidebarInset className="relative flex flex-col min-h-screen">
        <WorkspaceHeader />
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
      </SidebarInset>
    </SidebarProvider>
  );
}
