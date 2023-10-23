const { Pool } = require('pg')
const { nanoid } = require('nanoid')
const { InvariantError, NotFoundError } = require('../../exceptions')
const autoBind = require('auto-bind')
const {
  mapDBPlaylistToResponse,
  mapDBPlaylistSongsToResponse,
  mapDBActivitiesToResponse
} = require('../../utils')
const { AuthorizationError } = require('../../exceptions')

class PlaylistsService {
  constructor (collaborationsService) {
    this._pool = new Pool()
    this._collaborationsService = collaborationsService

    autoBind(this)
  }

  async addPlaylist ({ name, owner }) {
    const id = `playlist-${nanoid(16)}`

    const query = {
      text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
      values: [id, name, owner]
    }

    const result = await this._pool.query(query)

    if (!result.rows[0].id) {
      throw new InvariantError('Playlist gagal ditambahkan')
    }

    return result.rows[0].id
  }

  async getPlaylists (owner) {
    const query = {
      text: `SELECT playlists.*, users.username FROM playlists
                    LEFT JOIN collaborations ON collaborations.playlist_id = playlists.id
                    LEFT JOIN users ON playlists.owner = users.id
                    WHERE playlists.owner = $1 OR collaborations.user_id = $1
                    GROUP BY playlists.id, users.username`,
      values: [owner]
    }
    const result = await this._pool.query(query)

    return result.rows.map(mapDBPlaylistToResponse)
  }

  async getPlaylistById (id) {
    const query = {
      text: `SELECT playlists.*, users.username
                    FROM playlists
                    LEFT JOIN users ON users.id = playlists.owner
                    WHERE playlists.id = $1`,
      values: [id]
    }
    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan')
    }

    return result.rows.map(mapDBPlaylistToResponse)[0]
  }

  async getPlaylistSongsById (id) {
    const query = {
      text: 'SELECT s.* FROM songs s LEFT JOIN playlist_songs ps ON s.id = ps.song_id WHERE ps.playlist_id = $1',
      values: [id]
    }
    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new NotFoundError('Lagu tidak ditemukan')
    }

    return result.rows.map(mapDBPlaylistSongsToResponse)
  }

  async deletePlaylistById (id) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [id]
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new NotFoundError('Playlist gagal dihapus. Id tidak ditemukan')
    }
  }

  async addSongToPlaylist ({ playlistId, songId }) {
    const id = `playlist-song-${nanoid(16)}`

    const query = {
      text: 'INSERT INTO playlist_songs VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId]
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new InvariantError('Lagu gagal ditambah ke Playlist')
    }
  }

  async deletePlaylistSongById ({ playlistId, songId }) {
    const query = {
      text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2',
      values: [playlistId, songId]
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new NotFoundError('Lagu / Playlist tidak ditemukan')
    }
  }

  async addPlaylistActivity ({ username, title, action, playlistId }) {
    const id = `playlist-act-${nanoid(16)}`

    const query = {
      text: 'INSERT INTO playlist_activities VALUES($1, $2, $3, $4, $5) RETURNING id',
      values: [id, username, title, action, playlistId]
    }

    const result = await this._pool.query(query)

    if (!result.rows[0].id) {
      throw new InvariantError('Activity gagal ditambahkan')
    }

    return result.rows[0].id
  }

  async getPlaylistActivities (playlistId) {
    const query = {
      text: 'SELECT * FROM playlist_activities WHERE playlist_id = $1',
      values: [playlistId]
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new NotFoundError('Playlist activities tidak ditemukan')
    }

    return result.rows.map(mapDBActivitiesToResponse)
  }

  async verifyPlaylistExists (playlistId) {
    const query = {
      text: 'SELECT id FROM playlists WHERE id = $1',
      values: [playlistId]
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan')
    }
  }

  async verifyPlaylistOwner (playlistId, userId) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [playlistId]
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan')
    }

    if (result.rows[0].owner !== userId) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini')
    }
  }

  async verifyPlaylistAccess (playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId)
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error
      }
      try {
        await this._collaborationsService.verifyCollaborator(playlistId, userId)
      } catch {
        throw error
      }
    }
  }
}

module.exports = PlaylistsService
