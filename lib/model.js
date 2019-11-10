const { Model, mixin } = require('objection')
const { DBErrors } = require('objection-db-errors')
const { plural } = require('pluralize')
const decamelize = require('decamelize')
const { memoize } = require('./util')

const snakeCaseSchemaName = memoize(str => decamelize(str, ' '))
const snakeCaseTableName = memoize(str => plural(decamelize(str, '_')))

module.exports = mixin(Model, [DBErrors, mixinModel])

module.exports.mixin = mixinModel

function mixinModel(Model) {
  class KoaliValidationError extends Model.ValidationError {
    constructor(conf, jsonSchemaName) {
      super(conf)
      this.schemaName = jsonSchemaName
    }
  }

  class UpsertQueryBuilder extends Model.QueryBuilder {
    upsert(data) {
      let mainQuery
      return this.runBefore((result, builder) => {
        if (!builder.context().isMainQuery) {
          // At this point the builder should only contain a bunch of `where*`
          // operations. Store the `where` query for later use in the `runAfter`
          // method. Also mark the query with `isMainQuery: true` so we can
          // skip all this when this function is called for the `mainQuery`.
          mainQuery = builder.clone().context({ isMainQuery: true })
          // Call the `update` method on the original query turning it into an
          // update operation.
          builder.patch(data)
        }
        return result
      }).runAfter((result, builder) => {
        if (!builder.context().isMainQuery) {
          if (result === 0) {
            return mainQuery.insert(data)
          } else {
            // Now we can use the `where` query we saved in the `runBefore`
            // method to fetch the inserted results. It is noteworthy that this
            // query will return the wrong results if the update changed any
            // of the columns the where operates with. This also returns all
            // updated models.
            return result
          }
        }
        return result
      })
    }

    upsertAndFetch(data) {
      let mainQuery
      return this.runBefore((result, builder) => {
        if (!builder.context().isMainQuery) {
          // At this point the builder should only contain a bunch of `where*`
          // operations. Store the `where` query for later use in the `runAfter`
          // method. Also mark the query with `isMainQuery: true` so we can
          // skip all this when this function is called for the `mainQuery`.
          mainQuery = builder.clone().context({ isMainQuery: true })
          // Call the `patch` method on the original query turning it into an
          // patch operation.
          builder.patch(data)
        }
        return result
      }).runAfter((result, builder) => {
        if (!builder.context().isMainQuery) {
          if (result === 0) {
            return mainQuery.insertAndFetch(data)
          } else {
            // Now we can use the `where` query we saved in the `runBefore`
            // method to fetch the inserted results. It is noteworthy that this
            // query will return the wrong results if the update changed any
            // of the columns the where operates with. This also returns all
            // updated models.
            return mainQuery.first()
          }
        }
        return result
      })
    }
  }

  class KoaliModel extends Model {
    static get QueryBuilder() {
      return UpsertQueryBuilder
    }

    /**
     * Auto set tableName for class name
     *
     * @example
     * // User => users
     * // BaseUser => base_users
     */

    static get tableName() {
      return snakeCaseTableName(this.name)
    }

    /**
     * Auto set json schema name from class name
     *
     * @example
     * // User => user
     * // BaseUser => base user
     *
     */
    static get jsonSchemaName() {
      return snakeCaseSchemaName(this.name)
    }

    static createValidationError(props) {
      return new this.ValidationError(props, this.jsonSchemaName)
    }

    /**
     * Timestamps config
     *
     */
    static get timestamps() {
      return { create: 'created_at', update: 'updated_at' }
    }

    $beforeInsert(...args) {
      return Promise.resolve(super.$beforeInsert(...args)).then(() => {
        const conf = parseTimestampConfig(this.constructor.timestamps)
        if (conf.create) {
          this[conf.create] = new Date()
        }
        if (conf.update) {
          this[conf.update] = new Date()
        }
      })
    }

    $beforeUpdate(...args) {
      return Promise.resolve(super.$beforeInsert(...args)).then(() => {
        const conf = parseTimestampConfig(this.constructor.timestamps)
        if (conf.update) {
          this[conf.update] = new Date()
        }
      })
    }
  }
  KoaliModel.ValidationError = KoaliValidationError
  return KoaliModel
}

function parseTimestampConfig(conf) {
  if (!conf) return { create: false, update: false }
  return conf
}
