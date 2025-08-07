import AppSidebar from "@/components/layout/app-sidebar";
import Header from "@/components/layout/header";
import PromptForm from "@/components/home/prompt-form";
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
} from "@/components/ui/sidebar";
import ImageGrid from "@/components/home/image-grid";

export default function Home() {
  const imageUrls: string[] = [
    "https://placehold.co/600x453.png",
    "https://placehold.co/600x476.png",
    "https://placehold.co/600x443.png",
    "https://placehold.co/600x436.png",
    "https://placehold.co/600x491.png",
    "https://placehold.co/600x426.png",
    "https://placehold.co/600x421.png",
    "https://placehold.co/600x501.png",
    "https://placehold.co/600x467.png",
    "https://placehold.co/600x435.png",
    "https://placehold.co/600x404.png",
    "https://placehold.co/600x469.png",
  ];
   const images = [
    { id: 1, src: "https://placehold.co/600x453.png", alt: "Generated ad image 1", hint: "modern architecture" },
    { id: 2, src: "https://placehold.co/600x476.png", alt: "Generated ad image 2", hint: "geometric patterns" },
    { id: 3, src: "https://placehold.co/600x443.png", alt: "Generated ad image 3", hint: "cityscape night" },
    { id: 4, src: "https://placehold.co/600x436.png", alt: "Generated ad image 4", hint: "woman portrait" },
    { id: 5, src: "https://placehold.co/600x491.png", alt: "Generated ad image 5", hint: "minimalist landscape" },
    { id: 6, src: "https://placehold.co/600x426.png", alt: "Generated ad image 6", hint: "abstract art" },
    { id: 7, src: "https://placehold.co/600x421.png", alt: "Generated ad image 7", hint: "laptop technology" },
    { id: 8, src: "https://placehold.co/600x501.png", alt: "Generated ad image 8", hint: "space nebula" },
  ];

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" className="border-r border-sidebar-border">
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
        <PromptForm imageUrls={imageUrls} />
      </SidebarInset>
    </SidebarProvider>
  );
}
