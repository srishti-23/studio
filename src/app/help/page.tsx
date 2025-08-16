
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import AppSidebar from "@/components/layout/app-sidebar";
import Header from "@/components/layout/header";
import PromptForm from "@/components/home/prompt-form";
import { SidebarProvider, Sidebar, SidebarInset } from "@/components/ui/sidebar";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import AnimatedBackground from "@/components/layout/animated-background";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { sendHelpQuery } from "@/lib/actions/help";
import { LoaderCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

const faqItems = [
  {
    question: "How do I start a new chat?",
    answer: "You can start a new chat by clicking the '+ New Chat' button in the sidebar or the header. This will take you to a fresh page where you can enter your first prompt.",
  },
  {
    question: "How can I refine or edit a generated image?",
    answer: "Once an image is generated, you can click on it to select it. The prompt bar at the bottom will then switch to refinement mode. Type a new prompt describing the changes you want to make, and a new image will be generated based on your selection and new instructions.",
  },
  {
    question: "Where are my downloaded images saved?",
    answer: "When you click the download button, the image is saved to your computer's default download location. A copy is also automatically added to your personal 'Library', which you can access from the main navigation.",
  },
  {
    question: "Can I generate more than one image at a time?",
    answer: "Yes, when you are starting a new prompt (not refining), you can use the 'Variations' dropdown in the prompt bar to select how many different images you want the AI to generate from your prompt.",
  },
  {
    question: "How does the search in the sidebar work?",
    answer: "The search bar in the sidebar allows you to filter your chat history. Simply start typing, and the list of conversations will be filtered in real-time to show only those whose titles match your search query.",
  },
];

const helpFormSchema = z.object({
    name: z.string().min(2, "Name is required."),
    email: z.string().email("Please enter a valid email address."),
    message: z.string().min(10, "Please enter a message of at least 10 characters."),
});

const ContactForm = () => {
    const { toast } = useToast();
    const { user } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<z.infer<typeof helpFormSchema>>({
        resolver: zodResolver(helpFormSchema),
        defaultValues: {
            name: user?.name || "",
            email: user?.email || "",
            message: "",
        },
    });
    
    async function onSubmit(values: z.infer<typeof helpFormSchema>) {
        setIsSubmitting(true);
        const result = await sendHelpQuery(values);
        if (result.success) {
            toast({
                title: "Message Sent!",
                description: "We've received your query and will get back to you shortly.",
            });
            form.reset();
        } else {
            toast({
                variant: "destructive",
                title: "Submission Failed",
                description: result.message,
            });
        }
        setIsSubmitting(false);
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Contact Us</CardTitle>
                <CardDescription>Have a question that's not in the FAQ? Fill out the form below.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Your Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="John Doe" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Your Email</FormLabel>
                                        <FormControl>
                                            <Input placeholder="name@example.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="message"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Your Message</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="How can we help you?" className="resize-y min-h-[120px]" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? <LoaderCircle className="animate-spin" /> : "Send Message"}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}

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

            <div className="mt-24 mb-12">
                <ContactForm />
            </div>
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
