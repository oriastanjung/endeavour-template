/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from "fs";
import path from "path";
import axios from "axios";
import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z, type ZodTypeAny } from "zod";
import { Document } from "@langchain/core/documents";
import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";
import { OpenAIEmbeddings } from "@langchain/openai";
import { createLogger } from "@/shared/logger";
import { OPENAI_API_KEY } from "@/config";

const logger = createLogger("OpenaiService");

const config = {
  openAiKey: OPENAI_API_KEY,
  uploadPath: path.normalize(path.join(process.cwd(), "temp")),
};

const embeddings = new OpenAIEmbeddings({
  apiKey: config.openAiKey,
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

  // 2. Create in-memory FAISS-like vector store
  const vectorStore = new MemoryVectorStore(embeddings);
  await vectorStore.addDocuments(docs);

  // 3. Retrieve top-K docs
  const relevantDocs = await vectorStore.similaritySearch(query, topK);
  const relevantContents = new Set(relevantDocs.map((d) => d.pageContent));

  // 4. Return only relevant messages from original history
  return history.filter((h) => relevantContents.has(h.content));
}

/**
 * Supported file extensions for file-search vector store.
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
const SUPPORTED_INPUT_IMAGE_TYPES = new Set(["png", "jpg", "jpeg"]);

/**
 * Supported file extensions for raw file input.
 */
const SUPPORTED_INPUT_FILE_TYPES = new Set(["pdf"]);

/**
 * Service wrapper for OpenAI client that supports:
 * - Text and multimodal input (text, images, files)
 * - Zod schema parsing for structured outputs
 * - RAG (context retrieval from history)
 * - File search with vector stores
 */
export class OpenAIService implements OpenAIServiceImplementation {
  private client: OpenAI;
  private model: string;
  private tempFiles: string[];

  /**
   * Create a new OpenAIService instance.
   * @param model - Default model to use (default: gpt-4.1-mini)
   */
  constructor(model: string = "gpt-4.1-mini") {
    this.client = new OpenAI({
      apiKey: config.openAiKey,
    });
    this.model = model;
    this.tempFiles = [];
  }

  /**
   * Extract token usage stats from a completion response.
   * @param completion - OpenAI response object
   * @returns Token usage summary
   */
  private generateTokenUsage(completion: {
    usage?: {
      input_tokens?: number;
      output_tokens?: number;
      output_tokens_details?: { reasoning_tokens?: number };
      total_tokens?: number;
    };
  }) {
    return {
      input_token: completion.usage?.input_tokens ?? 0,
      output_token: completion.usage?.output_tokens ?? 0,
      reasoning_token:
        completion.usage?.output_tokens_details?.reasoning_tokens ?? 0,
      total_token: completion.usage?.total_tokens ?? 0,
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
   * Wait until a file is indexed in a vector store.
   * @param vectorStoreId - ID of the vector store
   * @param fileId - ID of the file
   * @param timeout - Max wait time (ms)
   * @param interval - Polling interval (ms)
   */
  private async waitUntilFileIndexed(
    vectorStoreId: string,
    fileId: string,
    timeout = 60_000,
    interval = 500
  ) {
    const start = Date.now();
    while (true) {
      const result = await this.client.vectorStores.files.list(vectorStoreId);
      let status: string | null = null;
      for (const f of result.data) {
        if (f.id === fileId) {
          status = f.status;
          break;
        }
      }
      if (status === "completed") return;
      if (Date.now() - start > timeout) {
        throw new Error(`File ${fileId} indexing timeout!`);
      }
      await new Promise((res) => setTimeout(res, interval));
    }
  }

  /**
   * Call LLM with text, optional files, optional schema parsing, and optional RAG.
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
      useWebSearch?: boolean;
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
      useWebSearch = true,
    } = opts || {};

    try {
      const messages: any[] = [];

      // 1. system prompt
      if (systemPrompt) {
        messages.push({ role: "system", content: systemPrompt });
      }

      // 2. add history (all or filtered by RAG)
      if (history && history.length > 0) {
        let relevantHistory = history;
        if (isRag) {
          relevantHistory = await filterRelevantHistory(history, prompt, topK);
        }
        for (const h of relevantHistory) {
          messages.push({
            role: h.role,
            content: h.content,
          });
        }
      }

      // 3. user input (file + prompt)
      const userMessage: any[] = [];
      const processedPaths = filePaths
        ? await this.processFilePaths(filePaths)
        : [];
      const vectorIds: string[] = [];

      for (const filePath of processedPaths) {
        const ext = filePath.split(".").pop()?.toLowerCase() ?? "";

        if (SUPPORTED_INPUT_IMAGE_TYPES.has(ext)) {
          const fileObj = await this.client.files.create({
            file: fs.createReadStream(filePath),
            purpose: "user_data",
          });
          userMessage.push({ type: "input_image", file_id: fileObj.id });
        } else if (SUPPORTED_INPUT_FILE_TYPES.has(ext)) {
          const fileObj = await this.client.files.create({
            file: fs.createReadStream(filePath),
            purpose: "user_data",
          });
          userMessage.push({ type: "input_file", file_id: fileObj.id });
        } else if (SUPPORTED_FILE_SEARCH_TYPES.has(ext)) {
          const fileObj = await this.client.files.create({
            file: fs.createReadStream(filePath),
            purpose: "user_data",
          });
          const fileId = fileObj.id;
          const vectorStore = await this.client.vectorStores.create({
            name: "knowledge_base",
          });
          const vectorStoreId = vectorStore.id;

          await this.client.vectorStores.files.create(vectorStoreId, {
            file_id: fileId,
          });
          await this.waitUntilFileIndexed(vectorStoreId, fileId);

          vectorIds.push(vectorStoreId);
        } else {
          throw new Error(`Unsupported file type: .${ext}`);
        }
      }

      // 4. add user query
      userMessage.push({ type: "input_text", text: prompt });
      messages.push({ role: "user", content: userMessage });

      // 5. build tools
      const tools: OpenAI.Responses.Tool[] = [];
      if (useWebSearch) {
        tools.push({ type: "web_search" });
      }
      if (vectorIds.length > 0) {
        tools.unshift({
          type: "file_search",
          vector_store_ids: vectorIds,
        } as OpenAI.Responses.FileSearchTool);
      }
      // 6. call OpenAI (with timeout)
      let completion;
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
      if (zodSchema) {
        try {
          completion = await withTimeout(
            this.client.responses.parse({
              model: model || this.model,
              tools,
              input: messages,
              text: {
                format: zodTextFormat(zodSchema, "response"),
              },
            })
          );
        } catch (error) {
          logger.error(
            `Error in responses.parse: ${
              error instanceof Error ? error.message : String(error)
            }`
          );
          throw error;
        }
        return {
          output: completion.output_parsed as z.infer<T>,
          tokens: this.generateTokenUsage(completion),
        };
      } else {
        completion = await withTimeout(
          this.client.responses.create({
            model: model || this.model,
            tools,
            input: messages,
          })
        );
        return {
          output: completion.output_text as string,
          tokens: this.generateTokenUsage(completion),
        };
      }
    } finally {
      this.cleanupTempFiles();
    }
  }
}

/**
 * Interface for OpenAIService implementation.
 */
interface OpenAIServiceImplementation {
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
    }
  ): Promise<{ output: z.infer<T> | string; tokens: Record<string, number> }>;
}

// Create Singleton instance
export const openaiService = new OpenAIService();

// Example Usage
/*
import {openaiService} from "./openai.service";
const {output, tokens} = await openaiService.callLLM("What is the capital of France?");
console.log(output);
console.log(tokens);
*/
