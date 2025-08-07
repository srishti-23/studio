"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Rocket } from "lucide-react";
import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-lg px-4 md:px-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger />
        <Link href="/" className="flex items-center gap-2 font-headline text-lg font-bold">
          <Rocket className="h-6 w-6" />
          <span className="text-primary">AdFleek.io</span>
        </Link>
      </div>

      <div className="flex flex-1 items-center justify-end gap-4">
        <Button variant="ghost" asChild>
          <Link href="#">New Chat</Link>
        </Button>
        <Button variant="ghost" asChild>
          <Link href="#">Library</Link>
        </Button>
        <Button>Login with Google</Button>
      </div>
    </header>
  );
}
