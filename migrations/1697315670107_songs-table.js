/* eslint-disable camelcase */

exports.shorthands = undefined

exports.up = pgm => {
  pgm.createTable('songs', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true
    },
    title: {
      type: 'VARCHAR(50)',
      notNull: true
    },
    year: {
      type: 'SMALLINT',
      notNull: true
    },
    genre: {
      type: 'VARCHAR(25)',
      notNull: true
    },
    performer: {
      type: 'TEXT',
      notNull: true
    },
    duration: {
      type: 'SMALLINT',
      notNull: false
    },
    album_id: {
      type: 'VARCHAR(50)',
      notNull: false,
      references: '"albums"',
      onDelete: 'cascade'
    }
  })

  pgm.createIndex('songs', 'album_id')
}

exports.down = pgm => {
  pgm.dropTable('songs')
}
