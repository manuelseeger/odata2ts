import { ReturnType } from "./ReturnType";
import { ActionAndFunctionParameter } from "./ActionAndFunctionParameter";

export interface ActionImport {
  name: string;
  parameters: Array<ActionAndFunctionParameter>;
  isBound?: boolean;
  entitySetPath?: string;
  returnType?: ReturnType;
}
