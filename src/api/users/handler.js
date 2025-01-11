const autoBind = require('auto-bind')

/** 
 * @import { Request, ResponseToolkit } from "@hapi/hapi" 
 * @import UsersService from '../../services/postgres/UsersService'
 * @typedef {import('../../validator/users')} UsersValidator
 */

class UsersHandler {
  /**
   * @param {UsersService} service
   * @param {UsersValidator} validator
   */
  constructor(service, validator) {
    /** 
     * @type {UsersService}
     * @private
     */
    this._service = service

    /** 
     * @type {UsersValidator}
     * @private
     */
    this._validator = validator

    autoBind(this)
  }

  /**
   * @param {Request} request
   * @param {ResponseToolkit} h
   */
  async postUserHandler(request, h) {
    this._validator.validateUserPayload(request.payload)
    const { username, password, fullname } = request.payload

    const userId = await this._service.addUser({ username, password, fullname })

    const response = h.response({
      status: 'success',
      message: 'User berhasil ditambahkan',
      data: {
        userId
      }
    })
    response.code(201)
    return response
  }

  /**
   * @param {Request} request
   * @param {ResponseToolkit} h
   */
  async getUserByIdHandler(request, h) {
    const { id } = request.params

    const user = await this._service.getUserById(id)

    return h.response({
      status: 'success',
      data: {
        user
      }
    })
  }

  /**
   * @param {Request} request
   * @param {ResponseToolkit} h
   */
  async getUsersByUsernameHandler(request, h) {
    const { username = '' } = request.query
    const users = await this._service.getUsersByUsername(username)
    return h.response({
      status: 'success',
      data: {
        users
      }
    })
  }
}

module.exports = UsersHandler
