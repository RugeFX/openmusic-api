const autoBind = require('auto-bind')

/**
 * @import { Request, ResponseToolkit } from "@hapi/hapi"
 * @import PlaylistsService from '../../services/postgres/PlaylistsService'
 * @import SongsService from '../../services/postgres/SongsService'
 * @import UsersService from '../../services/postgres/UsersService'
 * @typedef {import('../../validator/playlsits')} PlaylistsValidator
 */

class PlaylistsHandler {
  /**
   * @param {PlaylistsService} playlistsService
   * @param {SongsService} songsService
   * @param {UsersService} usersService
   * @param {PlaylistsValidator} validator
   */
  constructor (playlistsService, songsService, usersService, validator) {
    /**
     * @type {PlaylistsService}
     * @private
     */
    this._playlistsService = playlistsService

    /**
     * @type {SongsService}
     * @private
     */
    this._songsService = songsService

    /**
     * @type {UsersService}
     * @private
     */
    this._usersService = usersService

    /**
     * @type {PlaylistsValidator}
     * @private
     */
    this._validator = validator

    autoBind(this)
  }

  /**
   * @param {Request} request
   */
  async getPlaylistsHandler (request) {
    const playlists = await this._playlistsService.getPlaylists(request.auth.credentials.id)

    return {
      status: 'success',
      data: {
        playlists
      }
    }
  }

  /**
   * @param {Request} request
   * @param {ResponseToolkit} h
   */
  async postPlaylistHandler (request, h) {
    this._validator.validatePlaylistPayload(request.payload)

    const { name } = request.payload
    const { id: owner } = request.auth.credentials

    const playlistId = await this._playlistsService.addPlaylist({ name, owner })

    return h.response({
      status: 'success',
      message: 'Playlist berhasil ditambahkan',
      data: {
        playlistId
      }
    }).code(201)
  }

  /**
   * @param {Request} request
   */
  async deletePlaylistByIdHandler (request) {
    const { id: userId } = request.auth.credentials
    const { id: playlistId } = request.params

    await this._playlistsService.verifyPlaylistOwner(playlistId, userId)
    await this._playlistsService.deletePlaylistById(playlistId)

    return {
      status: 'success',
      message: 'Playlist berhasil dihapus'
    }
  }

  /**
   * @param {Request} request
   * @param {ResponseToolkit} h
   */
  async postSongToPlaylistHandler (request, h) {
    const { id: userId } = request.auth.credentials
    const { id: playlistId } = request.params

    this._validator.validatePlaylistSongPayload(request.payload)
    const { songId } = request.payload

    await this._songsService.getSongById(songId)
    await this._playlistsService.verifyPlaylistAccess(playlistId, userId)

    await this._playlistsService.addSongToPlaylist({ playlistId, songId })
    await this._playlistsService.addPlaylistActivity({ action: 'add', playlistId, songId, userId })

    return h.response({
      status: 'success',
      message: 'Lagu berhasil ditambahkan ke Playlist'
    }).code(201)
  }

  /**
   * @param {Request} request
   */
  async getSongsFromPlaylistHandler (request) {
    const { id: playlistId } = request.params

    await this._playlistsService.verifyPlaylistAccess(playlistId, request.auth.credentials.id)
    const { id, name, username } = await this._playlistsService.getPlaylistById(playlistId)
    const songs = await this._playlistsService.getPlaylistSongsById(playlistId)

    return {
      status: 'success',
      data: { playlist: { id, name, username, songs } }
    }
  }

  /**
   * @param {Request} request
   */
  async deleteSongFromPlaylistHandler (request) {
    const { id: userId } = request.auth.credentials
    const { id: playlistId } = request.params

    this._validator.validatePlaylistSongPayload(request.payload)
    const { songId } = request.payload

    await this._playlistsService.verifyPlaylistAccess(playlistId, userId)

    await this._playlistsService.deletePlaylistSongById({ playlistId, songId })
    await this._playlistsService.addPlaylistActivity({ action: 'delete', playlistId, songId, userId })

    return {
      status: 'success',
      message: 'Lagu berhasil dihapus dari Playlist'
    }
  }

  /**
   * @param {Request} request
   */
  async getPlaylistActivitiesHandler (request) {
    const { id: userId } = request.auth.credentials
    const { id: playlistId } = request.params

    await this._playlistsService.verifyPlaylistAccess(playlistId, userId)

    const activities = await this._playlistsService.getPlaylistActivities(playlistId)

    return {
      status: 'success',
      data: {
        playlistId,
        activities
      }
    }
  }
}

module.exports = PlaylistsHandler
