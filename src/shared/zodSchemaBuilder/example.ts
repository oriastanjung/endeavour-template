import { FieldSchema } from "./metaSchema";
import { buildZodSchema } from "./zodBuilder";

const userFormSchema: FieldSchema[] = [
  {
    fieldName: "name",
    type: "string",
    required: true,
    minLength: 3,
  },
  {
    fieldName: "age",
    type: "number",
    min: 18,
  },
  {
    fieldName: "isActive",
    type: "boolean",
  },
  {
    fieldName: "address",
    type: "object",
    fields: [
      { fieldName: "city", type: "string", required: true },
      { fieldName: "zip", type: "string" },
    ],
  },
];

const userZodSchema = buildZodSchema(userFormSchema);
const result = userZodSchema.safeParse({
  name: "John",
  age: 20,
  isActive: true,
  address: {
    city: "Bandung",
    zip: "12345",
  },
});

export { result, userZodSchema };
