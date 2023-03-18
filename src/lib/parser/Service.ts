/* eslint-disable @typescript-eslint/no-explicit-any */
import { EntitySet } from "./EntitySet";
import { ComplexType } from "./ComplexType";
import { EntityType } from "./EntityType";
import { ActionImport } from "./Action";
import { FunctionImport } from "./Function";
import { EnumType } from "./EnumType";

export interface Service {
  entitySets: Array<EntitySet>;
  version: string;
  complexTypes: Array<ComplexType>;
  entityTypes: Array<EntityType>;
  singletons: Array<any>;
  actions: Array<ActionImport>;
  functions: Array<FunctionImport>;
  enumTypes: Array<EnumType>;
  defaultNamespace: string;
}
