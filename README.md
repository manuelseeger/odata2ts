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

EDMX Metadata:

```xml
<EntityType Name="Order">
    <Key>
        <PropertyRef Name="OrderID" />
    </Key>
    <Property Name="OrderID" Type="Edm.Int32" Nullable="false" p5:StoreGeneratedPattern="Identity" xmlns:p5="http://schemas.microsoft.com/ado/2009/02/edm/annotation" />
    <Property Name="CustomerID" Type="Edm.String" MaxLength="5" />
    <Property Name="EmployeeID" Type="Edm.Int32" />
    <Property Name="OrderDate" Type="Edm.DateTimeOffset" />
    <Property Name="RequiredDate" Type="Edm.DateTimeOffset" />
    <Property Name="ShippedDate" Type="Edm.DateTimeOffset" />
    <Property Name="ShipVia" Type="Edm.Int32" />
    <Property Name="Freight" Type="Edm.Decimal" Precision="19" Scale="4" />
    <Property Name="ShipName" Type="Edm.String" MaxLength="40" />
    <Property Name="ShipAddress" Type="Edm.String" MaxLength="60" />
    <Property Name="ShipCity" Type="Edm.String" MaxLength="15" />
    <Property Name="ShipRegion" Type="Edm.String" MaxLength="15" />
    <Property Name="ShipPostalCode" Type="Edm.String" MaxLength="10" />
    <Property Name="ShipCountry" Type="Edm.String" MaxLength="15" />
    <NavigationProperty Name="Customer" Type="NorthwindModel.Customer" Partner="Orders">
        <ReferentialConstraint Property="CustomerID" ReferencedProperty="CustomerID" />
    </NavigationProperty>
    <NavigationProperty Name="Employee" Type="NorthwindModel.Employee" Partner="Orders">
        <ReferentialConstraint Property="EmployeeID" ReferencedProperty="EmployeeID" />
    </NavigationProperty>
    <NavigationProperty Name="Order_Details" Type="Collection(NorthwindModel.Order_Detail)" Partner="Order" />
    <NavigationProperty Name="Shipper" Type="NorthwindModel.Shipper" Partner="Orders">
        <ReferentialConstraint Property="ShipVia" ReferencedProperty="ShipperID" />
    </NavigationProperty>
</EntityType>
```

Resulting Type:

```ts
export interface Order {
  OrderID: number;

  CustomerID?: string;

  EmployeeID?: number;

  OrderDate?: Date;

  RequiredDate?: Date;

  ShippedDate?: Date;

  ShipVia?: number;

  Freight?: number;

  ShipName?: string;

  ShipAddress?: string;

  ShipCity?: string;

  ShipRegion?: string;

  ShipPostalCode?: string;

  ShipCountry?: string;

  Customer?: unknown;

  Employee?: unknown;

  Order_Details?: unknown;

  Shipper?: unknown;
}
```

### Limitations

Does not parse actions, functions, navigational properties, annotations, or any OData feature other than entities and properties.

## SAP C4C vocabulary extensions

This was originally built for SAP C4C which provides an OData vocabulary for value lists ('code lists') for properties.

Enable parsing of code lists with the `--c4c` option. The code lists are expected in JSON format as returned from the C4C API in a subdirectory named `<servicename>.codelists` from the metadata file.

## Acknowledgment

The [parser](src/lib/parser/) for OData metadata to JS was taken and adapted from [elasticio/odata2openapi](https://github.com/elasticio/odata2openapi).

Handling of SAP C4C vocabulary has been added to the parser. All the heavy lifting has been done by the original authors.
