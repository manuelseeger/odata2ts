# Typescript generator for OData Metadata

Primitive generator for Typescript types from OData Metadata.

## Usage

Parse individual file

```
> odata2ts Northwind.xml
```

Parse all file with extension .edmx in directory ./metadata

```
> odata2ts --sourceDir metadata --metaDataExtension edmx
```

Take options from config file

```
> odata2ts --config odata2ts.config.json
```

Or, in code:

```js
const odata2ts = new OData2Ts();
const types = await odata2ts.fileToTypes("./example/Northwind$metadata.xml");
```

## Features

Parses entities and properties from OData metadata into Typescript types.

Does not parse actions, functions, navigational properties, annotations, or any OData feature other than entities and properties.

## SAP C4C vocabulary extensions

This was originally built for SAP C4C which provides an OData vocabulary for value lists ('code lists') for properties.

Enable parsing of code lists with the `--c4c` option. The code lists are expected in JSON format as returned from the C4C API in a subdirectory named `<servicename>.codelists` from the metadata file.

## Acknowledgment

The [parser](src/lib/parser/) for OData metadata to JS was taken over from [elasticio/odata2openapi](https://github.com/elasticio/odata2openapi).

Handling of SAP C4C vocabulary has been added to the parser. All the heavy lifting has been done by the original authors.
