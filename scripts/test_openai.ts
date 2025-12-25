import { openaiService } from "@/shared/llm/openai";
import { result, userZodSchema } from "@/shared/zodSchemaBuilder/example";

async function main() {
  const isValid = result.success;
  console.log(isValid);
  console.log(result.data);

  const prompt = `Whats is the today president in indonesia?`;

  const { output, tokens } = await openaiService.callLLM(prompt, {
    zodSchema: userZodSchema,
  });
  console.log(output);
  console.log(tokens);
}

main();
