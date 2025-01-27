const { Pool } = require('pg')
const { nanoid } = require('nanoid')
const autoBind = require('auto-bind')
const { InvariantError, NotFoundError } = require('../../exceptions')
const { mapDBAlbumToModel } = require('../../utils')

/**
 * @typedef {Object} Album
 * @property {string} id
 * @property {string} name
 * @property {number} year
 * @property {string} coverUrl
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

    return albumResult.rows.map(mapDBAlbumToModel)[0]
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
      throw new NotFoundError(
        'Gagal memperbarui album. Id tidak ditemukan'
      )
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

  /**
     * @param {Album["id"]} id
     * @param {string} coverUrl
     */
  async editAlbumCoverById (id, coverUrl) {
    const query = {
      text: 'UPDATE albums SET cover_url = $1 WHERE id = $2 RETURNING id',
      values: [coverUrl, id]
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new NotFoundError(
        'Gagal memperbarui cover album. Id tidak ditemukan'
      )
    }
  }

  /**
     * @param {Album["id"]} id
     * @returns {Promise<{likes: number}>}
     */
  async getAlbumLikesById (id) {
    const likesQuery = {
      text: 'SELECT COUNT(1) AS likes FROM user_album_likes WHERE album_id = $1',
      values: [id]
    }

    const likesResult = await this._pool.query(likesQuery)

    if (!likesResult.rowCount) {
      throw new NotFoundError('Album tidak ditemukan')
    }

    return likesResult.rows[0]
  }

  /**
     * @param {import('./UsersService').User["id"]} userId
     * @param {Album["id"]} albumId
     */
  async likeAlbumById (userId, albumId) {
    const id = `like-${nanoid(16)}`

    const query = {
      text: 'INSERT INTO user_album_likes VALUES ($1, $2, $3) RETURNING id',
      values: [id, userId, albumId]
    }

    const result = await this._pool.query(query)

    if (!result.rows[0].id) {
      throw new InvariantError('Like gagal ditambahkan')
    }

    return result.rows[0]
  }

  /**
     * @param {import('./UsersService').User["id"]} userId
     * @param {Album["id"]} albumId
     */
  async unlikeAlbumById (userId, albumId) {
    const query = {
      text: 'DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2 RETURNING id',
      values: [userId, albumId]
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new NotFoundError('Like gagal dihapus. Id tidak ditemukan')
    }

    return result.rows[0]
  }

  /**
     * @param {import('./UsersService').User["id"]} userId
     * @param {Album["id"]} albumId
     */
  async verifyUserHasntLikedAlbum (userId, albumId) {
    const query = {
      text: 'SELECT id FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
      values: [userId, albumId]
    }

    const result = await this._pool.query(query)

    if (result.rowCount) {
      throw new InvariantError(
        'User telah memberikan like pada album ini'
      )
    }
  }
}

module.exports = AlbumsService
