import { ComplexType } from "./ComplexType";
import { EntityType } from "./EntityType";
import { ActionImport } from "./Action";
import { FunctionImport } from "./Function";
import { Singleton } from "./Singleton";
import { EnumType } from "./EnumType";

export interface Options {
  host: string;
  basePath: string;
  include?: Array<string>;
  complexTypes?: Array<ComplexType>;
  entityTypes?: Array<EntityType>;
  singletons?: Array<Singleton>;
  actions?: Array<ActionImport>;
  functions?: Array<FunctionImport>;
  enumTypes?: Array<EnumType>;
  defaultNamespace?: string;
}
