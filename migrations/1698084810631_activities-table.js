const { PgLiteral } = require('node-pg-migrate')

exports.up = (pgm) => {
  pgm.createTable('playlist_activities', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true
    },
    action: {
      type: 'VARCHAR(10)',
      notNull: true
    },
    user_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: '"users"',
      onDelete: 'cascade'
    },
    song_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: '"songs"',
      onDelete: 'cascade'
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
    },
  })

  pgm.createIndex('playlist_activities', 'user_id')
  pgm.createIndex('playlist_activities', 'song_id')
  pgm.createIndex('playlist_activities', 'playlist_id')
}

exports.down = (pgm) => {
  pgm.dropTable('playlist_activities')
}
