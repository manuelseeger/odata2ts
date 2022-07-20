const edmTypeMap = <Record<string, string>>{
    'Edm.GUID': 'string',
    'Edm.String': 'string',
    'Edm.Boolean': 'boolean',
    'Edm.Int64': 'number',
    'Edm.Date': 'Date',
    'Edm.Decimal': 'number',
    'Edm.Double': 'number',
    'Edm.Int32': 'number',
    'Edm.Single': 'number',
    'Edm.Int16': 'number',
    'Edm.TimeOfDay': 'Date',
    'Edm.DateTimeOffset': 'Date',
    'Edm.Time': 'Date',
    'Edm.Guid': 'string'
}

export {
    edmTypeMap
}