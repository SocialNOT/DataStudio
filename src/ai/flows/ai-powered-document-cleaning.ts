'use server';
/**
 * @fileOverview An AI agent for intelligently cleaning document text.
 *
 * - aiPoweredDocumentCleaning - A function that handles the document cleaning process.
 * - AiPoweredDocumentCleaningInput - The input type for the aiPoweredDocumentCleaning function.
 * - AiPoweredDocumentCleaningOutput - The return type for the aiPoweredDocumentCleaning function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiPoweredDocumentCleaningInputSchema = z.object({
  documentText: z.string().describe('The raw text content of the document to be cleaned.'),
});
export type AiPoweredDocumentCleaningInput = z.infer<typeof AiPoweredDocumentCleaningInputSchema>;

const AiPoweredDocumentCleaningOutputSchema = z.object({
  cleanedText: z.string().describe('The cleaned text content of the document, free from distractions.'),
});
export type AiPoweredDocumentCleaningOutput = z.infer<typeof AiPoweredDocumentCleaningOutputSchema>;

export async function aiPoweredDocumentCleaning(input: AiPoweredDocumentCleaningInput): Promise<AiPoweredDocumentCleaningOutput> {
  return aiPoweredDocumentCleaningFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiPoweredDocumentCleaningPrompt',
  input: {schema: AiPoweredDocumentCleaningInputSchema},
  output: {schema: AiPoweredDocumentCleaningOutputSchema},
  prompt: `You are an expert document cleaning assistant. Your task is to process raw document text and remove all distracting elements to create a pristine text foundation for further processing. You will output ONLY the cleaned text, formatted as a JSON object with a single 'cleanedText' field.

Specifically, you need to perform the following cleaning operations:
- Remove all page numbers.
- Remove all headers and footers.
- Remove any footnotes or endnotes, as well as references to them (e.g., [1], (2), etc.).
- Remove any formatting artifacts, such as multiple consecutive spaces, newline characters that are not part of paragraph breaks, or special symbols that are not part of the content.
- Ensure consistent paragraph formatting and readability.
- Do not summarize or alter the core content; only clean the noise.

Here is the raw document text:

---
{{{documentText}}}
---

Cleaned text (JSON):
`,
});

const aiPoweredDocumentCleaningFlow = ai.defineFlow(
  {
    name: 'aiPoweredDocumentCleaningFlow',
    inputSchema: AiPoweredDocumentCleaningInputSchema,
    outputSchema: AiPoweredDocumentCleaningOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
