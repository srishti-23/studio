
"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Rocket, Plus, Book, LogIn, Menu, User, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useSidebar } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Header() {
  const { toggleSidebar } = useSidebar();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // This is a mock login function.
  // In a real app, this would be handled by your auth provider.
  const handleLogin = () => setIsLoggedIn(true);
  const handleLogout = () => setIsLoggedIn(false);

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
        <Link href="/" className="flex items-center gap-2 font-headline text-lg font-bold text-white">
            <Rocket className="h-6 w-6" />
            <span>AdFleek.io</span>
        </Link>
      </div>

      <div className="flex items-center gap-2">
         <Button variant="ghost" className="hidden md:inline-flex">
            <Plus className="h-4 w-4 mr-2" />
            New Chat
        </Button>
         <Button variant="ghost" className="hidden md:inline-flex">
            <Book className="h-4 w-4 mr-2" />
            Library
        </Button>
        
        {isLoggedIn ? (
          <>
            <Button variant="ghost" onClick={handleLogout} className="hidden md:inline-flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src="https://placehold.co/40x40.png" alt="@user" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <span>Guest User</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="md:hidden" onClick={handleLogout}>
              <User className="h-5 w-5" />
              <span className="sr-only">Profile</span>
            </Button>
          </>
        ) : (
          <>
            <Button onClick={handleLogin} className="rounded-full">
                <LogIn className="h-4 w-4 mr-2" />
                Login / Sign Up
            </Button>
          </>
        )}
      </div>
    </header>
  );
}
