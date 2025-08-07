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

export default function Home() {
  const images: { id: number; src: string; alt: string; hint: string; }[] = [];

  return (
    <SidebarProvider>
       <AnimatedBackground />
      <Sidebar side="left" variant="floating" collapsible="offcanvas" className="border-r border-sidebar-border">
        <AppSidebar />
      </Sidebar>
      <SidebarInset className="relative flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 px-4 py-8 lg:px-8">
            <div className="text-center my-12 md:my-24">
                <h1 className="text-5xl md:text-7xl font-bold font-headline tracking-tighter">Create with AI</h1>
                <p className="mt-4 max-w-xl mx-auto text-muted-foreground text-lg">
                Transform your ideas into stunning visuals with our advanced AI image generation technology
                </p>
            </div>
            <ImageGrid images={images} />
        </main>
        <PromptForm imageUrls={images.map(i => i.src)} />
      </SidebarInset>
    </SidebarProvider>
  );
}
