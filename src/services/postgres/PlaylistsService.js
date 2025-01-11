const { Pool } = require('pg')
const { nanoid } = require('nanoid')
const autoBind = require('auto-bind')
const { InvariantError, NotFoundError, AuthorizationError } = require('../../exceptions')

/** 
 * @import CollaborationsService from "./CollaborationsService" 
 * @import { User } from "./UsersService"
 * @import { Song } from "./SongsService"
 */

/**
 * @typedef {Object} Playlist
 * @property {string} id
 * @property {string} name
 * @property {string} owner
 */

/**
 * @typedef {Object} PlaylistSongActivity
 * @property {string} id
 * @property {string} action
 * @property {string} time
 * @property {User["id"]} userId
 * @property {Song["id"]} songId
 * @property {Playlist["id"]} playlistId
 */

class PlaylistsService {
  /** @param {CollaborationsService} collaborationsService */
  constructor(collaborationsService) {
    /**
     * @type {Pool}
     * @private
     */
    this._pool = new Pool()

    /**
     * @type {CollaborationsService}
     * @private
     */
    this._collaborationsService = collaborationsService

    autoBind(this)
  }

  /**
   * @param {Pick<Playlist, "name" | "owner">} payload
   * @returns {Promise<Playlist["id"]>}
   */
  async addPlaylist({ name, owner }) {
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

  /**
   * @param {Playlist["owner"]} owner
   * @returns {Promise<Array<Playlist & { username: string }>>}
   */
  async getPlaylists(owner) {
    const query = {
      text: `SELECT playlists.*, users.username FROM playlists
                    LEFT JOIN collaborations ON collaborations.playlist_id = playlists.id
                    LEFT JOIN users ON playlists.owner = users.id
                    WHERE playlists.owner = $1 OR collaborations.user_id = $1
                    GROUP BY playlists.id, users.username`,
      values: [owner]
    }
    const result = await this._pool.query(query)

    return result.rows
  }

  /**
   * @param {Playlist["id"]} id
   * @returns {Promise<Playlist & { username: string }>}
   */
  async getPlaylistById(id) {
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

    return result.rows[0]
  }

  /**
   * @param {Playlist["id"]} id
   * @returns {Promise<Song[]>}
   */
  async getPlaylistSongsById(id) {
    const query = {
      text: 'SELECT s.* FROM songs s LEFT JOIN playlist_songs ps ON s.id = ps.song_id WHERE ps.playlist_id = $1',
      values: [id]
    }
    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new NotFoundError('Lagu tidak ditemukan')
    }

    return result.rows
  }

  /**
   * @param {Playlist["id"]} id
   */
  async deletePlaylistById(id) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [id]
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new NotFoundError('Playlist gagal dihapus. Id tidak ditemukan')
    }
  }

  /**
   * @param {Object} payload
   * @param {Playlist["id"]} payload.playlistId
   * @param {Song["id"]} payload.songId
   */
  async addSongToPlaylist({ playlistId, songId }) {
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

  /**
   * @param {Object} payload
   * @param {Playlist["id"]} payload.playlistId
   * @param {Song["id"]} payload.songId
   */
  async deletePlaylistSongById({ playlistId, songId }) {
    const query = {
      text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2',
      values: [playlistId, songId]
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new NotFoundError('Lagu / Playlist tidak ditemukan')
    }
  }

  /**
   * @param {Object} payload
   * @param {Playlist["id"]} payload.playlistId
   * @param {Song["id"]} payload.songId
   * @param {User["id"]} payload.userId
   * @param {string} payload.action
   */
  async addPlaylistActivity({ action, userId, songId, playlistId }) {
    const id = `playlist-act-${nanoid(16)}`

    const query = {
      text: 'INSERT INTO playlist_activities VALUES($1, $2, $3, $4, $5) RETURNING id',
      values: [id, action, userId, songId, playlistId]
    }

    const result = await this._pool.query(query)

    if (!result.rows[0].id) {
      throw new InvariantError('Activity gagal ditambahkan')
    }

    return result.rows[0].id
  }
  /**
   * @param {Playlist["id"]} playlistId
   * @returns {Promise<Array<PlaylistSongActivity & { username: User["username"], title: Song["title"] }>>}
   */
  async getPlaylistActivities(playlistId) {
    const query = {
      text: `SELECT playlist_activities.*, users.username, songs.title FROM playlist_activities
                    LEFT JOIN users ON users.id = playlist_activities.user_id
                    LEFT JOIN songs ON songs.id = playlist_activities.song_id
                    WHERE playlist_activities.playlist_id = $1
                    ORDER BY playlist_activities.time ASC`,
      values: [playlistId]
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new NotFoundError('Playlist activities tidak ditemukan')
    }

    return result.rows
  }

  /**
   * @param {Playlist["id"]} playlistId 
   */
  async verifyPlaylistExists(playlistId) {
    const query = {
      text: 'SELECT id FROM playlists WHERE id = $1',
      values: [playlistId]
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan')
    }
  }

  /**
   * @param {Playlist["id"]} playlistId
   * @param {User["id"]} userId
   */
  async verifyPlaylistOwner(playlistId, userId) {
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

  /**
   * @param {Playlist["id"]} playlistId
   * @param {User["id"]} userId
   */
  async verifyPlaylistAccess(playlistId, userId) {
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
