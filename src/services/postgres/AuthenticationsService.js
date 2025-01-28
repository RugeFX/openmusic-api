const { Pool } = require('pg')
const { InvariantError } = require('../../exceptions')
const autoBind = require('auto-bind')

class AuthenticationsService {
  constructor () {
    /**
     * @type {Pool}
     * @private
     */
    this._pool = new Pool()

    autoBind(this)
  }

  /**
   * @param {string} token
   */
  async addRefreshToken (token) {
    const query = {
      text: 'INSERT INTO authentications VALUES($1)',
      values: [token]
    }

    await this._pool.query(query)
  }

  /**
   * @param {string} token
   */
  async verifyRefreshToken (token) {
    const query = {
      text: 'SELECT token FROM authentications WHERE token = $1',
      values: [token]
    }

    const { rowCount } = await this._pool.query(query)

    if (!rowCount) {
      throw new InvariantError('Refresh token tidak valid')
    }
  }

  /**
   * @param {string} token
   */
  async deleteRefreshToken (token) {
    const query = {
      text: 'DELETE FROM authentications WHERE token = $1',
      values: [token]
    }

    await this._pool.query(query)
  }
}

module.exports = AuthenticationsService
