
"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

const formSchema = z.object({
  prompt: z.string().min(1, "Prompt is required."),
  aspectRatio: z.string(),
  variations: z.coerce.number().min(1).max(8),
});

// This function is no longer used for form submission from the main page,
// but we'll keep it in case it's needed for other parts of the app.
export async function generateAd(formData: FormData) {
  const data = Object.fromEntries(formData.entries());
  const parsed = formSchema.safeParse(data);

  if (!parsed.success) {
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
