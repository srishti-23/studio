
"use client";

import { Button } from "@/components/ui/button";
import { Rocket, Plus, Book, LogIn, Menu, User, ChevronDown, LogOut } from "lucide-react";
import Link from "next/link";
import { useSidebar } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "../ui/dropdown-menu";
import { useRouter } from "next/navigation";

interface HeaderProps {
  onNewChat: () => void;
}

export default function Header({ onNewChat }: HeaderProps) {
  const { toggleSidebar } = useSidebar();
  const { user, logout } = useAuth();
  const router = useRouter();
  
  const handleNewChatClick = () => {
    onNewChat();
    router.push('/');
  }

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b border-border bg-background/80 backdrop-blur-lg px-4 md:px-6">
      <div className="flex items-center gap-2">
        <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
        >
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle Sidebar</span>
        </Button>
        <Link href="/" className="flex items-center gap-2 font-headline text-lg font-bold text-primary">
            <Rocket className="h-6 w-6" />
            <span>AdFleek.io</span>
        </Link>
      </div>

      <div className="flex items-center gap-2">
         <Button variant="ghost" className="hidden md:inline-flex" onClick={handleNewChatClick}>
            <Plus className="h-4 w-4 mr-2" />
            New Chat
        </Button>
         <Button asChild variant="ghost" className="hidden md:inline-flex">
            <Link href="/library">
                <Book className="h-4 w-4 mr-2" />
                Library
            </Link>
        </Button>
        
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarImage src="https://placehold.co/40x40.png" alt={user.name ?? "User"} />
                  <AvatarFallback>{user.name?.[0].toUpperCase()}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuItem className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
            <Button asChild className="rounded-full">
                <Link href="/login">
                    <LogIn className="h-4 w-4 mr-2" />
                    Login / Sign Up
                </Link>
            </Button>
        )}
      </div>
    </header>
  );
}
