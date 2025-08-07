import {
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  HelpCircle,
  LayoutGrid,
  PenSquare,
  Shapes,
  AppWindow,
  FilePlus2,
  Search,
  ChevronDown
} from "lucide-react";
import { Input } from "../ui/input";
import { ScrollArea } from "../ui/scroll-area";
import Image from "next/image";

export default function AppSidebar() {
    const historyItems = [
        { id: 1, text: "A sleek electric car on a futuristic highway", image: "https://placehold.co/40x40.png" },
        { id: 2, text: "Artisanal coffee beans in a rustic setting", image: "https://placehold.co/40x40.png" },
        { id: 3, text: "A vibrant abstract painting for a tech startup", image: "https://placehold.co/40x40.png" },
        { id: 4, text: "Luxury watch with intricate details on a dark background", image: "https://placehold.co/40x40.png" },
    ];
  return (
    <>
      <SidebarHeader className="p-4">
        <Button variant="outline" className="w-full justify-start">
            <FilePlus2 className="mr-2 h-4 w-4" />
            New Chat
        </Button>
        <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search..." className="pl-8" />
        </div>
      </SidebarHeader>

      <SidebarContent className="flex-1 overflow-auto p-0">
        <ScrollArea className="h-full">
            <SidebarMenu className="gap-0 p-4 pt-0">
            <SidebarGroup>
                <SidebarGroupLabel>History</SidebarGroupLabel>
                {historyItems.map(item => (
                <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton className="h-auto" size="lg" isActive={false}>
                        <Image src={item.image} alt={item.text} width={40} height={40} className="rounded-md" data-ai-hint="advertisement design" />
                        <span className="truncate text-sm font-normal whitespace-normal">{item.text}</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                ))}
            </SidebarGroup>
            </SidebarMenu>
        </ScrollArea>
      </SidebarContent>

      <SidebarFooter className="p-4 mt-auto">
        <SidebarSeparator />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
                <Avatar className="h-8 w-8">
                <AvatarImage src="https://placehold.co/40x40.png" alt="@user" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <span>Guest User</span>
              <ChevronDown className="ml-auto h-4 w-4"/>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </>
  );
}
