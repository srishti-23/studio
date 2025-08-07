import AppSidebar from "@/components/layout/app-sidebar";
import Header from "@/components/layout/header";
import ImageGrid from "@/components/home/image-grid";
import PromptForm from "@/components/home/prompt-form";
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
} from "@/components/ui/sidebar";

const images = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  src: `https://placehold.co/600x${Math.floor(Math.random() * 200) + 400}.png`,
  alt: `Generated ad image ${i + 1}`,
  hint: ['vibrant advertisement', 'product shot', 'abstract pattern', 'futuristic design', 'minimalist logo', 'nature scene'][i % 6]
}));

export default function Home() {
  const imageUrls = images.map(img => img.src);

  return (
    <SidebarProvider>
      <Sidebar>
        <AppSidebar />
      </Sidebar>
      <SidebarInset className="relative flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 px-4 py-8 lg:px-8">
          <ImageGrid images={images} />
        </main>
        <PromptForm imageUrls={imageUrls} />
      </SidebarInset>
    </SidebarProvider>
  );
}
