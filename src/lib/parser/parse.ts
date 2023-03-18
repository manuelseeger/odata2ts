/* eslint-disable @typescript-eslint/no-explicit-any */
import * as xml2js from "xml-js";

import { Service } from "./Service";
import { EntitySet } from "./EntitySet";
import { EntityType } from "./EntityType";
import { EntityProperty } from "./EntityProperty";
import { ActionImport } from "./Action";
import { FunctionImport } from "./Function";
import { ReturnType } from "./ReturnType";
import { ActionAndFunctionParameter } from "./ActionAndFunctionParameter";
import { ComplexType } from "./ComplexType";
import { Annotation } from "./Annotation";
import { Singleton } from "./Singleton";
import { EnumType } from "./EnumType";

function typeNameFromType(type: string): string {
  if (type) {
    const s = type.split(".").pop();
    if (s !== undefined) {
      return s;
    } else {
      return "";
    }
  } else {
    return "";
  }
}

function getEntityBaseTypes(entityType: any, entityTypes: any) {
  const baseTypes = [];

  while (entityType) {
    const baseTypeName = typeNameFromType(entityType["$"]["BaseType"]);
    entityType = (entityTypes as Array<any>).find(
      (entity) => entity["$"]["Name"] == baseTypeName
    );
    if (entityType) {
      baseTypes.push(entityType);
    }
  }

  return baseTypes;
}

function parseEntitySets(
  namespace: string,
  entityContainer: any,
  entityTypes: any,
  annotations?: Array<Annotation>
): Array<EntitySet> {
  return (entityContainer["EntitySet"] as Array<any>)
    .map((entitySet) => {
      const type = typeNameFromType(entitySet["$"]["EntityType"]);

      const entityType = (entityTypes as Array<any>).find(
        (entity) => entity["$"]["Name"] == type
      );
      return parseEntitySet(
        namespace,
        entitySet,
        entityType,
        entityTypes,
        annotations
      );
    })
    .filter((entitySet) => !!entitySet);
}

function parseEntitySet(
  namespace: string,
  entitySet: any,
  entityType: any,
  entityTypes: Array<any>,
  annotations?: Array<Annotation>
): EntitySet {
  return {
    namespace,
    name: entitySet["$"]["Name"],
    entityType: parseEntityType(entityType, entityTypes, namespace),
    annotations: parseEntityTypeAnnotations(
      namespace,
      entityType,
      entityTypes,
      annotations
    ),
  };
}

function parseEntityPaths(entityType: any): Array<any> {
  const paths: Array<any> = [];

  if (entityType["NavigationProperty"]) {
    (entityType["NavigationProperty"] as Array<any>).forEach((p) => {
      if (p["$"]["ContainsTarget"]) {
        paths.push({
          name: p["$"]["Name"],
          type: p["$"]["Type"],
        });
      }
    });
  }

  return paths;
}

function parseEntityTypeAnnotations(
  namespace: string,
  entityType: any,
  entityTypes: Array<any>,
  annotations?: Array<Annotation>
): Array<any> {
  const allTypes = [entityType].concat(
    getEntityBaseTypes(entityType, entityTypes)
  );

  const typeAnnotations: Array<string> = [];

  if (annotations) {
    annotations.forEach((a) => {
      allTypes.forEach((t) => {
        if (a.target == `${namespace}.${t["$"]["Name"]}`) {
          a.terms.forEach((term) => {
            if (typeAnnotations.indexOf(term) == -1) {
              typeAnnotations.push(term);
            }
          });
        }
      });
    });
  }

  return typeAnnotations;
}

function parseEntityType(
  entityType: any,
  entityTypes: Array<any>,
  namespace: string
): EntityType {
  const entityBaseTypes = getEntityBaseTypes(entityType, entityTypes);
  const entityBaseProperties = entityBaseTypes.flatMap((t) =>
    (t["Property"] || []).map(parseProperty)
  );

  const result: EntityType = {
    name: entityType["$"]["Name"],
    abstract: entityType["$"]["Abstract"],
    properties: entityBaseProperties.concat(
      (entityType["Property"] || []).map(parseProperty)
    ),
    paths: parseEntityPaths(entityType),
    namespace,
  };

  const baseTypeWithKey = entityBaseTypes.find((t) => t["Key"]);
  const keys = entityType["Key"] || (baseTypeWithKey && baseTypeWithKey["Key"]);

  if (keys && keys.length > 0) {
    result.key = parseKey(keys[0], result.properties);
  }

  const navigationProperties = entityType["NavigationProperty"];

  if (navigationProperties && navigationProperties.length > 0) {
    (navigationProperties as Array<any>).forEach((property) => {
      const type = property["$"]["Type"];

      if (type) {
        // OData V4 only
        const ref = `#/definitions/${type.split(/[()]/)[1]}`;
        const name = property["$"]["Name"];

        if (type.startsWith("Collection(")) {
          result.properties.push({
            name: name,
            type: "array",
            items: {
              $ref: ref,
            },
            wrapValueInQuotesInUrls: true,
          });
        } else {
          const prop = <any>{
            name: name,
            $ref: `#/definitions/${type}`,
            wrapValueInQuotesInUrls: true,
          };

          const refConstraint = property["ReferentialConstraint"];
          const constraints = refConstraint
            ? (refConstraint as Array<any>).map((c) => {
                return {
                  property: c["$"]["Property"],
                  refProperty: c["$"]["ReferencedProperty"],
                };
              })
            : [];

          prop["x-ref"] = {
            name: name,
            partner: property["$"]["Partner"],
            constraints: constraints,
          };

          result.properties.push(prop);
        }
      }
    });
  }

  return result;
}

function parseKey(
  key: any,
  properties: Array<EntityProperty>
): Array<EntityProperty> {
  const refs = (key["PropertyRef"] as Array<any>).map(
    (propertyRef) => propertyRef["$"]["Name"]
  );

  return properties.filter((property) => refs.includes(property.name));
}

function parseProperty(property: any): EntityProperty {
  const type = property["$"]["Type"];

  const dontWrapValueInQuotesInUrlsTypes = [
    "Edm.Int16",
    "Edm.Int32",
    "Edm.Int64",
    "Edm.Double",
    "Edm.Single",
    "Edm.Decimal",
    "Edm.Guid",
  ];

  const wrapValueInQuotesInUrls =
    !dontWrapValueInQuotesInUrlsTypes.includes(type);

  const result: EntityProperty = {
    required: property["$"]["Nullable"] == "false",
    name: property["$"]["Name"],
    wrapValueInQuotesInUrls,
    $: property["$"],
  };

  if (type.startsWith("Collection(")) {
    const objectType = type.match(/^Collection\((.*)\)$/)[1];
    result.type = "array";
    if (objectType.startsWith("Edm.")) {
      result.items = {
        type: objectType,
      };
    } else {
      result.items = {
        $ref: `#/definitions/${objectType}`,
      };
    }
  } else {
    result.type = type;
  }

  return result;
}

function parseActions(actions: Array<any>): Array<ActionImport> {
  return actions && actions.length
    ? actions.map((action) => {
        return {
          name: action["$"]["Name"],
          isBound: action["$"]["IsBound"],
          entitySetPath: action["$"]["EntitySetPath"],
          returnType: parseReturnTypes(action["ReturnType"]),
          parameters: parseActionAndFunctionParameters(action["Parameter"]),
        };
      })
    : [];
}

function parseFunctions(functions: Array<any>): Array<FunctionImport> {
  return functions && functions.length
    ? functions.map((func) => {
        return {
          name: func["$"]["Name"],
          isBound: func["$"]["IsBound"],
          isComposable: func["$"]["IsComposable"],
          entitySetPath: func["$"]["EntitySetPath"],
          returnType: parseReturnTypes(func["ReturnType"]),
          parameters: parseActionAndFunctionParameters(func["Parameter"]),
        };
      })
    : [];
}

function parseReturnTypes(returnType: any): ReturnType {
  if (returnType && returnType[0]) {
    return {
      type: returnType[0]["$"]["Type"],
      nullable: !(returnType[0]["$"]["Nullable"] == "false"),
    };
  } else {
    return {
      type: "",
    };
  }
}

function parseActionAndFunctionParameters(
  parameters: Array<any>
): Array<ActionAndFunctionParameter> {
  return parameters && parameters.length
    ? parameters.map((parameter) => {
        return {
          name: parameter["$"]["Name"],
          type: parameter["$"]["Type"],
          nullable: !(parameter["$"]["Nullable"] == "false"),
        };
      })
    : [];
}

function parseComplexTypes(
  complexTypes: Array<any>,
  schemas: Array<any>
): Array<ComplexType> {
  return complexTypes && complexTypes.length
    ? complexTypes.map((t) => {
        const schema = schemas.find((s) =>
          (s["ComplexType"] as Array<any>).find((ct) => ct == t)
        );

        return {
          name: t["$"]["Name"],
          properties: (t["Property"] || []).map(parseProperty),
          namespace: schema ? schema["$"]["Namespace"] : null,
        };
      })
    : [];
}

function parseEnumTypes(
  enumTypes: Array<any>,
  schemas: Array<any>
): Array<EnumType> {
  return enumTypes && enumTypes.length
    ? enumTypes.map((t) => {
        const schema = schemas.find((s) =>
          (s["EnumType"] as Array<any>).find((ct) => ct == t)
        );

        return {
          name: t["$"]["Name"],
          memberNames: ((t["Member"] || []) as Array<any>).map(
            (m) => m["$"]["Name"]
          ),
          namespace: schema ? schema["$"]["Namespace"] : null,
        };
      })
    : [];
}

function parseAnnotations(annotations: Array<any>): Array<Annotation> {
  return annotations && annotations.length
    ? annotations.map((t) => {
        return {
          target: t["$"]["Target"],
          terms: ((t["Annotation"] || []) as Array<any>).map(
            (a) => a["$"]["Term"]
          ),
        };
      })
    : [];
}

function parseSingletons(
  singletons: Array<any>,
  entitySets: Array<EntitySet>
): Array<Singleton> {
  return singletons && singletons.length
    ? singletons.map((s) => {
        const properties: Array<any> = [];

        ((s["NavigationPropertyBinding"] || []) as Array<any>).forEach((n) => {
          const entitySet = entitySets.find(
            (es) => es.name == n["$"]["Target"]
          );
          if (entitySet) {
            const path = n["$"]["Path"];
            if (path) {
              properties.push({
                name: path.split("/").pop(),
                type:
                  path.indexOf("/") != -1
                    ? `${entitySet.namespace}.${entitySet.entityType.name}`
                    : `Collection(${entitySet.namespace}.${entitySet.entityType.name})`,
              });
            }
          }
        });

        return {
          name: s["$"]["Name"],
          type: s["$"]["Type"],
          properties,
        };
      })
    : [];
}

function parseEntityTypes(
  entityTypes: Array<any>,
  schemas: Array<any>
): Array<EntityType> {
  return entityTypes.map((et) => {
    const schema = schemas.find((s) =>
      (s["EntityType"] as Array<any>).find((t) => t == et)
    );

    return parseEntityType(
      et,
      entityTypes,
      schema ? schema["$"]["Namespace"] : ""
    );
  });
}

function parse(xml: string): Promise<Service> {
  return new Promise<Service>((resolve, reject) => {
    const metadata = <xml2js.ElementCompact>xml2js.xml2js(xml, {
      compact: true,
      trim: true,
      alwaysArray: true,
      attributesKey: "$",
    });

    const version = metadata["edmx:Edmx"][0]["$"].Version;

    const [dataServices] = metadata["edmx:Edmx"][0]["edmx:DataServices"];

    const schemas = dataServices["Schema"] as Array<any>;

    const entityContainerSchema = schemas.find(
      (schema) => schema["EntityContainer"]
    );

    if (!entityContainerSchema) {
      reject(new Error("Cannot find EntityContainer element."));
    }

    const [entityContainer] = entityContainerSchema["EntityContainer"];

    const defaultNamespace = entityContainerSchema["$"]["Namespace"];

    const actions = parseActions(entityContainerSchema["Action"]);
    const functions = parseFunctions(entityContainerSchema["Function"]);
    const annotations = parseAnnotations(entityContainerSchema["Annotations"]);

    const entitySets: Array<EntitySet> = [];
    const allEntityTypes: Array<any> = [];
    const allComplexTypes: Array<any> = [];
    const allEnumTypes: Array<EnumType> = [];

    schemas.forEach((schema) => {
      if (schema["EntityType"]) {
        const namespace = schema["$"]["Namespace"];
        const schemaEntityTypes = schema["EntityType"];
        allEntityTypes.push(...schemaEntityTypes);
        entitySets.push(
          ...parseEntitySets(
            namespace,
            entityContainer,
            schemaEntityTypes,
            annotations
          )
        );
      }

      if (schema["ComplexType"]) {
        const schemaComplexTypes = schema["ComplexType"];
        allComplexTypes.push(...schemaComplexTypes);
      }

      if (schema["EnumType"]) {
        const schemaEnumTypes = schema["EnumType"];
        allEnumTypes.push(...schemaEnumTypes);
      }
    });

    const complexTypes = parseComplexTypes(
      entityContainerSchema["ComplexType"],
      schemas
    );

    const singletons = parseSingletons(
      entityContainer["Singleton"],
      entitySets
    );

    const entityTypes = parseEntityTypes(allEntityTypes, schemas);

    const enumTypes = parseEnumTypes(allEnumTypes, schemas);

    resolve({
      entitySets: entitySets,
      version: version,
      complexTypes,
      singletons,
      actions,
      functions,
      defaultNamespace,
      entityTypes,
      enumTypes,
    });
  });
}

export default parse;
