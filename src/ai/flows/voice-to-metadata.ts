'use server';
/**
 * @fileOverview An AI flow that processes voice annotations to enrich document metadata.
 *
 * - voiceToMetadata - A function that processes audio transcripts into structured metadata.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const VoiceToMetadataInputSchema = z.object({
  transcript: z.string().describe('The transcribed text from the user\'s voice annotation.'),
  currentMetadata: z.any().optional().describe('Existing metadata to be enriched.'),
});
export type VoiceToMetadataInput = z.infer<typeof VoiceToMetadataInputSchema>;

const VoiceToMetadataOutputSchema = z.object({
  enrichedTopic: z.string().describe('A refined topic based on the voice input.'),
  additionalConcepts: z.array(z.string()).describe('New key concepts extracted from the voice input.'),
  summary: z.string().describe('A brief summary of the user\'s annotation.'),
});
export type VoiceToMetadataOutput = z.infer<typeof VoiceToMetadataOutputSchema>;

const prompt = ai.definePrompt({
  name: 'voiceToMetadataPrompt',
  input: { schema: VoiceToMetadataInputSchema },
  output: { schema: VoiceToMetadataOutputSchema },
  prompt: `You are a metadata enrichment assistant. You will take a voice transcript provided by a user who is reviewing a document chunk.
Your task is to extract meaningful metadata from the transcript to improve the indexing of this chunk.

User Transcript: "{{{transcript}}}"
Current Metadata: {{{json currentMetadata}}}

Based on this, provide a refined topic, additional key concepts, and a summary.`,
});

export async function voiceToMetadata(input: VoiceToMetadataInput): Promise<VoiceToMetadataOutput> {
  const { output } = await prompt(input);
  if (!output) throw new Error('Failed to enrich metadata from voice.');
  return output;
}
