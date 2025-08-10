
"use client";

import {
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  useSidebar
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  HelpCircle,
  Plus,
  Search,
  ChevronDown,
  X,
  LogOut,
} from "lucide-react";
import { Input } from "../ui/input";
import { ScrollArea } from "../ui/scroll-area";
import Image from "next/image";
import Link from "next/link";
import { Rocket } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "../ui/dropdown-menu";
import { useRouter } from "next/navigation";

interface AppSidebarProps {
  onNewChat: () => void;
}

export default function AppSidebar({ onNewChat }: AppSidebarProps) {
    const { toggleSidebar } = useSidebar();
    const { user, logout } = useAuth();
    const router = useRouter();

    const historyItems = [
        { id: 1, text: "Futuristic city", image: "https://placehold.co/40x40.png?text=FC", timestamp: "2 hours ago" },
        { id: 2, text: "Abstract art", image: "https://placehold.co/40x40.png?text=AA", timestamp: "1 day ago" },
    ];
    
    const handleNewChatClick = () => {
      onNewChat();
      router.push('/');
    }

  return (
    <>
      <SidebarHeader className="p-4 border-b border-sidebar-border">
         <div className="flex items-center justify-between">
             <Link href="/" className="flex items-center gap-2 font-headline text-lg font-bold">
              <Rocket className="h-6 w-6 text-primary" />
              <span className="text-primary">AdFleek.io</span>
            </Link>
            <Button variant="ghost" size="icon" onClick={toggleSidebar}>
                <X className="h-5 w-5" />
            </Button>
         </div>
         <Button variant="secondary" className="w-full justify-start mt-4 bg-sidebar-accent" onClick={handleNewChatClick}>
            <Plus className="mr-2 h-4 w-4" />
            New Chat
        </Button>
        <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search history..." className="pl-9 bg-sidebar-accent border-sidebar-border" />
        </div>
      </SidebarHeader>

      <SidebarContent className="flex-1 overflow-auto p-0">
        <ScrollArea className="h-full">
            <SidebarMenu className="gap-0 p-4 pt-4">
            <SidebarGroup>
                <SidebarGroupLabel className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Recent History</SidebarGroupLabel>
                {historyItems.map(item => (
                <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton className="h-auto py-2 px-2 justify-start gap-3" size="lg" isActive={false}>
                        <Image src={item.image} alt={item.text} width={40} height={40} className="rounded-md" data-ai-hint="advertisement design" />
                        <div className="flex flex-col items-start">
                            <span className="truncate text-sm font-medium">{item.text}</span>
                            <span className="text-xs text-muted-foreground">{item.timestamp}</span>
                        </div>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                ))}
            </SidebarGroup>
            </SidebarMenu>
        </ScrollArea>
      </SidebarContent>

      <SidebarFooter className="p-4 mt-auto border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
             <SidebarMenuButton>
                <HelpCircle className="h-4 w-4" />
                <span>Help</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            {user ? (
               <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton>
                        <Avatar className="h-8 w-8">
                            <AvatarImage src="https://placehold.co/40x40.png" alt="@user" />
                            <AvatarFallback>{user.name?.[0].toUpperCase() ?? 'U'}</AvatarFallback>
                        </Avatar>
                        <span>{user.name}</span>
                        <ChevronDown className="ml-auto h-4 w-4"/>
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent side="top" align="start" className="w-56">
                    <DropdownMenuItem onClick={logout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
            ) : (
                <SidebarMenuButton asChild>
                    <Link href="/login">
                        <Avatar className="h-8 w-8">
                            <AvatarFallback>U</AvatarFallback>
                        </Avatar>
                        <span>Guest User</span>
                    </Link>
                </SidebarMenuButton>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </>
  );
}
