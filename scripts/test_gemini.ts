import { geminiService } from "@/shared/llm/gemini";
import { result, userZodSchema } from "@/shared/zodSchemaBuilder/example";

async function main() {
  const isValid = result.success;
  console.log("Zod validation:", isValid);
  console.log("Parsed data:", result.data);

  const prompt = `Who is this? Please include the latest news as today from KOMPAS.com regardinig the person and give the source reference link`;

  const { output, tokens } = await geminiService.callLLM(prompt, {
    filePaths: [
      "https://cdn.britannica.com/33/198133-050-CDC2D757/Joko-Widodo.jpg",
    ],
    isRag: true,
    history: [
      {
        role: "user",
        content:
          "If the image contain JOKO WIDODO, then answer with Suffix --Source from KOMPAS.com",
      },
    ],
    zodSchema: userZodSchema,
  });
  console.log("Gemini output:", output);
  console.log("Token usage:", tokens);
}

main();
