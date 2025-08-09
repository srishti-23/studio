
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  ArrowUp,
  ImageIcon,
  LoaderCircle,
} from "lucide-react";

import { generateAd } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
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

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: initialPrompt,
      aspectRatio: "16:9",
      variations: 1,
    },
  });

  const onSubmit = async () => {
    setIsSubmitting(true);
  };

  return (
    <div className="sticky bottom-0 left-0 right-0 w-full p-4 bg-gradient-to-t from-background via-background/90 to-transparent">
      <div className="w-full max-w-3xl mx-auto">
        <Form {...form}>
          <form action={generateAd} onSubmit={onSubmit} className="relative">
            <div className="relative flex flex-col gap-2 rounded-2xl border border-border bg-card/80 backdrop-blur-lg p-2 shadow-2xl transition-all focus-within:ring-2 focus-within:ring-primary/50">
              <Textarea
                {...form.register("prompt")}
                placeholder="Describe what you want to create..."
                className="h-14 min-h-[auto] resize-none self-center border-0 bg-transparent text-base ring-offset-0 focus-visible:ring-0 p-2 focus:outline-none focus-visible:outline-none"
                rows={1}
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-accent hover:text-accent-foreground">
                                    <ImageIcon />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Add Image</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <FormField
                    control={form.control}
                    name="variations"
                    render={({ field }) => (
                        <FormItem>
                        <Select onValueChange={field.onChange} defaultValue={String(field.value)}>
                            <FormControl>
                            <SelectTrigger className="w-[120px] h-8 bg-transparent border-none text-muted-foreground hover:bg-accent hover:text-accent-foreground focus:ring-0 focus:ring-offset-0">
                                <SelectValue placeholder="Variations" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            {[...Array(4)].map((_, i) => (
                                <SelectItem key={i + 1} value={String(i + 1)}>
                                {i + 1} Variation{i > 0 ? 's' : ''}
                                </SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                        </FormItem>
                    )}
                    />
                    <FormField
                        control={form.control}
                        name="aspectRatio"
                        render={({ field }) => (
                            <FormItem>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger className="w-[110px] h-8 bg-transparent border-none text-muted-foreground hover:bg-accent hover:text-accent-foreground focus:ring-0 focus:ring-offset-0">
                                    <SelectValue placeholder="Aspect Ratio" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="16:9">16:9</SelectItem>
                                    <SelectItem value="1:1">1:1</SelectItem>
                                    <SelectItem value="9:16">9:16</SelectItem>
                                    <SelectItem value="4:3">4:3</SelectItem>
                                </SelectContent>
                            </Select>
                            </FormItem>
                        )}
                    />
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
          </form>
        </Form>
      </div>
    </div>
  );
}
