'use server';
/**
 * @fileOverview A Genkit flow for performing multilingual AI-powered OCR on scanned documents and manuscripts.
 *
 * - multilingualOcr - A function that handles the OCR process.
 * - MultilingualOcrInput - The input type for the multilingualOcr function.
 * - MultilingualOcrOutput - The return type for the multilingualOcr function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

const MultilingualOcrInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A scanned document or manuscript image, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  languageHint: z
    .string()
    .optional()
    .describe(
      'An optional hint for the primary language of the document (e.g., "Sanskrit", "Hindi", "English").'
    ),
});
export type MultilingualOcrInput = z.infer<typeof MultilingualOcrInputSchema>;

const MultilingualOcrOutputSchema = z.object({
  extractedText: z.string().describe('The accurately extracted text from the image.'),
  detectedLanguage: z
    .string()
    .describe('The primary language detected in the extracted text (e.g., "Sanskrit", "Hindi", "English").'),
  confidence: z
    .number()
    .describe('A confidence score (0-1) indicating the accuracy of the OCR process.'),
});
export type MultilingualOcrOutput = z.infer<typeof MultilingualOcrOutputSchema>;

export async function multilingualOcr(input: MultilingualOcrInput): Promise<MultilingualOcrOutput> {
  return multilingualOcrFlow(input);
}

const multilingualOcrPrompt = ai.definePrompt({
  name: 'multilingualOcrPrompt',
  input: { schema: MultilingualOcrInputSchema },
  output: { schema: MultilingualOcrOutputSchema },
  prompt: `You are an advanced OCR engine specializing in historical documents and manuscripts, including specialized languages like Sanskrit and Hindi.
Your task is to accurately extract all textual content from the provided image.
After extraction, identify the primary language of the text and provide a confidence score for your OCR operation.

{{#if languageHint}}Consider the following language hint: {{{languageHint}}}.{{/if}}

Image:
{{media url=photoDataUri}}

Provide the extracted text, detected language, and a confidence score as a JSON object.`,
});

const multilingualOcrFlow = ai.defineFlow(
  {
    name: 'multilingualOcrFlow',
    inputSchema: MultilingualOcrInputSchema,
    outputSchema: MultilingualOcrOutputSchema,
  },
  async (input) => {
    const { output } = await ai.generate({
      model: googleAI.model('gemini-2.5-flash-image'),
      prompt: multilingualOcrPrompt(input),
      config: {
        responseModalities: ['TEXT'],
      },
    });
    if (!output) {
      throw new Error('Failed to extract text via OCR.');
    }
    return output;
  }
);
