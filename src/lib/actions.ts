
"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

const formSchema = z.object({
  prompt: z.string().min(1, "Prompt is required."),
  aspectRatio: z.string(),
  variations: z.coerce.number().min(1).max(8),
});

export async function generateAd(formData: FormData) {
  const data = Object.fromEntries(formData.entries());
  const parsed = formSchema.safeParse(data);

  if (!parsed.success) {
    // In a real app, you'd want to return this error to the form.
    // For this example, we'll log it and redirect with what we have.
    console.error("Form validation failed:", parsed.error.flatten().fieldErrors);
    const prompt = (data.prompt as string) || "A beautiful ad";
    const params = new URLSearchParams({ prompt });
    redirect(`/workspace?${params.toString()}`);
    return;
  }

  const { prompt, aspectRatio, variations } = parsed.data;

  const params = new URLSearchParams({
    prompt,
    aspectRatio,
    variations: variations.toString(),
  });

  redirect(`/workspace?${params.toString()}`);
}
