const autoBind = require('auto-bind')

/** 
 * @import { Request, ResponseToolkit } from "@hapi/hapi"
 * @import AuthenticationsService from '../../services/postgres/AuthenticationsService'
 * @import UsersService from '../../services/postgres/UsersService'
 * @typedef {import('../../tokenize/TokenManager')} TokenManager
 * @typedef {import('../../validator/authentications')} AuthenticationsValidator
 */

class AuthenticationsHandler {
  /**
   * @param {AuthenticationsService} authenticationsService
   * @param {UsersService} usersService
   * @param {TokenManager} tokenManager
   * @param {AuthenticationsValidator} validator
   */
  constructor(
    authenticationsService,
    usersService,
    tokenManager,
    validator
  ) {
    /**
     * @type {AuthenticationsService}
     * @private
     */
    this._authenticationsService = authenticationsService

    /**
     * @type {UsersService}
     * @private
     */
    this._usersService = usersService

    /**
     * @type {TokenManager}
     * @private
     */
    this._tokenManager = tokenManager

    /**
     * @type {AuthenticationsValidator}
     * @private
     */
    this._validator = validator

    autoBind(this)
  }

  /**
   * @param {Request} request
   * @param {ResponseToolkit} h
   */
  async postAuthenticationHandler(request, h) {
    this._validator.validatePostAuthenticationPayload(request.payload)

    const { username, password } = request.payload
    const id = await this._usersService.verifyUserCredential(username, password)

    const accessToken = this._tokenManager.generateAccessToken({ id })
    const refreshToken = this._tokenManager.generateRefreshToken({ id })

    await this._authenticationsService.addRefreshToken(refreshToken)

    const response = h.response({
      status: 'success',
      message: 'Authentication berhasil ditambahkan',
      data: {
        accessToken,
        refreshToken
      }
    })
    response.code(201)
    return response
  }

  /**
   * @param {Request} request
   * @param {ResponseToolkit} h
   */
  async putAuthenticationHandler(request, h) {
    this._validator.validatePutAuthenticationPayload(request.payload)

    const { refreshToken } = request.payload
    await this._authenticationsService.verifyRefreshToken(refreshToken)
    const { id } = this._tokenManager.verifyRefreshToken(refreshToken)

    const accessToken = this._tokenManager.generateAccessToken({ id })
    return h.response({
      status: 'success',
      message: 'Access Token berhasil diperbarui',
      data: {
        accessToken
      }
    })
  }

  /**
   * @param {Request} request
   * @param {ResponseToolkit} h
   */
  async deleteAuthenticationHandler(request, h) {
    this._validator.validateDeleteAuthenticationPayload(request.payload)

    const { refreshToken } = request.payload
    await this._authenticationsService.verifyRefreshToken(refreshToken)
    await this._authenticationsService.deleteRefreshToken(refreshToken)

    return h.response({
      status: 'success',
      message: 'Refresh token berhasil dihapus'
    })
  }
}

module.exports = AuthenticationsHandler
