'use server';
/**
 * @fileOverview This file implements a Genkit flow for intelligent text chunking and metadata generation.
 * It takes a cleaned document and generates semantically coherent chunks along with structured metadata for each chunk.
 *
 * - automatedChunkingAndMetadataGeneration - A function that orchestrates the chunking and metadata generation process.
 * - AutomatedChunkingAndMetadataGenerationInput - The input type for the automatedChunkingAndMetadataGeneration function.
 * - AutomatedChunkingAndMetadataGenerationOutput - The return type for the automatedChunkingAndMetadataGeneration function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SourceDetailsSchema = z.object({
  textName: z.string().describe('The name of the source document (e.g., "Chandogya Upanishad").'),
  language: z.string().describe('The language of the document (e.g., "Sanskrit", "English").'),
  domain: z.string().describe('The domain or subject matter of the document (e.g., "Vedanta").'),
  author: z.string().optional().describe('The author of the document, if known.'),
  period: z.string().optional().describe('The historical period or date of the document.'),
  concepts: z.array(z.string()).optional().describe('Key overarching concepts related to the entire document.'),
});
export type SourceDetails = z.infer<typeof SourceDetailsSchema>;

const AutomatedChunkingAndMetadataGenerationInputSchema = z.object({
  documentContent: z.string().describe('The cleaned content of the document to be chunked and analyzed.'),
  chunkSize: z.number().int().positive().describe('The target size of each text chunk in tokens. The LLM should aim for this size but prioritize semantic coherence.'),
  chunkOverlap: z.number().int().min(0).describe('The desired overlap between consecutive text chunks in tokens. The LLM should aim for this but prioritize semantic coherence.'),
  sourceDetails: SourceDetailsSchema.describe('Structured details about the original source document, to be included in each chunk\u0027s metadata.'),
});
export type AutomatedChunkingAndMetadataGenerationInput = z.infer<typeof AutomatedChunkingAndMetadataGenerationInputSchema>;

const ChunkMetadataSchema = z.object({
  topic: z.string().describe('A concise topic or main idea of this specific text chunk.'),
  keyConcepts: z.array(z.string()).describe('A list of key concepts, entities, or terms discussed within this chunk.'),
  sourceDetails: SourceDetailsSchema.describe('Original source details inherited from the document, relevant to this chunk.'),
});
export type ChunkMetadata = z.infer<typeof ChunkMetadataSchema>;

const AutomatedChunkingAndMetadataGenerationOutputSchema = z.object({
  chunks: z.array(
    z.object({
      text: z.string().describe('The text content of the semantically coherent chunk.'),
      metadata: ChunkMetadataSchema.describe('Structured metadata associated with this chunk.'),
    })
  ).describe('An array of semantically coherent text chunks, each with its generated metadata.'),
});
export type AutomatedChunkingAndMetadataGenerationOutput = z.infer<typeof AutomatedChunkingAndMetadataGenerationOutputSchema>;

export async function automatedChunkingAndMetadataGeneration(
  input: AutomatedChunkingAndMetadataGenerationInput
): Promise<AutomatedChunkingAndMetadataGenerationOutput> {
  return automatedChunkingAndMetadataGenerationFlow(input);
}

const chunkingAndMetadataPrompt = ai.definePrompt({
  name: 'intelligentChunkingAndMetadataPrompt',
  input: { schema: AutomatedChunkingAndMetadataGenerationInputSchema },
  output: { schema: AutomatedChunkingAndMetadataGenerationOutputSchema },
  prompt: `You are an expert in document processing, text analysis, and knowledge extraction. Your task is to take a given document content, divide it into semantically coherent chunks, and generate rich, structured metadata for each chunk.\n\nPrioritize semantic coherence when dividing the document. Aim for chunks that represent a complete thought, paragraph, or section, even if it means slightly deviating from the target token counts. However, use the provided 'chunkSize' and 'chunkOverlap' as general guidelines.\n\nFor each generated chunk, identify its main topic and extract key concepts or terms. The 'sourceDetails' for the original document must be included verbatim in the metadata of every chunk.\n\nDocument Content:\n{{{documentContent}}}\n\nTarget Chunk Size (tokens): {{{chunkSize}}}\nTarget Chunk Overlap (tokens): {{{chunkOverlap}}}\nSource Details: {{{json sourceDetails}}}\n\nPlease provide the output as a JSON array of chunks, where each chunk object has a 'text' field for the chunk content and a 'metadata' field containing the 'topic', 'keyConcepts', and 'sourceDetails'.`
});

const automatedChunkingAndMetadataGenerationFlow = ai.defineFlow(
  {
    name: 'automatedChunkingAndMetadataGenerationFlow',
    inputSchema: AutomatedChunkingAndMetadataGenerationInputSchema,
    outputSchema: AutomatedChunkingAndMetadataGenerationOutputSchema,
  },
  async (input) => {
    const { output } = await chunkingAndMetadataPrompt(input);
    if (!output) {
      throw new Error('Failed to generate chunks and metadata.');
    }
    return output;
  }
);
