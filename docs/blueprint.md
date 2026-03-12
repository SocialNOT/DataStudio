# **App Name**: Mitsara Data Studio

## Core Features:

- Document Ingestion: Upload or import various document types including PDF, TXT, DOCX, Markdown, HTML, scanned images, and website URLs, as well as entire folders of documents.
- OCR Engine Tool: Perform optical character recognition (OCR) on scanned documents and manuscripts, supporting Tesseract, PaddleOCR, and Google Vision OCR with multiple languages like Sanskrit, Hindi, and English.
- Intelligent Text Cleaning Tool: Intelligently remove noise from raw documents, such as page numbers, headers, footers, Unicode encoding issues, footnotes, and other formatting artifacts.
- Configurable Text Chunking & Metadata Generation Tool: Segment processed text into structured chunks optimized for RAG systems using configurable parameters like chunk size and overlap, and generate preliminary structured metadata for each chunk.
- Human-in-the-Loop Editor: Provide a panel for users to edit text chunks, add annotations, attach tags, correct OCR errors, and review generated metadata to ensure high-quality datasets.
- Vector Database Deployment: Generate embeddings using various models (e.g., BGE, Instructor-xl, OpenAI) and directly push the processed data and embeddings to integrated vector databases like Weaviate, ChromaDB, Pinecone, and Qdrant.
- Dataset Export: Export datasets in various formats including JSONL, CSV, Parquet, and HuggingFace dataset format, suitable for RAG pipelines, fine-tuning LLMs, or other machine learning workflows.

## Style Guidelines:

- The chosen color scheme is dark, reflecting the serious and intellectual nature of knowledge systems and data processing. The primary color, a soft indigo (`#8C85E0`), represents depth, wisdom, and digital clarity. The background is a very dark, slightly bluish-purple (`#21212C`), providing a clean canvas for detailed data work. The accent color, a strong sky-blue (`#478BEB`), offers a clear digital highlight and good contrast for interactive elements and calls to action.
- Headlines will use 'Space Grotesk' (sans-serif), conveying a modern, tech-oriented, and structured feel suitable for a data studio. Body text will utilize 'Inter' (sans-serif), ensuring excellent readability for extended periods of document review and annotation. Code snippets and technical parameters will be presented in 'Source Code Pro' (monospace) for clarity and authenticity.
- Use minimalist, clean line icons that communicate data processing, document management, AI workflows, and integration points with clarity and professionalism, aligning with the studio's precise functionality.
- The application features a 'single-screen workspace' layout, organized into distinct panels for an intuitive, continuous data pipeline flow. The design is mobile-responsive, transitioning to tab navigation on smaller screens using TailwindCSS, to ensure consistent usability across devices.
- Subtle and functional animations should be used to provide visual feedback during document uploads, processing steps, and data synchronization, enhancing the user experience without causing distraction.