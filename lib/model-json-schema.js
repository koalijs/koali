const extend = require('extend2')

const columnTypes = {
  // Numeric
  tinyint: 'integer',
  smallint: 'integer',
  mediumint: 'integer',
  int: 'integer',
  bigint: 'integer',
  bit: 'integer',
  serial: 'integer',
  decimal: 'number',
  float: 'number',
  double: 'number',
  real: 'number',

  integer: 'integer',
  biginteger: 'integer',

  boolean: 'boolean',
  bool: 'boolean',

  // String
  char: 'string',
  varchar: 'string',
  tinytext: 'string',
  tinyText: 'string',
  text: 'string',
  mediumtext: 'string',
  mediumText: 'string',
  longtext: 'string',
  longText: 'string',
  string: 'string'
}

function jsonSchemaFromMetadata(model, metadata, jsonSchema, { ignore = [] } = {}) {
  if (!metadata || !metadata.columnInfo) return jsonSchema

  const columnInfo = metadata.columnInfo

  let required = []
  let properties = {}

  let idColumn = model.idColumn
  ignore = ignore.concat(Array.isArray(idColumn) ? idColumn : [idColumn])

  Object.keys(columnInfo).forEach(key => {
    // TODO: test name map Model.propertyNameToColumnName(prop)
    //Ignore id column
    if (ignore.indexOf(key) != -1) return
    let info = columnInfo[key]
    if (!info.nullable && info.defaultValue === null) {
      required.push(key)
    }

    let type = columnTypes[info.type]
    properties[key] = {}
    if (type) properties[key].type = type
  })

  let schema = {
    type: 'object'
  }
  if (required.length) {
    schema.required = required
  }
  schema.properties = properties

  if (jsonSchema) {
    extend(true, schema, jsonSchema)
  }
  return schema
}

module.exports = { jsonSchemaFromMetadata }
