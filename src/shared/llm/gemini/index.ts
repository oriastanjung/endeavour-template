/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from "fs";
import path from "path";
import axios from "axios";
import { GoogleGenAI } from "@google/genai";
import { zodToJsonSchema } from "zod-to-json-schema";
import { z, type ZodTypeAny } from "zod";
import { Document } from "@langchain/core/documents";
import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { createLogger } from "@/shared/logger";
import { GEMINI_API_KEY } from "@/config";

const logger = createLogger("GeminiService");

const config = {
  geminiApiKey: GEMINI_API_KEY,
  uploadPath: path.normalize(path.join(process.cwd(), "temp")),
};

const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: config.geminiApiKey,
  model: "text-embedding-004",
});

/**
 * Filter top-K relevant chat history messages given a query.
 *
 * @param history - Array of chat messages { role, content }
 * @param query - Query string to compare against
 * @param topK - Number of relevant messages to return
 * @returns Filtered list of relevant messages
 */
export async function filterRelevantHistory(
  history: { role: string; content: string }[],
  query: string,
  topK: number = 5
): Promise<{ role: string; content: string }[]> {
  // 1. Convert chat history into LangChain Documents
  const docs = history.map(
    (h) =>
      new Document({
        pageContent: h.content,
        metadata: { role: h.role },
      })
  );

  // 2. Create in-memory vector store
  const vectorStore = new MemoryVectorStore(embeddings);
  await vectorStore.addDocuments(docs);

  // 3. Retrieve top-K docs
  const relevantDocs = await vectorStore.similaritySearch(query, topK);
  const relevantContents = new Set(relevantDocs.map((d) => d.pageContent));

  // 4. Return only relevant messages from original history
  return history.filter((h) => relevantContents.has(h.content));
}

/**
 * Supported file extensions for file-search.
 * Reference: https://ai.google.dev/gemini-api/docs/file-search
 */
const SUPPORTED_FILE_SEARCH_TYPES = new Set([
  "c",
  "cpp",
  "cs",
  "css",
  "doc",
  "docx",
  "go",
  "html",
  "java",
  "js",
  "json",
  "md",
  "pdf",
  "php",
  "pptx",
  "py",
  "rb",
  "sh",
  "tex",
  "ts",
  "txt",
]);

/**
 * Supported image file extensions for input.
 */
const SUPPORTED_INPUT_IMAGE_TYPES = new Set([
  "png",
  "jpg",
  "jpeg",
  "gif",
  "webp",
]);

/**
 * Supported file extensions for raw file input.
 */
const SUPPORTED_INPUT_FILE_TYPES = new Set(["pdf"]);

/**
 * Service wrapper for Google Gemini client that supports:
 * - Text and multimodal input (text, images, files)
 * - Zod schema parsing for structured outputs
 * - RAG (context retrieval from history)
 * - File search with vector stores
 * - Google Search grounding
 * - URL context
 */
export class GeminiService implements GeminiServiceImplementation {
  private client: GoogleGenAI;
  private model: string;
  private tempFiles: string[];

  /**
   * Create a new GeminiService instance.
   * @param model - Default model to use (default: gemini-2.5-flash)
   */
  constructor(model: string = "gemini-2.5-flash") {
    this.client = new GoogleGenAI({
      apiKey: config.geminiApiKey,
    });
    this.model = model;
    this.tempFiles = [];
  }

  /**
   * Extract token usage stats from a completion response.
   * @param response - Gemini response object
   * @returns Token usage summary
   */
  private generateTokenUsage(response: {
    usageMetadata?: {
      promptTokenCount?: number;
      candidatesTokenCount?: number;
      totalTokenCount?: number;
      thoughtsTokenCount?: number;
    };
  }) {
    return {
      input_token: response.usageMetadata?.promptTokenCount ?? 0,
      output_token: response.usageMetadata?.candidatesTokenCount ?? 0,
      reasoning_token: response.usageMetadata?.thoughtsTokenCount ?? 0,
      total_token: response.usageMetadata?.totalTokenCount ?? 0,
    };
  }

  /**
   * Check if a given path is a URL.
   * @param path - File path or URL
   */
  private isUrl(path: string): boolean {
    return path.startsWith("http://") || path.startsWith("https://");
  }

  /**
   * Download a file from URL to a temporary directory.
   * @param url - Remote file URL
   * @param tempDir - Temporary directory path
   * @returns Path to downloaded file
   */
  private async downloadFileFromUrl(
    url: string,
    tempDir: string
  ): Promise<string> {
    const parsedUrl = new URL(url);
    let filename = path.basename(parsedUrl.pathname);

    if (!filename || !filename.includes(".")) {
      filename = `downloaded_file_${Date.now()}.pdf`;
    }

    const tempFilePath = path.join(tempDir, filename);
    const response = await axios.get(url, { responseType: "arraybuffer" });
    fs.writeFileSync(tempFilePath, response.data);

    this.tempFiles.push(tempFilePath);
    return tempFilePath;
  }

  /**
   * Process file paths and download remote URLs into temporary files.
   * @param filePaths - Array of file paths or URLs
   * @returns Local file paths (including downloaded temp files)
   */
  private async processFilePaths(filePaths: string[]): Promise<string[]> {
    if (!filePaths || filePaths.length === 0) return [];

    // Use single temp directory in current working directory
    const tempDir = config.uploadPath;

    // Ensure temp directory exists
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
      logger.info(`Created temp directory: ${tempDir}`);
    }

    const processed: string[] = [];

    for (const p of filePaths) {
      if (this.isUrl(p)) {
        processed.push(await this.downloadFileFromUrl(p, tempDir));
      } else {
        processed.push(p);
      }
    }
    return processed;
  }

  /**
   * Clean up temporary files created during execution.
   * Note: Only removes individual files, not the temp directory itself.
   */
  private cleanupTempFiles() {
    // Clean up individual temp files only
    for (const tempFile of this.tempFiles) {
      try {
        if (fs.existsSync(tempFile)) {
          fs.unlinkSync(tempFile);
        }
      } catch (err) {
        console.warn(`Failed to delete temp file ${tempFile}:`, err);
      }
    }
    this.tempFiles = [];
  }

  /**
   * Get MIME type from file extension.
   * @param filePath - Path to the file
   * @returns MIME type string
   */
  private getMimeType(filePath: string): string {
    const ext = filePath.split(".").pop()?.toLowerCase() ?? "";
    const mimeTypes: Record<string, string> = {
      png: "image/png",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      gif: "image/gif",
      webp: "image/webp",
      pdf: "application/pdf",
      txt: "text/plain",
      md: "text/markdown",
      html: "text/html",
      css: "text/css",
      js: "text/javascript",
      ts: "text/typescript",
      json: "application/json",
      py: "text/x-python",
      java: "text/x-java",
      c: "text/x-c",
      cpp: "text/x-c++",
      cs: "text/x-csharp",
      go: "text/x-go",
      rb: "text/x-ruby",
      php: "text/x-php",
      sh: "text/x-shellscript",
      doc: "application/msword",
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      tex: "application/x-tex",
    };
    return mimeTypes[ext] || "application/octet-stream";
  }

  /**
   * Upload a file to Gemini API.
   * @param filePath - Path to the file
   * @returns Uploaded file object
   */
  private async uploadFile(filePath: string) {
    const mimeType = this.getMimeType(filePath);
    const fileBuffer = fs.readFileSync(filePath);
    const base64Data = fileBuffer.toString("base64");

    return {
      inlineData: {
        mimeType,
        data: base64Data,
      },
    };
  }

  /**
   * Wait until a file search store operation is complete.
   * @param operation - Operation object to poll
   * @param timeout - Max wait time (ms)
   * @param interval - Polling interval (ms)
   */
  private async waitForOperation(
    operation: any,
    timeout = 60_000,
    interval = 5000
  ): Promise<any> {
    const start = Date.now();
    let currentOp = operation;

    while (!currentOp.done) {
      if (Date.now() - start > timeout) {
        throw new Error("File search store operation timeout!");
      }
      await new Promise((res) => setTimeout(res, interval));
      currentOp = await this.client.operations.get({ operation: currentOp });
    }

    return currentOp;
  }

  /**
   * Call LLM with text, optional files, optional schema parsing, and optional RAG.
   *
   * NOTE: Gemini does not support using tools (Google Search, URL Context, File Search)
   * together with structured output (Zod schema) in the same request.
   * When both are needed, this method uses a two-step process:
   * 1. First call with tools (gemini-2.5-flash) to get tool-enhanced response
   * 2. Second call with the tool response + original prompt to generate structured output
   *
   * @typeParam T - Zod schema type
   * @param prompt - User input text
   * @param opts - Options
   * @param opts.systemPrompt - System message to set behavior
   * @param opts.zodSchema - Zod schema for structured parsing
   * @param opts.filePaths - Local/remote file paths
   * @param opts.model - Override default model
   * @param opts.history - Chat history (role, content)
   * @param opts.topK - Number of relevant history messages to retrieve (if RAG)
   * @param opts.isRag - Default is true, Whether to use retrieval-augmented generation
   * @param opts.useTools - Enable Google Search grounding and URL context tools (default: true)
   * @returns Model output (raw text or parsed object) + token usage
   */
  public async callLLM<T extends ZodTypeAny>(
    prompt: string,
    opts?: {
      systemPrompt?: string;
      zodSchema?: T;
      filePaths?: string[];
      model?: string;
      history?: { role: string; content: string }[];
      topK?: number;
      isRag?: boolean;
      timeoutMs?: number;
      useTools?: boolean;
      useFileSearch?: boolean;
    }
  ): Promise<{ output: z.infer<T> | string; tokens: Record<string, number> }> {
    const {
      systemPrompt,
      zodSchema,
      filePaths,
      model,
      history,
      topK = 5,
      isRag = true,
      timeoutMs,
      useTools = true,
      useFileSearch = false,
    } = opts || {};

    try {
      const contents: any[] = [];
      const tools: any[] = [];
      const processedPaths = filePaths
        ? await this.processFilePaths(filePaths)
        : [];

      // 1. Add history (all or filtered by RAG)
      if (history && history.length > 0) {
        let relevantHistory = history;
        if (isRag) {
          relevantHistory = await filterRelevantHistory(history, prompt, topK);
        }
        for (const h of relevantHistory) {
          contents.push({
            role: h.role === "assistant" ? "model" : h.role,
            parts: [{ text: h.content }],
          });
        }
      }

      // 2. Build user message with files and prompt
      const userParts: any[] = [];
      const fileSearchStoreNames: string[] = [];

      for (const filePath of processedPaths) {
        const ext = filePath.split(".").pop()?.toLowerCase() ?? "";

        if (SUPPORTED_INPUT_IMAGE_TYPES.has(ext)) {
          // Inline image as base64
          const uploadedFile = await this.uploadFile(filePath);
          userParts.push(uploadedFile);
        } else if (SUPPORTED_INPUT_FILE_TYPES.has(ext)) {
          // Inline file as base64
          const uploadedFile = await this.uploadFile(filePath);
          userParts.push(uploadedFile);
        } else if (useFileSearch && SUPPORTED_FILE_SEARCH_TYPES.has(ext)) {
          // Use File Search for text-based files
          try {
            const fileSearchStore = await this.client.fileSearchStores.create({
              config: { displayName: `knowledge_base_${Date.now()}` },
            });

            let operation =
              await this.client.fileSearchStores.uploadToFileSearchStore({
                file: filePath,
                fileSearchStoreName: fileSearchStore.name!,
                config: { displayName: path.basename(filePath) },
              });

            operation = await this.waitForOperation(operation);
            fileSearchStoreNames.push(fileSearchStore.name!);
          } catch (err) {
            logger.error(`Error uploading file to file search store: ${err}`);
            // Fallback: read file content directly
            const content = fs.readFileSync(filePath, "utf-8");
            userParts.push({
              text: `\n\n--- Content from ${path.basename(
                filePath
              )} ---\n${content}\n---\n`,
            });
          }
        } else {
          // Read file content directly for unsupported types
          try {
            const content = fs.readFileSync(filePath, "utf-8");
            userParts.push({
              text: `\n\n--- Content from ${path.basename(
                filePath
              )} ---\n${content}\n---\n`,
            });
          } catch (err) {
            throw new Error(`Unsupported file type: .${ext}`);
          }
        }
      }

      // Add the text prompt
      userParts.push({ text: prompt });
      contents.push({ role: "user", parts: userParts });

      // 3. Build tools array (Google Search + URL Context)
      if (useTools) {
        tools.push({ googleSearch: {} });
        tools.push({ urlContext: {} });
      }

      if (fileSearchStoreNames.length > 0) {
        tools.push({
          fileSearch: {
            fileSearchStoreNames,
          },
        });
      }

      // Helper: timeout wrapper
      const withTimeout = async <R>(p: Promise<R>): Promise<R> => {
        if (!timeoutMs || timeoutMs <= 0) {
          return await p;
        }
        return (await Promise.race([
          p,
          new Promise<never>((_, reject) =>
            setTimeout(
              () =>
                reject(new Error(`LLM request timed out after ${timeoutMs}ms`)),
              timeoutMs
            )
          ),
        ])) as R;
      };

      // Helper: sum token usage
      const sumTokens = (
        tokens1: Record<string, number>,
        tokens2: Record<string, number>
      ): Record<string, number> => {
        return {
          input_token: (tokens1.input_token || 0) + (tokens2.input_token || 0),
          output_token:
            (tokens1.output_token || 0) + (tokens2.output_token || 0),
          reasoning_token:
            (tokens1.reasoning_token || 0) + (tokens2.reasoning_token || 0),
          total_token: (tokens1.total_token || 0) + (tokens2.total_token || 0),
        };
      };

      const hasTools = tools.length > 0;

      try {
        // CASE 1: Using zodSchema WITH tools -> Two-step process
        // Gemini doesn't support tools + structured output together
        if (zodSchema && hasTools) {
          // Step 1: Call with tools using gemini-2.5-flash (mandatory for tool calls)
          const toolConfig: any = {
            tools,
          };
          if (systemPrompt) {
            toolConfig.systemInstruction = systemPrompt;
          }
          const customInstruction = `# ALWAYS OUTPUT IN THE JSON of This Schema : 
          '''json schema 
          ${JSON.stringify(zodToJsonSchema(zodSchema), null, 2)}
          '''`;
          contents.push({
            role: "user",
            parts: [
              {
                text: customInstruction,
              },
            ],
          });

          const toolResponse = await withTimeout(
            this.client.models.generateContent({
              model: "gemini-2.5-flash", // Mandatory for tool calls
              contents,
              config: toolConfig,
            })
          );
          const toolResultText = toolResponse.text || "";
          const toolTokens = this.generateTokenUsage(toolResponse);

          // Step 2: Call with structured output using selected model
          const structuredPrompt = `Based on the following information, please provide a structured response.
Original Request: ${prompt}

--- CONTEXT FROM PREVIOUS ANALYSIS ---
${toolResultText}
--- END CONTEXT ---


Please respond according to the expected JSON schema format.`;

          const structuredConfig: any = {
            responseMimeType: "application/json",
            responseJsonSchema: zodToJsonSchema(zodSchema),
          };
          if (systemPrompt) {
            structuredConfig.systemInstruction = systemPrompt;
          }

          const structuredResponse = await withTimeout(
            this.client.models.generateContent({
              model: model || this.model,
              contents: [{ role: "user", parts: [{ text: structuredPrompt }] }],
              config: structuredConfig,
            })
          );

          const parsed = zodSchema.parse(
            JSON.parse(structuredResponse.text || "{}")
          );
          const structuredTokens = this.generateTokenUsage(structuredResponse);

          return {
            output: parsed as z.infer<T>,
            tokens: sumTokens(toolTokens, structuredTokens),
          };
        }

        // CASE 2: Using zodSchema WITHOUT tools -> Single call with structured output
        if (zodSchema && !hasTools) {
          const generateConfig: any = {
            responseMimeType: "application/json",
            responseJsonSchema: zodToJsonSchema(zodSchema),
          };
          if (systemPrompt) {
            generateConfig.systemInstruction = systemPrompt;
          }

          const response = await withTimeout(
            this.client.models.generateContent({
              model: model || this.model,
              contents,
              config: generateConfig,
            })
          );

          const parsed = zodSchema.parse(JSON.parse(response.text || "{}"));
          return {
            output: parsed as z.infer<T>,
            tokens: this.generateTokenUsage(response),
          };
        }

        // CASE 3: No zodSchema (with or without tools) -> Single call
        const generateConfig: any = {};
        if (systemPrompt) {
          generateConfig.systemInstruction = systemPrompt;
        }
        if (hasTools) {
          generateConfig.tools = tools;
        }

        const response = await withTimeout(
          this.client.models.generateContent({
            model: model || this.model,
            contents,
            config: generateConfig,
          })
        );

        return {
          output: response.text || "",
          tokens: this.generateTokenUsage(response),
        };
      } catch (error) {
        logger.error(
          `Error in generateContent: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
        throw error;
      }
    } finally {
      this.cleanupTempFiles();
    }
  }

  /**
   * Generate embeddings for a single text or array of texts.
   *
   * @param content - Single text or array of texts to embed
   * @param opts - Options
   * @param opts.model - Embedding model to use (default: gemini-embedding-001)
   * @param opts.taskType - Task type for better quality embeddings
   * @returns Embeddings array
   */
  public async embedContent(
    content: string | string[],
    opts?: {
      model?: string;
      taskType?:
        | "RETRIEVAL_DOCUMENT"
        | "RETRIEVAL_QUERY"
        | "SEMANTIC_SIMILARITY"
        | "CLASSIFICATION"
        | "CLUSTERING";
    }
  ): Promise<{ embeddings: number[][]; tokens: Record<string, number> }> {
    const { model = "gemini-embedding-001", taskType } = opts || {};

    try {
      const response = await this.client.models.embedContent({
        model,
        contents: content,
        config: taskType ? { taskType } : undefined,
      });

      const embeddingsData =
        response.embeddings?.map((e: any) => e.values || []) || [];

      return {
        embeddings: embeddingsData,
        tokens: {
          total_token: 0, // Gemini doesn't provide token count for embeddings
        },
      };
    } catch (error) {
      logger.error(
        `Error in embedContent: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      throw error;
    }
  }
}

/**
 * Interface for GeminiService implementation.
 */
interface GeminiServiceImplementation {
  callLLM<T extends ZodTypeAny>(
    prompt: string,
    opts?: {
      systemPrompt?: string;
      zodSchema?: T;
      filePaths?: string[];
      model?: string;
      history?: { role: string; content: string }[];
      topK?: number;
      isRag?: boolean;
      useTools?: boolean;
      useFileSearch?: boolean;
    }
  ): Promise<{ output: z.infer<T> | string; tokens: Record<string, number> }>;

  embedContent(
    content: string | string[],
    opts?: {
      model?: string;
      taskType?:
        | "RETRIEVAL_DOCUMENT"
        | "RETRIEVAL_QUERY"
        | "SEMANTIC_SIMILARITY"
        | "CLASSIFICATION"
        | "CLUSTERING";
    }
  ): Promise<{ embeddings: number[][]; tokens: Record<string, number> }>;
}

// Create Singleton instance
export const geminiService = new GeminiService();

// Example Usage
/*
import { geminiService } from "./gemini.service";

// Basic text generation
const { output, tokens } = await geminiService.callLLM("What is the capital of France?");
console.log(output);
console.log(tokens);

// With structured output using Zod schema
import { z } from "zod";
const schema = z.object({
  capital: z.string(),
  country: z.string(),
});
const { output: parsed } = await geminiService.callLLM("What is the capital of France?", {
  zodSchema: schema,
});
console.log(parsed.capital);

// With Google Search grounding
const { output: groundedOutput } = await geminiService.callLLM("Who won the 2024 Olympics?", {
  useWebSearch: true,
});

// With URL context
const { output: urlOutput } = await geminiService.callLLM(
  "Summarize this article: https://example.com/article",
  { useUrlContext: true }
);

// Embeddings
const { embeddings } = await geminiService.embedContent("Hello world");
console.log(embeddings);
*/
