"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  ArrowRight,
  Image as ImageIcon,
  SlidersHorizontal,
  Sparkles,
  LoaderCircle,
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

export default function PromptForm({ imageUrls, initialPrompt = "" }: PromptFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: initialPrompt,
      aspectRatio: "1:1",
      variations: 4,
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
        previousImageUrls: imageUrls.slice(0, 3), // Use first 3 images for context
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
    <div className="fixed bottom-0 left-0 right-0 z-20 flex justify-center p-4">
      <div className="w-full max-w-2xl">
        <Form {...form}>
          <form
            action={generateAd}
            onSubmit={onSubmit}
            className="relative"
          >
            <div className="relative flex items-center rounded-xl border border-white/10 bg-black/30 shadow-2xl shadow-black/40 backdrop-blur-xl">
              <Textarea
                {...form.register("prompt")}
                placeholder="Describe the ad you want to generate..."
                className="h-14 min-h-14 resize-none self-center border-0 bg-transparent pl-12 pr-36 text-base ring-offset-0 focus-visible:ring-0"
                rows={1}
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <ImageIcon className="h-5 w-5 text-white/50" />
              </div>
              <div className="absolute right-4 top-1/2 flex -translate-y-1/2 items-center gap-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-full text-white/70 hover:bg-white/10 hover:text-white"
                        onClick={handleRefinePrompt}
                        disabled={isRefining}
                      >
                        {isRefining ? (
                          <LoaderCircle className="h-5 w-5 animate-spin" />
                        ) : (
                          <Sparkles className="h-5 w-5" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Refine with AI</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <Button
                  type="submit"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full bg-primary text-primary-foreground transition-all hover:bg-primary/90 hover:scale-110"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <LoaderCircle className="h-5 w-5 animate-spin" />
                  ) : (
                    <ArrowRight className="h-5 w-5" />
                  )}
                </Button>
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
