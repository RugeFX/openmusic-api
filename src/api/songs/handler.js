const autoBind = require('auto-bind')

/**
 * @import { Request, ResponseToolkit } from "@hapi/hapi"
 * @import SongsService from '../../services/postgres/SongsService'
 * @typedef {import('../../validator/songs')} SongsValidator
 */

class SongsHandler {
  /**
   * @param {SongsService} service
   * @param {SongsValidator} validator
   */
  constructor (service, validator) {
    /**
     * @type {SongsService}
     * @private
     */
    this._service = service

    /**
     * @type {SongsValidator}
     * @private
     */
    this._validator = validator

    autoBind(this)
  }

  /** @param {Request} request */
  async getAllSongsHandler (request) {
    const songs = await this._service.getSongs({ title: request.query.title, performer: request.query.performer })

    return {
      status: 'success',
      data: {
        songs
      }
    }
  }

  /**
   * @param {Request} request
   * @param {ResponseToolkit} h
   */
  async postSongHandler (request, h) {
    this._validator.validateSongPayload(request.payload)

    const songId = await this._service.addSong(request.payload)

    const response = h.response({
      status: 'success',
      message: 'Lagu berhasil ditambahkan',
      data: {
        songId
      }
    }).code(201)
    return response
  }

  /**
   * @param {Request} request
   */
  async getSongByIdHandler (request) {
    const song = await this._service.getSongById(request.params.id)

    return {
      status: 'success',
      data: {
        song
      }
    }
  }

  /**
 * @param {Request} request
 */
  async putSongByIdHandler (request) {
    this._validator.validateSongPayload(request.payload)

    await this._service.editSongById(request.params.id, request.payload)

    return {
      status: 'success',
      message: 'Lagu berhasil diperbarui'
    }
  }

  /**
 * @param {Request} request
 */
  async deleteSongByIdHandler (request) {
    await this._service.deleteSongById(request.params.id)

    return {
      status: 'success',
      message: 'Lagu berhasil dihapus'
    }
  }
}

module.exports = SongsHandler
