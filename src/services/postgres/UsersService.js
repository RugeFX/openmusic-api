const { Pool } = require('pg')
const { AuthenticationError, NotFoundError, InvariantError } = require('../../exceptions')
const { nanoid } = require('nanoid')
const { hash, compare } = require('bcrypt')
const autoBind = require('auto-bind')

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} username
 * @property {string} fullname
 * @property {string} password
 */

class UsersService {
  constructor () {
    /**
     * @type {Pool}
     * @private
     */
    this._pool = new Pool()

    autoBind(this)
  }

  /**
   * @param {Omit<User, "id">} data
   * @returns {Promise<User["id"]>}
   */
  async addUser (data) {
    await this.verifyNewUsername(data.username)

    const id = `user-${nanoid(16)}`
    const hashedPassword = await hash(data.password, 10)
    const query = {
      text: 'INSERT INTO users VALUES($1, $2, $3, $4) RETURNING id',
      values: [id, data.username, hashedPassword, data.fullname]
    }

    const { rowCount, rows } = await this._pool.query(query)

    if (rowCount === 0) {
      throw new InvariantError('User gagal ditambahkan')
    }
    return rows[0].id
  }

  /**
   * @param {string} userId
   * @returns {Promise<User>}
   */
  async getUserById (userId) {
    const query = {
      text: 'SELECT id, username, fullname FROM users WHERE id = $1',
      values: [userId]
    }

    const { rowCount, rows } = await this._pool.query(query)

    if (rowCount === 0) {
      throw new NotFoundError('User tidak ditemukan')
    }

    return rows[0]
  }

  /**
   * @param {User["username"]} username
   */
  async verifyNewUsername (username) {
    const query = {
      text: 'SELECT username FROM users WHERE username = $1',
      values: [username]
    }

    const { rowCount } = await this._pool.query(query)

    if (rowCount > 0) {
      throw new InvariantError('Gagal menambahkan user. Username sudah digunakan.')
    }
  }

  /**
   * @param {User["username"]} username
   * @param {User["password"]} password
   * @returns {Promise<User["id"]>}
   */
  async verifyUserCredential (username, password) {
    const query = {
      text: 'SELECT id, password FROM users WHERE username = $1',
      values: [username]
    }

    const { rowCount, rows } = await this._pool.query(query)

    if (rowCount === 0) {
      throw new AuthenticationError('Kredensial yang Anda berikan salah')
    }

    const { id, password: hashedPassword } = rows[0]

    const match = await compare(password, hashedPassword)

    if (!match) {
      throw new AuthenticationError('Kredensial yang Anda berikan salah')
    }

    return id
  }

  /**
   * @param {User["username"]} username
   * @returns {Promise<User[]>}
   */
  async getUsersByUsername (username) {
    const query = {
      text: 'SELECT id, username, fullname FROM users WHERE username LIKE $1',
      values: [`%${username}%`]
    }
    const { rows } = await this._pool.query(query)

    return rows
  }
}

module.exports = UsersService
