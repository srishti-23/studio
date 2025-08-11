
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
  MessageSquare,
} from "lucide-react";
import { Input } from "../ui/input";
import { ScrollArea } from "../ui/scroll-area";
import Image from "next/image";
import Link from "next/link";
import { Rocket } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "../ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getHistory } from "@/lib/actions/history";
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from "../ui/skeleton";

interface HistoryItem {
  _id: string;
  prompt: string;
  imageUrls: string[];
  createdAt: string;
}

interface AppSidebarProps {
  onNewChat: () => void;
}

export default function AppSidebar({ onNewChat }: AppSidebarProps) {
    const { toggleSidebar } = useSidebar();
    const { user, logout } = useAuth();
    const router = useRouter();
    const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);

    useEffect(() => {
        if (user) {
            setIsLoadingHistory(true);
            getHistory()
                .then(result => {
                    if (result.success) {
                        setHistoryItems(result.history as HistoryItem[]);
                    }
                })
                .finally(() => {
                    setIsLoadingHistory(false);
                });
        }
    }, [user]);
    
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
                {isLoadingHistory ? (
                    <div className="space-y-4 px-2 mt-2">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                ) : historyItems.length > 0 ? (
                    historyItems.map(item => (
                    <SidebarMenuItem key={item._id}>
                        <SidebarMenuButton className="h-auto py-2 px-2 justify-start gap-3" size="lg" isActive={false}>
                            {item.imageUrls?.[0] ? (
                                <Image src={item.imageUrls[0]} alt={item.prompt} width={40} height={40} className="rounded-md bg-muted" data-ai-hint="advertisement design" />
                            ) : (
                                <div className="w-10 h-10 bg-muted rounded-md flex items-center justify-center">
                                    <MessageSquare className="w-5 h-5 text-muted-foreground"/>
                                </div>
                            )}
                            <div className="flex flex-col items-start overflow-hidden">
                                <span className="truncate text-sm font-medium w-full">{item.prompt}</span>
                                <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}</span>
                            </div>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    ))
                ) : (
                    <p className="p-2 text-sm text-muted-foreground">No history yet.</p>
                )}
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
