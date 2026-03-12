
'use server';
/**
 * @fileOverview An AI flow for extracting entities and relationships to build a Knowledge Graph.
 *
 * - extractKnowledgeGraph - A function that handles the graph extraction process.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GraphNodeSchema = z.object({
  id: z.string().describe('Unique identifier for the entity.'),
  label: z.string().describe('The display name of the entity (e.g., "Brahman", "Upanishads").'),
  type: z.string().describe('The category of the entity (e.g., "Concept", "Philosopher", "School").'),
  description: z.string().optional().describe('A brief description of the entity within the context.'),
});

const GraphEdgeSchema = z.object({
  source: z.string().describe('The ID of the source node.'),
  target: z.string().describe('The ID of the target node.'),
  relation: z.string().describe('The type of relationship (e.g., "interprets", "appears_in", "related_to").'),
});

const KnowledgeGraphInputSchema = z.object({
  text: z.string().describe('The text content from which to extract graph data.'),
});
export type KnowledgeGraphInput = z.infer<typeof KnowledgeGraphInputSchema>;

const KnowledgeGraphOutputSchema = z.object({
  nodes: z.array(GraphNodeSchema),
  edges: z.array(GraphEdgeSchema),
});
export type KnowledgeGraphOutput = z.infer<typeof KnowledgeGraphOutputSchema>;

export async function extractKnowledgeGraph(input: KnowledgeGraphInput): Promise<KnowledgeGraphOutput> {
  const { output } = await ai.definePrompt({
    name: 'extractKnowledgeGraphPrompt',
    input: { schema: KnowledgeGraphInputSchema },
    output: { schema: KnowledgeGraphOutputSchema },
    prompt: `You are an expert knowledge graph engineer. Your task is to analyze the provided text and extract meaningful entities (nodes) and their relationships (edges).
Focus on civilizational, philosophical, or technical concepts.

Text:
---
{{{text}}}
---

Provide the output as a JSON object with 'nodes' and 'edges' arrays.`,
  })(input);

  if (!output) throw new Error('Failed to extract knowledge graph.');
  return output;
}
