
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
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getConversations } from "@/lib/actions/history";
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from "../ui/skeleton";

interface Conversation {
  _id: string;
  title: string;
  createdAt: string;
  firstImageUrl: string | null;
}

interface AppSidebarProps {
  onNewChat: () => void;
}

export default function AppSidebar({ onNewChat }: AppSidebarProps) {
    const { toggleSidebar } = useSidebar();
    const { user, logout, isLoading: isAuthLoading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const activeConversationId = searchParams.get('conversationId');

    useEffect(() => {
        if (user) {
            setIsLoadingHistory(true);
            getConversations()
                .then(result => {
                    if (result.success) {
                        setConversations(result.conversations as Conversation[]);
                    }
                })
                .finally(() => {
                    setIsLoadingHistory(false);
                });
        } else {
            setConversations([]);
        }
    }, [user, activeConversationId]);
    
    const handleNewChatClick = () => {
      onNewChat();
      router.push('/chat');
      if (window.innerWidth < 768) { // Assuming md breakpoint
        toggleSidebar();
    }
    }

  const handleConversationClick = (conversationId: string) => {
    router.push(`/?conversationId=${conversationId}`);
    if (window.innerWidth < 768) { // Assuming md breakpoint
        toggleSidebar();
    }
  };

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
         <Button variant="secondary" className="w-full justify-start mt-4 bg-sidebar-accent" onClick={handleNewChatClick} disabled={isAuthLoading || !user}>
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
                {isAuthLoading || (isLoadingHistory && user) ? (
                    <div className="space-y-2 px-2 mt-2">
                        <Skeleton className="h-12 w-full rounded-lg" />
                        <Skeleton className="h-12 w-full rounded-lg" />
                        <Skeleton className="h-12 w-full rounded-lg" />
                    </div>
                ) : user && conversations.length > 0 ? (
                    conversations.map(convo => (
                    <SidebarMenuItem key={convo._id} onClick={() => handleConversationClick(convo._id)}>
                        <SidebarMenuButton className="h-auto py-2 px-2 justify-start gap-3" size="lg" isActive={activeConversationId === convo._id}>
                            {convo.firstImageUrl ? (
                                <Image src={convo.firstImageUrl} alt={convo.title} width={40} height={40} className="rounded-md bg-muted object-cover" data-ai-hint="advertisement design" />
                            ) : (
                                <div className="w-10 h-10 bg-muted rounded-md flex items-center justify-center">
                                    <MessageSquare className="w-5 h-5 text-muted-foreground"/>
                                </div>
                            )}
                            <div className="flex flex-col items-start overflow-hidden text-left">
                                <span className="truncate text-sm font-medium w-full">{convo.title}</span>
                                <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(convo.createdAt), { addSuffix: true })}</span>
                            </div>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    ))
                ) : user ? (
                    <p className="p-2 text-sm text-muted-foreground">No history yet. Start a new chat!</p>
                ) : (
                     <p className="p-2 text-sm text-muted-foreground">Log in to see your history.</p>
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
                            <AvatarImage src={undefined} alt={user.name || "User"} />
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
                            <AvatarFallback>G</AvatarFallback>
                        </Avatar>
                        <span>Guest</span>
                    </Link>
                </SidebarMenuButton>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </>
  );
}
