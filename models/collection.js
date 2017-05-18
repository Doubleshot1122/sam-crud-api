const db = require('../db')

class Collection {
  constructor () {}

  static get (id) {
    return id ? db('collections').where({ id }).first() : db('collections')
  }

  static populate (id) {
    if (id) {
      // return db('artworks')
      //   .select('*', 'artworks.name AS artwork_name')
      //   .innerJoin('artworks_collections', 'artworks.id', 'artworks_collections.artwork_id')
      //   .innerJoin('collections', 'collections.id', 'artworks_collections.collection_id')
      //   .where('collections.id', id)

      // return db('artworks_collections').where({ collection_id: id })
      // .then(rows => {
      //   const artworkIds = rows.map(row => row.artwork_id)
      //
      //   const artworkQuery = db('artworks').whereIn('id', artworkIds)
      //   const collectionQuery = db('collections').where({ id })
      //
      //   return Promise.all([ artworkQuery, collectionQuery ])
      // })

      return Promise.all([
        db('artworks_collections').where({ collection_id: id }),
        db('collections').where({ id }).first()
      ]).then(([artworksAndCollections, collection]) => {
        const ids = artworksAndCollections.map(row => row.artwork_id)
        return db('artworks').whereIn('id', ids).then(artworks => {
          collection.artworks = artworks
          return collection
        })
      })
    } else {
      // return db('artworks')
      //   .select('*', 'artworks.name AS artwork_name')
      //   .innerJoin('artworks_collections', 'artworks.id', 'artworks_collections.artwork_id')
      //   .innerJoin('collections', 'collections.id', 'artworks_collections.collection_id')

      // return db('artworks_collections')
      // .then(rows => {
      //   const artworkIds = rows.map(row => row.artwork_id)
      //   const collectionIds = rows.map(row => row.collection_id)
      //
      //   const artworkQuery = db('artworks').whereIn('id', artworkIds)
      //   const collectionQuery = db('collections').whereIn('id', collectionIds)
      //
      //   return Promise.all([ artworkQuery, collectionQuery ])
      // })

      return db('artworks_collections').then(rows => {
        const collectionIds = rows.map(row => row.collection_id)
        return db('collections').whereIn('id', collectionIds)
          .then(collections => {
            const promises = collections.map(collection => {
              const matches = rows.filter(row => {
                return row.collection_id === collection.id
              })

              const artworkIds = matches.map(match => match.artwork_id)

              return db('artworks').whereIn('id', artworkIds)
                .then(artworks => {
                  collection.artworks = artworks
                  return collection
                })
            })

            return Promise.all(promises)
          })
      })
    }
  }

  static delete (id) {
    return db('collections').where({ id }).del().returning('*')
  }

  static create ({ name }) {
    const collection = { name }
    return db('collections').insert(collection).returning('*')
  }

  static update (id, { name }) {
    const collection = { name }
    for (var key in collection) {
      if (collection[key] === undefined) delete collection[key]
    }

    return db('collections').update(collection).where({ id }).returning('*')
  }
}

module.exports = Collection
