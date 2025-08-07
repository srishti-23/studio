import {
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarSeparator,
  SidebarGroup,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";
import {
  FilePlus2,
  Search,
  MessageSquare,
  ChevronDown,
} from "lucide-react";

export default function AppSidebar() {
  const historyItems = [
    { id: 1, prompt: "A sleek electric car on a futuristic highway", image: "https://placehold.co/40x40.png" },
    { id: 2, prompt: "Artisanal coffee beans in a rustic setting", image: "https://placehold.co/40x40.png" },
    { id: 3, prompt: "A vibrant abstract painting for a tech startup", image: "https://placehold.co/40x40.png" },
    { id: 4, prompt: "Luxury watch with intricate details on a dark background", image: "https://placehold.co/40x40.png" },
  ];

  return (
    <>
      <SidebarHeader>
        <Button variant="outline" className="w-full justify-start">
          <FilePlus2 className="mr-2 h-4 w-4" />
          New Chat
        </Button>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search..." className="pl-8" />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <ScrollArea className="h-full">
          <SidebarMenu>
            <SidebarGroup>
              <SidebarGroupLabel>History</SidebarGroupLabel>
              {historyItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton className="h-auto" size="lg" isActive={false}>
                    <Image
                      src={item.image}
                      alt={item.prompt}
                      width={40}
                      height={40}
                      className="rounded-md"
                      data-ai-hint="advertisement design"
                    />
                    <span className="truncate text-sm font-normal whitespace-normal">
                      {item.prompt}
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarGroup>
          </SidebarMenu>
        </ScrollArea>
      </SidebarContent>

      <SidebarFooter>
        <SidebarSeparator />
        <SidebarMenu>
          <SidebarMenuItem>
             <SidebarMenuButton>
                <Avatar className="h-8 w-8">
                    <AvatarImage src="https://placehold.co/40x40.png" alt="@user" />
                    <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <span>Guest User</span>
                <ChevronDown className="ml-auto h-4 w-4" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </>
  );
}
