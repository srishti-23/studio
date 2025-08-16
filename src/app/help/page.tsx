
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AppSidebar from "@/components/layout/app-sidebar";
import Header from "@/components/layout/header";
import PromptForm from "@/components/home/prompt-form";
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
} from "@/components/ui/sidebar";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import AnimatedBackground from "@/components/layout/animated-background";

const faqItems = [
  {
    question: "How do I start a new chat?",
    answer:
      "You can start a new chat by clicking the '+ New Chat' button in the sidebar or the header. This will take you to a fresh page where you can enter your first prompt.",
  },
  {
    question: "How can I refine or edit a generated image?",
    answer:
      "Once an image is generated, you can click on it to select it. The prompt bar at the bottom will then switch to refinement mode. Type a new prompt describing the changes you want to make, and a new image will be generated based on your selection and new instructions.",
  },
  {
    question: "Where are my downloaded images saved?",
    answer:
      "When you click the download button, the image is saved to your computer's default download location. A copy is also automatically added to your personal 'Library', which you can access from the main navigation.",
  },
  {
    question: "Can I generate more than one image at a time?",
    answer:
      "Yes, when you are starting a new prompt (not refining), you can use the 'Variations' dropdown in the prompt bar to select how many different images you want the AI to generate from your prompt.",
  },
  {
    question: "How does the search in the sidebar work?",
    answer:
      "The search bar in the sidebar allows you to filter your chat history. Simply start typing, and the list of conversations will be filtered in real-time to show only those whose titles match your search query.",
  },
];

export default function HelpPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleGenerate = (data: { prompt: string; aspectRatio: string; variations: number }) => {
    setIsSubmitting(true);
    const params = new URLSearchParams({
      prompt: data.prompt,
      aspectRatio: data.aspectRatio,
      variations: data.variations.toString(),
    });
    router.push(`/?${params.toString()}`);
  };

  const handleNewChat = () => {
    router.push("/chat");
  };

  return (
    <SidebarProvider>
      <AnimatedBackground />
      <Sidebar side="left" variant="floating" collapsible="offcanvas" className="border-r border-sidebar-border">
        <AppSidebar onNewChat={handleNewChat} />
      </Sidebar>
      <SidebarInset className="relative flex flex-col min-h-screen">
        <Header onNewChat={handleNewChat} />
        <main className="flex-1 px-4 py-8 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center my-12">
              <h1 className="text-5xl md:text-7xl font-bold font-headline tracking-tighter">
                Help & FAQ
              </h1>
              <p className="mt-4 max-w-xl mx-auto text-muted-foreground text-lg">
                Find answers to common questions about using AdFleek.
              </p>
            </div>
            <Accordion type="single" collapsible className="w-full">
              {faqItems.map((item, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-lg text-left hover:no-underline">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-base text-muted-foreground">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </main>
        <PromptForm
          onGenerate={handleGenerate}
          isSubmitting={isSubmitting}
          selectedImage={null}
          onCancel={() => {}}
        />
      </SidebarInset>
    </SidebarProvider>
  );
}
