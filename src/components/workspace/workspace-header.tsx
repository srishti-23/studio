"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Rocket, LogIn, Menu, ChevronDown, User } from "lucide-react";
import Link from "next/link";
import { useSidebar } from "@/components/ui/sidebar";
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';

export default function WorkspaceHeader() {
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
            className="md:hidden"
        >
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle Sidebar</span>
        </Button>
        <Link href="/" className="flex items-center gap-2 font-headline text-lg font-bold text-primary">
            <Rocket className="h-6 w-6" />
            <span>AdFleek.io</span>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        {isLoggedIn ? (
          <Button variant="ghost" onClick={handleLogout} className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src="https://placehold.co/40x40.png" alt="@user" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <span className="hidden md:inline">Guest User</span>
            <ChevronDown className="h-4 w-4 hidden md:inline" />
          </Button>
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
