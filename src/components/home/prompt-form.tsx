
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowUp, Images, Square, X } from "lucide-react";

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
import { useEffect, useRef, useState } from "react";
import Image from "next/image";

const formSchema = z.object({
  prompt: z.string().min(5, "Please enter a more descriptive prompt."),
  aspectRatio: z.string(),
  variations: z.coerce.number().min(1).max(8),
  uploadedImages: z.array(z.string()).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface PromptFormProps {
  onGenerate: (data: FormValues) => void;
  isSubmitting: boolean;
  selectedImage: string | null;
  initialPrompt?: string;
  onCancel: () => void;
}

export default function PromptForm({
  onGenerate,
  isSubmitting,
  selectedImage,
  initialPrompt,
  onCancel,
}: PromptFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: initialPrompt || "",
      aspectRatio: "1:1",
      variations: 4,
      uploadedImages: [],
    },
  });

  useEffect(() => {
    form.setValue("prompt", initialPrompt || "");
  }, [initialPrompt, form]);


  const handleImageUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
        const fileArray = Array.from(files);
        const newPreviews: string[] = [];
        let loadedFiles = 0;

        if (fileArray.length === 0) return;

        fileArray.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const dataUri = reader.result as string;
                newPreviews.push(dataUri);
                loadedFiles++;
                if(loadedFiles === fileArray.length) {
                    const allPreviews = [...imagePreviews, ...newPreviews];
                    setImagePreviews(allPreviews);
                    form.setValue("uploadedImages", allPreviews);
                }
            };
            reader.readAsDataURL(file);
        });
    }
  };

  const clearImage = (indexToRemove: number) => {
    const newPreviews = imagePreviews.filter((_, index) => index !== indexToRemove);
    setImagePreviews(newPreviews);
    form.setValue("uploadedImages", newPreviews);
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };
  
  const clearAllImages = () => {
    setImagePreviews([]);
    form.setValue("uploadedImages", []);
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  }

  const onSubmit = (values: FormValues) => {
    onGenerate(values);
    if (!selectedImage) {
        form.reset({ ...values, prompt: "" });
        clearAllImages();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      form.handleSubmit(onSubmit)();
    }
  };
  
  const handleCancelClick = () => {
    onCancel();
    form.reset({ ...form.getValues(), prompt: ""});
    clearAllImages();
  }

  return (
    <div className="sticky bottom-0 left-0 right-0 w-full p-4 bg-gradient-to-t from-background via-background/90 to-transparent">
      <div className="w-full max-w-3xl mx-auto">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="relative">
            <div className="relative flex flex-col gap-2 rounded-2xl bg-card/80 backdrop-blur-lg p-2 shadow-2xl transition-all">
                {imagePreviews.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-2">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group w-28 h-28">
                          <Image src={preview} alt={`Image preview ${index + 1}`} layout="fill" className="rounded-xl object-cover" />
                          <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute top-0 right-0 h-6 w-6 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100"
                              onClick={() => clearImage(index)}
                          >
                              <X className="h-4 w-4" />
                          </Button>
                      </div>
                    ))}
                  </div>
                )}
              <Textarea
                {...form.register("prompt")}
                placeholder={selectedImage ? "Describe your edits..." : "Describe what you want to create..."}
                className="h-14 min-h-[auto] resize-none self-center border-0 bg-transparent text-base p-2 focus-visible:ring-0 focus-visible:ring-offset-0"
                onKeyDown={handleKeyDown}
                disabled={isSubmitting}
              />
              <input 
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
                multiple
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
                          onClick={handleImageUploadClick}
                          disabled={isSubmitting}
                        >
                          <Images />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Add Image(s)</p>
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
                          disabled={!!selectedImage || imagePreviews.length > 0 || isSubmitting}
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
                           disabled={isSubmitting}
                        >
                          <FormControl>
                            <SelectTrigger
                              className="w-[110px] h-10 bg-transparent border-none text-muted-foreground 
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
                    {isSubmitting ? (
                      <Button
                        type="button"
                        size="icon"
                        className="h-10 w-10 rounded-full bg-secondary text-secondary-foreground 
                                   transition-all hover:bg-secondary/90 hover:scale-110 
                                   focus:outline-none focus:ring-0 focus:ring-offset-0"
                        onClick={handleCancelClick}
                      >
                         <Square className="h-5 w-5 fill-current" />
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        size="icon"
                        className="h-10 w-10 rounded-full bg-primary text-primary-foreground 
                                   transition-all hover:bg-primary/90 hover:scale-110 
                                   focus:outline-none focus:ring-0 focus:ring-offset-0"
                        disabled={isSubmitting}
                      >
                        <ArrowUp className="h-5 w-5" />
                      </Button>
                    )}
                </div>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
