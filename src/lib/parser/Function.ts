import { ReturnType } from "./ReturnType";
import { ActionAndFunctionParameter } from "./ActionAndFunctionParameter";

export interface FunctionImport {
  name: string;
  isBound: boolean;
  isComposable: boolean;
  parameters?: Array<ActionAndFunctionParameter>;
  entitySetPath?: string;
  returnType: ReturnType;
}
