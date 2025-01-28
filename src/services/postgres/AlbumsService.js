const { Pool } = require('pg')
const { nanoid } = require('nanoid')
const autoBind = require('auto-bind')
const { InvariantError, NotFoundError } = require('../../exceptions')
const { mapDBAlbumToModel } = require('../../utils')

/**
 * @import CacheService from '../redis/CacheService'
 */

/**
 * @typedef {Object} Album
 * @property {string} id
 * @property {string} name
 * @property {number} year
 * @property {string} coverUrl
 */

class AlbumsService {
  /**
   * @param {CacheService} cacheService
   */
  constructor (cacheService) {
    /**
     * @type {Pool}
     * @private
     */
    this._pool = new Pool()
    /**
     * @type {CacheService}
     * @private
     */
    this._cacheService = cacheService

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

    const { rows } = await this._pool.query(query)

    if (!rows[0].id) {
      throw new InvariantError('Album gagal ditambahkan')
    }

    return rows[0].id
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

    const { rowCount, rows } = await this._pool.query(albumQuery)

    if (!rowCount) {
      throw new NotFoundError('Album tidak ditemukan')
    }

    return rows.map(mapDBAlbumToModel)[0]
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

    const { rowCount } = await this._pool.query(query)

    if (!rowCount) {
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

    const { rowCount } = await this._pool.query(query)

    if (!rowCount) {
      throw new NotFoundError('Album gagal dihapus. Id tidak ditemukan')
    }

    await this._cacheService.delete(`likes:${id}`)
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

    const { rowCount } = await this._pool.query(query)

    if (!rowCount) {
      throw new NotFoundError(
        'Gagal memperbarui cover album. Id tidak ditemukan'
      )
    }
  }

  /**
     * @param {Album["id"]} id
     * @returns {Promise<{via: "database" | "cache", likes: number}>}
     */
  async getAlbumLikesById (id) {
    try {
      const result = await this._cacheService.get(`likes:${id}`)

      return { via: 'cache', likes: parseInt(result) }
    } catch (e) {
      const query = {
        text: 'SELECT COUNT(1) FROM user_album_likes WHERE album_id = $1',
        values: [id]
      }

      const { rowCount, rows } = await this._pool.query(query)

      if (!rowCount) {
        throw new NotFoundError('Album tidak ditemukan')
      }

      const likes = parseInt(rows[0].count)
      await this._cacheService.set(`likes:${id}`, `${likes}`, 1800)

      return { via: 'database', likes }
    }
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

    const { rows } = await this._pool.query(query)

    if (!rows[0].id) {
      throw new InvariantError('Like gagal ditambahkan')
    }

    await this._cacheService.delete(`likes:${albumId}`)

    return rows[0]
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

    const { rowCount, rows } = await this._pool.query(query)

    if (!rowCount) {
      throw new NotFoundError('Like gagal dihapus. Id tidak ditemukan')
    }

    await this._cacheService.delete(`likes:${albumId}`)

    return rows[0]
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

    const { rowCount } = await this._pool.query(query)

    if (rowCount) {
      throw new InvariantError(
        'User telah memberikan like pada album ini'
      )
    }
  }
}

module.exports = AlbumsService
