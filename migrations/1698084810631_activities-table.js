const { PgLiteral } = require('node-pg-migrate')

exports.up = (pgm) => {
  pgm.createTable('playlist_activities', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true
    },
    username: {
      type: 'VARCHAR(50)',
      notNull: true
    },
    title: {
      type: 'TEXT',
      notNull: true
    },
    action: {
      type: 'VARCHAR(10)',
      notNull: true
    },
    playlist_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: '"playlists"',
      onDelete: 'cascade'
    },
    time: {
      type: 'timestamp',
      notNull: true,
      default: new PgLiteral('current_timestamp')
    }
  })

  pgm.createIndex('playlist_activities', 'playlist_id')
}

exports.down = (pgm) => {
  pgm.dropTable('playlist_activities')
}
