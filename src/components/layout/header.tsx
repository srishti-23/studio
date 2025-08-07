"use client";

import { Button } from "@/components/ui/button";
import { ChevronDown, Share2, MoreHorizontal, BrainCircuit, MessageSquareQuote, Undo2 } from "lucide-react";
import Link from "next/link";

export default function Header() {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between px-6">
      <div className="flex items-center gap-2">
        <Link href="/" className="flex items-center gap-3 font-headline text-lg font-bold text-white">
          <span>COSMIC BUBBLE</span>
          <ChevronDown className="h-5 w-5" />
        </Link>
      </div>

      <div className="flex items-center gap-2">
         <Button variant="ghost" className="text-white/80 hover:bg-white/10 hover:text-white">
            <Undo2 className="h-4 w-4 mr-2" />
            Show More
        </Button>
         <Button variant="ghost" className="text-white/80 hover:bg-white/10 hover:text-white">
            <BrainCircuit className="h-4 w-4 mr-2" />
            Brainstorm
        </Button>
         <Button variant="ghost" className="text-white/80 hover:bg-white/10 hover:text-white">
            <MessageSquareQuote className="h-4 w-4 mr-2" />
            Reply
        </Button>
         <Button variant="ghost" size="icon" className="text-white/80 hover:bg-white/10 hover:text-white">
            <MoreHorizontal className="h-4 w-4" />
        </Button>

        <div className="mx-4 h-6 w-px bg-white/20" />

        <Button className="bg-white text-black hover:bg-white/90 rounded-full">
            <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      </div>
    </header>
  );
}
