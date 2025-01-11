const autoBind = require('auto-bind')

/** 
 * @import { Request, ResponseToolkit } from "@hapi/hapi"
 * @import CollaborationsService from '../../services/postgres/CollaborationsService'
 * @import PlaylistsService from '../../services/postgres/PlaylistsService'
 * @import UsersService from '../../services/postgres/UsersService'
 * @typedef {import('../../validator/collaborations')} CollaborationsValidator
 */

class CollaborationsHandler {
  /**
   * @param {CollaborationsService} collaborationsService
   * @param {PlaylistsService} playlistsService
   * @param {UsersService} usersService
   * @param {CollaborationsValidator} validator
   */
  constructor(collaborationsService, playlistsService, usersService, validator) {
    /**
     * @type {CollaborationsService}
     * @private
     */
    this._collaborationsService = collaborationsService

    /**
     * @type {PlaylistsService}
     * @private
     */
    this._playlistsService = playlistsService

    /**
     * @type {UsersService}
     * @private
     */
    this._usersService = usersService

    /**
     * @type {CollaborationsValidator}
     * @private
     */
    this._validator = validator

    autoBind(this)
  }

  /**
   * @param {Request} request
   * @param {ResponseToolkit} h
   */
  async postCollaborationHandler(request, h) {
    this._validator.validateCollaborationPayload(request.payload)
    const { id: credentialId } = request.auth.credentials
    const { playlistId, userId } = request.payload

    await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId)
    await this._usersService.getUserById(userId)

    const collaborationId = await this._collaborationsService.addCollaboration(playlistId, userId)

    return h.response({
      status: 'success',
      data: {
        collaborationId
      }
    }).code(201)
  }

  /**
   * @param {Request} request
   * @param {ResponseToolkit} h
   */
  async deleteCollaborationHandler(request, h) {
    this._validator.validateCollaborationPayload(request.payload)
    const { id: credentialId } = request.auth.credentials
    const { playlistId, userId } = request.payload

    await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId)
    await this._collaborationsService.deleteCollaboration(playlistId, userId)

    return h.response({
      status: 'success',
      message: 'Kolaborasi berhasil dihapus'
    })
  }
}

module.exports = CollaborationsHandler
