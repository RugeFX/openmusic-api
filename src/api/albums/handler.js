const autoBind = require('auto-bind')

/** 
 * @import { Request, ResponseToolkit } from "@hapi/hapi" 
 * @import AlbumsService from '../../services/postgres/AlbumsService'
 * @import SongsService from '../../services/postgres/SongsService'
 * @typedef {import('../../validator/albums')} AlbumsValidator
 */

class AlbumsHandler {
  /**
   * @param {AlbumsService} albumsService
   * @param {SongsService} songsService
   * @param {AlbumsValidator} validator
   */
  constructor(albumsService, songsService, validator) {
    /**
     * @type {AlbumsService}
     * @private
     */
    this._albumsService = albumsService

    /**
     * @type {SongsService}
     * @private
     */
    this._songsService = songsService

    /**
     * @type {AlbumsValidator}
     * @private
     */
    this._validator = validator

    autoBind(this)
  }

  /**
   * @param {Request} request
   * @param {ResponseToolkit} h
   */
  async postAlbumHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload)
    const { name, year } = request.payload

    const albumId = await this._albumsService.addAlbum({ name, year })

    const response = h.response({
      status: 'success',
      message: 'Album berhasil ditambahkan',
      data: {
        albumId
      }
    })
    response.code(201)
    return response
  }

  /**
   * @param {Request} request
   */
  async getAlbumByIdHandler(request) {
    const { id } = request.params

    const album = await this._albumsService.getAlbumById(id)
    const songs = await this._songsService.getSongs({ albumId: id })

    return {
      status: 'success',
      data: {
        album: { ...album, songs }
      }
    }
  }

  /**
   * @param {Request} request
   */
  async putAlbumByIdHandler(request) {
    this._validator.validateAlbumPayload(request.payload)
    const { name, year } = request.payload
    const { id } = request.params

    await this._albumsService.editAlbumById(id, { name, year })

    return {
      status: 'success',
      message: 'ALbum berhasil diperbarui'
    }
  }

  /**
   * @param {Request} request
   */
  async deleteAlbumByIdHandler(request) {
    const { id } = request.params

    await this._albumsService.deleteAlbumById(id)

    return {
      status: 'success',
      message: 'ALbum berhasil dihapus'
    }
  }
}

module.exports = AlbumsHandler
