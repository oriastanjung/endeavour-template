export type FieldType = "string" | "number" | "boolean" | "object" | "array";

export interface FieldSchema {
  fieldName: string;
  type: FieldType;

  // opsional
  required?: boolean;
  label?: string;

  // string config
  minLength?: number;
  maxLength?: number;

  // number config
  min?: number;
  max?: number;

  // nested
  fields?: FieldSchema[]; // object
  item?: FieldSchema; // array
}
