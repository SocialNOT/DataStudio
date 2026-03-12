'use server';
/**
 * @fileOverview A Genkit flow for generating high-quality QA pairs from text chunks for LLM instruction tuning.
 *
 * - generateQaPairs - A function that converts text chunks into question-answer instructions.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const QaPairSchema = z.object({
  instruction: z.string().describe('The question or instruction based on the text.'),
  output: z.string().describe('The detailed, accurate answer or response.'),
});

const QaPairGenerationInputSchema = z.object({
  text: z.string().describe('The source text chunk to derive questions from.'),
  count: z.number().default(3).describe('Number of QA pairs to generate per chunk.'),
});
export type QaPairGenerationInput = z.infer<typeof QaPairGenerationInputSchema>;

const QaPairGenerationOutputSchema = z.object({
  pairs: z.array(QaPairSchema),
});
export type QaPairGenerationOutput = z.infer<typeof QaPairGenerationOutputSchema>;

const prompt = ai.definePrompt({
  name: 'qaPairGenerationPrompt',
  input: { schema: QaPairGenerationInputSchema },
  output: { schema: QaPairGenerationOutputSchema },
  prompt: `You are an expert dataset engineer for LLM fine-tuning. 
Your goal is to extract exactly {{{count}}} high-quality instruction-response pairs from the provided text.

The instructions should be varied: 
- Some should ask for factual information.
- Some should ask for explanations of concepts.
- Some should be creative (e.g., "Summarize the significance of...").

The responses must be grounded strictly in the provided text.

Source Text:
---
{{{text}}}
---

Provide the output as a JSON object with a 'pairs' array.`,
});

export async function generateQaPairs(input: QaPairGenerationInput): Promise<QaPairGenerationOutput> {
  const { output } = await prompt(input);
  if (!output) throw new Error('Failed to generate QA pairs.');
  return output;
}
