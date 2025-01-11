const { Pool } = require('pg')
const { nanoid } = require('nanoid')
const autoBind = require('auto-bind')
const { InvariantError, NotFoundError } = require('../../exceptions')
const { mapDBSongToModel } = require('../../utils')

/**
 * @typedef {Object} Song
 * @property {string} id
 * @property {string} title
 * @property {number} year
 * @property {string} performer
 * @property {string} genre
 * @property {number} duration
 * @property {import('./AlbumsService').Album["id"]} albumId
 */

class SongsService {
  constructor () {
    /**
     * @type {Pool}
     * @private
     */
    this._pool = new Pool()

    autoBind(this)
  }

  /**
   * @param {Omit<Song, "id">} data
   * @returns {Promise<Song["id"]>}
   */
  async addSong ({ title, year, genre, performer, duration, albumId }) {
    const id = `song-${nanoid(16)}`

    const query = {
      text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      values: [id, title, year, genre, performer, duration, albumId]
    }

    const result = await this._pool.query(query)

    if (!result.rows[0].id) {
      throw new InvariantError('Lagu gagal ditambahkan')
    }

    return result.rows[0].id
  }

  /**
   * @param {Object} params
   * @param {Song["title"]} [params.title]
   * @param {Song["performer"]} [params.performer]
   * @param {import('./AlbumsService').Album["id"]} [params.albumId]
  */
  async getSongs ({ title, performer, albumId }) {
    const conditions = []
    const values = []

    if (title) {
      conditions.push(`LOWER(title) LIKE $${values.length + 1}`)
      values.push(`%${title}%`)
    }

    if (performer) {
      conditions.push(`LOWER(performer) LIKE $${values.length + 1}`)
      values.push(`%${performer}%`)
    }

    if (albumId) {
      conditions.push(`album_id = $${values.length + 1}`)
      values.push(albumId)
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

    const result = await this._pool.query(`SELECT * FROM songs ${whereClause}`, values)
    return result.rows.map(mapDBSongToModel)
  }

  /**
   * @param {Song["id"]} id
   */
  async getSongById (id) {
    const query = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [id]
    }
    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new NotFoundError('Lagu tidak ditemukan')
    }

    return result.rows.map(mapDBSongToModel)[0]
  }

  /**
   * @param {Song["id"]} id
   * @param {Omit<Song, "id">} payload
   */
  async editSongById (id, { title, year, genre, performer, duration, albumId }) {
    const query = {
      text: 'UPDATE songs SET title = $1, year = $2, genre = $3, performer = $4, duration = $5, album_id = $6 WHERE id = $7 RETURNING id',
      values: [title, year, genre, performer, duration, albumId, id]
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new NotFoundError('Gagal memperbarui lagu. Id tidak ditemukan')
    }
  }

  /**
   * @param {Song["id"]} id
   */
  async deleteSongById (id) {
    const query = {
      text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
      values: [id]
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new NotFoundError('Lagu gagal dihapus. Id tidak ditemukan')
    }
  }

  /**
   * @param {Song["id"]} id
   */
  async verifySongExists (id) {
    const query = {
      text: 'SELECT id FROM songs WHERE id = $1',
      values: [id]
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new NotFoundError('Lagu tidak ditemukan')
    }
  }
}

module.exports = SongsService
