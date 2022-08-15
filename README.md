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

## C4C vocabulary extensions

This was originally built for SAP C4C which provides an OData vocabulary for value lists ('code lists') for properties. 

Enable parsing of code lists with the ```--c4c``` option. The code lists are expected in JSON format in a subdirectory named codelists from the metadata file.

## Acknowledgment

The  [parser](src/lib/parser/) for OData metadata to JS was taken over from [elasticio/odata2openapi](https://github.com/elasticio/odata2openapi).

Only minor details of the parser have been adapted. 
