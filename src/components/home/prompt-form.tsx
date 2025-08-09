
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowUp, ImageIcon, LoaderCircle } from "lucide-react";

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
import { useEffect } from "react";

const formSchema = z.object({
  prompt: z.string().min(5, "Please enter a more descriptive prompt."),
  aspectRatio: z.string(),
  variations: z.coerce.number().min(1).max(8),
});

type FormValues = z.infer<typeof formSchema>;

interface PromptFormProps {
  onGenerate: (data: FormValues) => void;
  isSubmitting: boolean;
  selectedImage: string | null;
  initialPrompt?: string;
}

export default function PromptForm({
  onGenerate,
  isSubmitting,
  selectedImage,
  initialPrompt = "",
}: PromptFormProps) {

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: initialPrompt,
      aspectRatio: "1:1",
      variations: 4,
    },
  });

  const { setValue, watch } = form;
  const currentPrompt = watch("prompt");

  useEffect(() => {
    if (selectedImage && !isSubmitting) {
        // Prefill prompt for editing, but don't overwrite if user is already typing
        if(currentPrompt === initialPrompt || currentPrompt === "") {
            setValue("prompt", "A variation of the selected image, but...");
        }
    }
  }, [selectedImage, isSubmitting, setValue, currentPrompt, initialPrompt]);


  const onSubmit = (values: FormValues) => {
    onGenerate(values);
    if (!selectedImage) {
        form.reset({ ...values, prompt: "" });
    }
  };

  return (
    <div className="sticky bottom-0 left-0 right-0 w-full p-4 bg-gradient-to-t from-background via-background/90 to-transparent">
      <div className="w-full max-w-3xl mx-auto">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="relative">
            <div className="relative flex flex-col gap-2 rounded-2xl bg-card/80 backdrop-blur-lg p-2 shadow-2xl transition-all">
              <Textarea
                {...form.register("prompt")}
                placeholder={selectedImage ? "Describe your edits..." : "Describe what you want to create..."}
                className="h-14 min-h-[auto] resize-none self-center border-0 bg-transparent text-base p-2 focus-visible:ring-0 focus-visible:ring-offset-0"
              />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:bg-accent hover:text-accent-foreground 
                                     focus:outline-none focus:ring-0 focus:ring-offset-0"
                        >
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
                        <Select
                          onValueChange={(value) => field.onChange(parseInt(value))}
                          defaultValue={String(field.value)}
                          disabled={!!selectedImage}
                        >
                          <FormControl>
                            <SelectTrigger
                              className="w-[120px] h-8 bg-transparent border-none text-muted-foreground 
                                         hover:bg-accent hover:text-accent-foreground 
                                         focus:outline-none focus:ring-0 focus:ring-offset-0"
                            >
                              <SelectValue placeholder="Variations" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {[...Array(4)].map((_, i) => (
                              <SelectItem key={i + 1} value={String(i + 1)}>
                                {i + 1} Variation{i > 0 ? "s" : ""}
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
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger
                              className="w-[110px] h-8 bg-transparent border-none text-muted-foreground 
                                         hover:bg-accent hover:text-accent-foreground 
                                         focus:outline-none focus:ring-0 focus:ring-offset-0"
                            >
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
                    className="h-10 w-10 rounded-full bg-primary text-primary-foreground 
                               transition-all hover:bg-primary/90 hover:scale-110 
                               focus:outline-none focus:ring-0 focus:ring-offset-0"
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
