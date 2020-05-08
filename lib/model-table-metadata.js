const TABLE_METADATA = '$$tableMetadata'

function fetchTableMetadata(
  modelClass,
  { parentBuilder = null, knex = null, force = false, table = null } = {}
) {
  // The table isn't necessarily same as `modelClass.getTableName()` for example if
  // a view is queried instead.
  if (!table) {
    if (parentBuilder) {
      table = parentBuilder.tableNameFor(modelClass.getTableName())
    } else {
      table = modelClass.getTableName()
    }
  }

  // Call tableMetadata first instead of accessing the cache directly beause
  // tableMetadata may have been overriden.
  let metadata = modelClass.tableMetadata({ table })

  if (!force && metadata) {
    return Promise.resolve(metadata)
  }

  // Memoize metadata but only for modelClass. The hasOwnProperty check
  // will fail for subclasses and the value gets recreated.
  if (!Object.prototype.hasOwnProperty.call(modelClass, TABLE_METADATA)) {
    defineNonEnumerableProperty(modelClass, TABLE_METADATA, new Map())
  }

  // The cache needs to be checked in addition to calling tableMetadata
  // because the cache may contain a temporary promise in which case
  // tableMetadata returns null.
  metadata = modelClass[TABLE_METADATA].get(table)

  if (!force && metadata) {
    return Promise.resolve(metadata)
  } else {
    const promise = modelClass
      .query(knex)
      .childQueryOf(parentBuilder)
      .columnInfo({ table })
      .then((columnInfo) => {
        const metadata = {
          columns: Object.keys(columnInfo),
          columnInfo: columnInfo,
        }

        modelClass[TABLE_METADATA].set(table, metadata)
        return metadata
      })

    modelClass[TABLE_METADATA].set(table, promise)
    return promise
  }
}

function defineNonEnumerableProperty(obj, prop, value) {
  Object.defineProperty(obj, prop, {
    enumerable: false,
    writable: true,
    configurable: true,
    value,
  })
}

module.exports = {
  fetchTableMetadata,
}
