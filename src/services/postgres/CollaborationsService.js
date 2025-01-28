const { Pool } = require('pg')
const { nanoid } = require('nanoid')
const InvariantError = require('../../exceptions/InvariantError')

/**
 * @typedef {Object} Collaboration
 * @property {string} id
 * @property {import('./PlaylistsService').Playlist["id"]} playlistId
 * @property {import('./UsersService').User["id"]} userId
 */

class CollaborationsService {
  constructor () {
    /**
     * @type {Pool}
     * @private
     */
    this._pool = new Pool()
  }

  /**
   *
   * @param {import('./PlaylistsService').Playlist["id"]} playlistId
   * @param {import('./UsersService').User["id"]} userId
   * @returns {Promise<Collaboration["id"]>}
   */
  async addCollaboration (playlistId, userId) {
    const id = `collab-${nanoid(16)}`

    const query = {
      text: 'INSERT INTO collaborations VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, userId]
    }

    const { rowCount, rows } = await this._pool.query(query)

    if (!rowCount) {
      throw new InvariantError('Kolaborasi gagal ditambahkan')
    }
    return rows[0].id
  }

  /**
  * @param {import('./PlaylistsService').Playlist["id"]} playlistId
  * @param {import('./UsersService').User["id"]} userId
  */
  async deleteCollaboration (playlistId, userId) {
    const query = {
      text: 'DELETE FROM collaborations WHERE playlist_id = $1 AND user_id = $2 RETURNING id',
      values: [playlistId, userId]
    }

    const { rowCount } = await this._pool.query(query)

    if (!rowCount) {
      throw new InvariantError('Kolaborasi gagal dihapus')
    }
  }

  /**
   *
   * @param {import('./PlaylistsService').Playlist["id"]} playlistId
   * @param {import('./UsersService').User["id"]} userId
   */
  async verifyCollaborator (playlistId, userId) {
    const query = {
      text: 'SELECT * FROM collaborations WHERE playlist_id = $1 AND user_id = $2',
      values: [playlistId, userId]
    }

    const { rowCount } = await this._pool.query(query)

    if (!rowCount) {
      throw new InvariantError('Kolaborasi gagal diverifikasi')
    }
  }
}

module.exports = CollaborationsService
