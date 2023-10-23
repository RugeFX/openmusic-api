const { Pool } = require('pg')
const { AuthenticationError, NotFoundError, InvariantError } = require('../../exceptions')
const { nanoid } = require('nanoid')
const { hash, compare } = require('bcrypt')
const autoBind = require('auto-bind')

class UsersService {
  constructor () {
    this._pool = new Pool()

    autoBind(this)
  }

  async addUser (data) {
    await this.verifyNewUsername(data.username)

    const id = `user-${nanoid(16)}`
    const hashedPassword = await hash(data.password, 10)
    const query = {
      text: 'INSERT INTO users VALUES($1, $2, $3, $4) RETURNING id',
      values: [id, data.username, hashedPassword, data.fullname]
    }

    const result = await this._pool.query(query)

    if (result.rowCount === 0) {
      throw new InvariantError('User gagal ditambahkan')
    }
    return result.rows[0].id
  }

  async getUserById (userId) {
    const query = {
      text: 'SELECT id, username, fullname FROM users WHERE id = $1',
      values: [userId]
    }

    const result = await this._pool.query(query)

    if (result.rowCount === 0) {
      throw new NotFoundError('User tidak ditemukan')
    }

    return result.rows[0]
  }

  async verifyNewUsername (username) {
    const query = {
      text: 'SELECT username FROM users WHERE username = $1',
      values: [username]
    }

    const result = await this._pool.query(query)

    if (result.rowCount > 0) {
      throw new InvariantError('Gagal menambahkan user. Username sudah digunakan.')
    }
  }

  async verifyUserCredential (username, password) {
    const query = {
      text: 'SELECT id, password FROM users WHERE username = $1',
      values: [username]
    }

    const result = await this._pool.query(query)

    if (result.rowCount === 0) {
      throw new AuthenticationError('Kredensial yang Anda berikan salah')
    }

    const { id, password: hashedPassword } = result.rows[0]

    const match = await compare(password, hashedPassword)

    if (!match) {
      throw new AuthenticationError('Kredensial yang Anda berikan salah')
    }
    return id
  }

  async getUsersByUsername (username) {
    const query = {
      text: 'SELECT id, username, fullname FROM users WHERE username LIKE $1',
      values: [`%${username}%`]
    }
    const result = await this._pool.query(query)
    return result.rows
  }
}

module.exports = UsersService
