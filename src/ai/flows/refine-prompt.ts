'use server';

/**
 * @fileOverview Refines user prompts based on previous images to improve ad generation.
 *
 * - refinePrompt - A function that refines the user prompt.
 * - RefinePromptInput - The input type for the refinePrompt function.
 * - RefinePromptOutput - The return type for the refinePrompt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RefinePromptInputSchema = z.object({
  previousImageUrls: z.array(z.string()).describe('URLs of previously generated images as data URIs.'),
  userPrompt: z.string().describe('The original user prompt.'),
});
export type RefinePromptInput = z.infer<typeof RefinePromptInputSchema>;

const RefinePromptOutputSchema = z.object({
  refinedPrompt: z.string().describe('The refined prompt based on previous images.'),
});
export type RefinePromptOutput = z.infer<typeof RefinePromptOutputSchema>;

export async function refinePrompt(input: RefinePromptInput): Promise<RefinePromptOutput> {
  return refinePromptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'refinePromptPrompt',
  input: {schema: RefinePromptInputSchema},
  output: {schema: RefinePromptOutputSchema},
  prompt: `You are an AI prompt refinement expert. Given the user's original prompt and the URLs of previously generated images, suggest a refined prompt that will help the user achieve their desired results.

Original Prompt: {{{userPrompt}}}
Previous Image URLs: {{#each previousImageUrls}}{{{this}}} {{/each}}

Refined Prompt:`, // Ensure Handlebars syntax is correctly used here
});

const refinePromptFlow = ai.defineFlow(
  {
    name: 'refinePromptFlow',
    inputSchema: RefinePromptInputSchema,
    outputSchema: RefinePromptOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
