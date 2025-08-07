
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  ArrowUp,
  ImageIcon,
  Plus,
  Sparkles,
  LoaderCircle,
  Settings2,
  ChevronDown,
} from "lucide-react";

import { generateAd } from "@/lib/actions";
import { refinePrompt } from "@/ai/flows/refine-prompt";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const formSchema = z.object({
  prompt: z.string().min(5, "Please enter a more descriptive prompt."),
  aspectRatio: z.string(),
  variations: z.coerce.number().min(1).max(8),
});

type FormValues = z.infer<typeof formSchema>;

interface PromptFormProps {
  imageUrls: string[];
  initialPrompt?: string;
}

export default function PromptForm({
  imageUrls,
  initialPrompt = "",
}: PromptFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: initialPrompt,
      aspectRatio: "16:9",
      variations: 1,
    },
  });

  const handleRefinePrompt = async () => {
    const userPrompt = form.getValues("prompt");
    if (!userPrompt) {
      toast({
        title: "Cannot Refine",
        description: "Please enter a prompt before refining.",
        variant: "destructive",
      });
      return;
    }

    setIsRefining(true);
    try {
      const result = await refinePrompt({
        userPrompt,
        previousImageUrls: imageUrls.slice(0, 3),
      });
      form.setValue("prompt", result.refinedPrompt, { shouldValidate: true });
      toast({
        title: "Prompt Refined!",
        description: "Your prompt has been enhanced by AI.",
      });
    } catch (error) {
      console.error("Error refining prompt:", error);
      toast({
        title: "Refinement Failed",
        description: "Could not refine the prompt. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRefining(false);
    }
  };

  const onSubmit = async () => {
    setIsSubmitting(true);
  };

  return (
    <div className="sticky bottom-0 left-0 right-0 w-full p-4 bg-transparent">
      <div className="w-full max-w-3xl mx-auto">
        <Form {...form}>
          <form action={generateAd} onSubmit={onSubmit} className="relative">
            <div className="relative flex flex-col gap-4 rounded-xl border border-white/10 bg-black/50 backdrop-blur-xl p-2 shadow-2xl">
              <Textarea
                {...form.register("prompt")}
                placeholder="What do you want to see..."
                className="h-14 min-h-[auto] resize-none self-center border-0 bg-transparent text-base ring-offset-0 focus-visible:ring-0 p-2"
                rows={1}
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-white/50 hover:bg-white/10 hover:text-white">
                                    <ImageIcon />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Add Image</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
                <div className="flex items-center gap-2">
                   <Button
                    type="submit"
                    size="icon"
                    className="h-10 w-10 rounded-full bg-primary text-primary-foreground transition-all hover:bg-primary/90 hover:scale-110"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <LoaderCircle className="h-5 w-5 animate-spin" />
                    ) : (
                      <ArrowUp className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
            
            <FormField
              control={form.control}
              name="aspectRatio"
              render={({ field }) => (
                <FormItem className="hidden">
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="variations"
              render={({ field }) => (
                <FormItem className="hidden">
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </form>
        </Form>
      </div>
    </div>
  );
}
