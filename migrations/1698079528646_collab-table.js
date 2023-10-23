exports.up = (pgm) => {
  pgm.createTable('collaborations', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true
    },
    playlist_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      unique: true,
      references: '"playlists"',
      onDelete: 'cascade'
    },
    user_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      unique: true,
      references: '"users"',
      onDelete: 'cascade'
    }
  })

  pgm.createIndex('collaborations', 'playlist_id')
  pgm.createIndex('collaborations', 'user_id')
}

exports.down = (pgm) => {
  pgm.dropTable('collaborations')
}
