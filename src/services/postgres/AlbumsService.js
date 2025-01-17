const { Pool } = require('pg')
const { nanoid } = require('nanoid')
const autoBind = require('auto-bind')
const { InvariantError, NotFoundError } = require('../../exceptions')

/**
  * @typedef {Object} Album
  * @property {string} id
  * @property {string} name
  * @property {number} year
  */

class AlbumsService {
  constructor () {
    /**
     * @type {Pool}
     * @private
     */
    this._pool = new Pool()

    autoBind(this)
  }

  /**
   * @param {Pick<Album, "name" | "year">} payload
   * @returns {Promise<Album["id"]>}
   */
  async addAlbum ({ name, year }) {
    const id = `album-${nanoid(16)}`

    const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3) RETURNING id',
      values: [id, name, year]
    }

    const result = await this._pool.query(query)

    if (!result.rows[0].id) {
      throw new InvariantError('Album gagal ditambahkan')
    }

    return result.rows[0].id
  }

  /**
   * @param {Album["id"]} id
   * @returns {Promise<Album>}
   */
  async getAlbumById (id) {
    const albumQuery = {
      text: 'SELECT * FROM albums WHERE id = $1',
      values: [id]
    }

    const albumResult = await this._pool.query(albumQuery)

    if (!albumResult.rowCount) {
      throw new NotFoundError('Album tidak ditemukan')
    }

    return albumResult.rows[0]
  }

  /**
   * @param {Album["id"]} id
   * @param {Pick<Album, "name" | "year">} payload
   */
  async editAlbumById (id, { name, year }) {
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id',
      values: [name, year, id]
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new NotFoundError('Gagal memperbarui album. Id tidak ditemukan')
    }
  }

  /**
   * @param {Album["id"]} id
   */
  async deleteAlbumById (id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id]
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new NotFoundError('Album gagal dihapus. Id tidak ditemukan')
    }
  }
}

module.exports = AlbumsService
