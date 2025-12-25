import { z, ZodTypeAny } from "zod";
import { FieldSchema } from "./metaSchema";

function fieldToZod(field: FieldSchema): ZodTypeAny {
  let schema: ZodTypeAny;

  switch (field.type) {
    case "string": {
      let stringSchema = z.string();
      if (field.minLength) stringSchema = stringSchema.min(field.minLength);
      if (field.maxLength) stringSchema = stringSchema.max(field.maxLength);
      schema = stringSchema;
      break;
    }

    case "number": {
      let numberSchema = z.number();
      if (field.min !== undefined) numberSchema = numberSchema.min(field.min);
      if (field.max !== undefined) numberSchema = numberSchema.max(field.max);
      schema = numberSchema;
      break;
    }

    case "boolean":
      schema = z.boolean();
      break;

    case "object":
      if (!field.fields) {
        throw new Error(`Object field ${field.fieldName} missing fields`);
      }

      const shape: Record<string, ZodTypeAny> = {};
      for (const f of field.fields) {
        shape[f.fieldName] = fieldToZod(f);
      }
      schema = z.object(shape);
      break;

    case "array":
      if (!field.item) {
        throw new Error(`Array field ${field.fieldName} missing item schema`);
      }
      schema = z.array(fieldToZod(field.item));
      break;

    default:
      throw new Error(`Unsupported type: ${field.type}`);
  }

  // required / optional
  // OpenAI structured outputs requires .nullable() with .optional()
  // See: https://platform.openai.com/docs/guides/structured-outputs
  if (!field.required) {
    schema = schema.nullable().optional();
  }

  return schema;
}

export function buildZodSchema(fields: FieldSchema[]) {
  const shape: Record<string, ZodTypeAny> = {};

  for (const field of fields) {
    shape[field.fieldName] = fieldToZod(field);
  }

  return z.object(shape);
}
