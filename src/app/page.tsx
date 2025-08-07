import AppSidebar from "@/components/layout/app-sidebar";
import Header from "@/components/layout/header";
import PromptForm from "@/components/home/prompt-form";
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
} from "@/components/ui/sidebar";

export default function Home() {
  const imageUrls: string[] = [];

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" className="border-r border-sidebar-border">
        <AppSidebar />
      </Sidebar>
      <SidebarInset className="flex flex-col">
        <Header />
        <main className="flex-1"></main>
        <PromptForm imageUrls={imageUrls} />
      </SidebarInset>
    </SidebarProvider>
  );
}
