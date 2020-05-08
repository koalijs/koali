const extend = require('extend2')

const columnTypes = {
  // Numeric
  tinyint: { type: 'integer' },
  smallint: { type: 'integer' },
  mediumint: { type: 'integer' },
  int: { type: 'integer' },
  bigint: { type: 'integer' },

  serial: { type: 'integer' },
  smallserial: { type: 'integer' },
  bigserial: { type: 'integer' },

  integer: { type: 'integer' },
  biginteger: { type: 'integer' },

  decimal: { type: 'number' },
  float: { type: 'number' },
  double: { type: 'number' },
  real: { type: 'number' },
  'double precision': { type: 'number' },

  boolean: { type: ['integer', 'boolean'], maximum: 1, minimum: 0 },
  bool: { type: ['integer', 'boolean'], maximum: 1, minimum: 0 },

  // String
  char: { type: 'string' },
  varchar: { type: 'string' },
  tinytext: { type: 'string' },
  text: { type: 'string' },
  mediumtext: { type: 'string' },
  mediumText: { type: 'string' },
  longtext: { type: 'string' },
  string: { type: 'string' },
  character: { type: 'string' },
  'character varying': { type: 'string' },

  // Date / Time
  // TODO: string format 'date'
  date: null,
  datetime: null,
  timestamp: null,
  time: null,
  year: null
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

    let def = columnTypes[info.type.toLowerCase()]
    let prop = (properties[key] = {})
    if (def) extend(true, prop, def)
    //Add null type
    if (info.nullable && prop.type) {
      prop.type = Array.isArray(prop.type) ? prop.type.slice(0) : [prop.type]
      prop.type.push('null')
    }
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
