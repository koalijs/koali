const { Model, mixin } = require('objection')
const { DBErrors } = require('objection-db-errors')
const { plural } = require('pluralize')
const noCase = require('no-case')
const { memoize } = require('./util')

const { fetchTableMetadata } = require('./model-table-metadata')

const snakeCaseTableName = memoize(str => plural(noCase(str, null, '_')))

module.exports = mixin(Model, [DBErrors, mixinModel])

module.exports.mixin = mixinModel

function mixinModel(Model) {
  class KoaliQueryBuilder extends Model.QueryBuilder {
    /**
     * Implement upsert
     * https://github.com/Vincit/objection.js/issues/101#issuecomment-341506839
     *
     */
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
     * Override fetch tableMetadata for add columnInfo
     *
     */
    static fetchTableMetadata(opt) {
      return fetchTableMetadata(this, opt)
    }

    /**
     * Set error dataPath
     */
    static createValidationError(...args) {
      const err = super.createValidationError(...args)
      err.dataPath = this.name
      return err
    }

    /**
     * Config for set `created_at`, `updated_at` timestamp
     *
     * Default `false` to do nothing.
     *
     * @return {Object|Boolean}
     *
     */
    static get timestamps() {
      return false
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

  KoaliModel.QueryBuilder = KoaliQueryBuilder

  return KoaliModel
}

function parseTimestampConfig(conf) {
  if (!conf) return { create: false, update: false }
  if (conf === true) return { create: 'created_at', update: 'updated_at' }
  return conf
}
