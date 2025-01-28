const autoBind = require('auto-bind')

/**
 * @import { Request, ResponseToolkit } from "@hapi/hapi"
 * @import AlbumsService from '../../services/postgres/AlbumsService'
 * @import SongsService from '../../services/postgres/SongsService'
 * @import StorageService from '../../services/storage/StorageService'
 * @typedef {import('../../validator/albums')} AlbumsValidator
 * @typedef {import('../../validator/uploads')} UploadsValidator
 */

class AlbumsHandler {
  /**
   * @param {AlbumsService} albumsService
   * @param {SongsService} songsService
   * @param {StorageService} storageService
   * @param {AlbumsValidator} albumsValidator
   * @param {UploadsValidator} uploadsValidator
   */
  constructor (
    albumsService,
    songsService,
    storageService,
    albumsValidator,
    uploadsValidator
  ) {
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
     * @type {StorageService}
     * @private
     */
    this._storageService = storageService

    /**
     * @type {AlbumsValidator}
     * @private
     */
    this._albumsValidator = albumsValidator

    /**
     * @type {UploadsValidator}
     * @private
     */
    this._uploadsValidator = uploadsValidator

    autoBind(this)
  }

  /**
   * @param {Request} request
   * @param {ResponseToolkit} h
   */
  async postAlbumHandler (request, h) {
    this._albumsValidator.validateAlbumPayload(request.payload)
    const { name, year } = request.payload

    const albumId = await this._albumsService.addAlbum({ name, year })

    return h.response({
      status: 'success',
      message: 'Album berhasil ditambahkan',
      data: {
        albumId
      }
    }).code(201)
  }

  /**
   * @param {Request} request
   */
  async getAlbumByIdHandler (request) {
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
  async putAlbumByIdHandler (request) {
    this._albumsValidator.validateAlbumPayload(request.payload)

    await this._albumsService.editAlbumById(request.params.id, request.payload)

    return {
      status: 'success',
      message: 'ALbum berhasil diperbarui'
    }
  }

  /**
   * @param {Request} request
   */
  async deleteAlbumByIdHandler (request) {
    await this._albumsService.deleteAlbumById(request.params.id)

    return {
      status: 'success',
      message: 'ALbum berhasil dihapus'
    }
  }

  /**
   * @param {Request} request
   * @param {ResponseToolkit} h
   */
  async postUploadAlbumCoverHandler (request, h) {
    const { cover } = request.payload
    const { id } = request.params

    this._uploadsValidator.validateImageHeaders(cover.hapi.headers)

    const album = await this._albumsService.getAlbumById(id)
    if (album.coverUrl) {
      await this._storageService.deleteFile(album.coverUrl)
    }

    const coverUrl = await this._storageService.writeFile(
      cover,
      cover.hapi
    )
    await this._albumsService.editAlbumCoverById(id, coverUrl)

    return h
      .response({
        status: 'success',
        message: 'Sampul berhasil diunggah'
      })
      .code(201)
  }

  /**
   * @param {Request} request
    * @param {ResponseToolkit} h
    */
  async getAlbumLikesByIdHandler (request, h) {
    const { via, likes } = await this._albumsService.getAlbumLikesById(
      request.params.id
    )

    const response = h.response({ status: 'success', data: { likes } })

    if (via === 'cache') { return response.header('X-Data-Source', 'cache') }

    return response
  }

  /**
   * @param {Request} request
   * @param {ResponseToolkit} h
   */
  async postAlbumLikeByIdHandler (request, h) {
    const { id: userId } = request.auth.credentials
    const { id: albumId } = request.params

    await Promise.all([
      this._albumsService.getAlbumById(albumId),
      this._albumsService.verifyUserHasntLikedAlbum(userId, albumId)
    ])
    await this._albumsService.likeAlbumById(userId, albumId)

    return h
      .response({
        status: 'success',
        message: 'Like berhasil ditambahkan'
      })
      .code(201)
  }

  /**
   * @param {Request} request
   * @param {ResponseToolkit} h
   */
  async deleteAlbumLikeByIdHandler (request, h) {
    await this._albumsService.unlikeAlbumById(request.auth.credentials.id, request.params.id)

    return h.response({
      status: 'success',
      message: 'Like berhasil dihapus'
    })
  }
}

module.exports = AlbumsHandler
