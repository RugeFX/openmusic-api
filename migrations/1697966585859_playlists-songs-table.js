exports.up = pgm => {
  pgm.createTable('playlist_songs', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true
    },
    playlist_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: '"playlists"',
      onDelete: 'cascade'
    },
    song_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: '"songs"',
      onDelete: 'cascade'
    }
  })

  pgm.createIndex('playlist_songs', 'playlist_id')
  pgm.createIndex('playlist_songs', 'song_id')
}

exports.down = pgm => {
  pgm.dropTable('playlist_songs')
}
