const autoBind = require('auto-bind')

class PlaylistsHandler {
  constructor (playlistsService, songsService, usersService, validator) {
    this._playlistsService = playlistsService
    this._songsService = songsService
    this._usersService = usersService
    this._validator = validator

    autoBind(this)
  }

  async getPlaylistsHandler (request) {
    const { id: credentialId } = request.auth.credentials
    const playlists = await this._playlistsService.getPlaylists(credentialId)

    return {
      status: 'success',
      data: {
        playlists
      }
    }
  }

  async postPlaylistHandler (request, h) {
    const { id: owner } = request.auth.credentials

    this._validator.validatePlaylistPayload(request.payload)
    const { name } = request.payload

    const playlistId = await this._playlistsService.addPlaylist({ name, owner })

    return h.response({
      status: 'success',
      message: 'Playlist berhasil ditambahkan',
      data: {
        playlistId
      }
    }).code(201)
  }

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

  async postSongToPlaylistHandler (request, h) {
    const { id: userId } = request.auth.credentials
    const { id: playlistId } = request.params

    this._validator.validatePlaylistSongPayload(request.payload)
    const { songId } = request.payload
    await this._songsService.verifySongExists(songId)

    await this._playlistsService.verifyPlaylistExists(playlistId)
    await this._playlistsService.verifyPlaylistAccess(playlistId, userId)

    await this._playlistsService.addSongToPlaylist({ playlistId, songId })

    const { title } = await this._songsService.getSongById(songId)
    const { username } = await this._usersService.getUserById(userId)
    await this._playlistsService.addPlaylistActivity({ username, title, action: 'add', playlistId })

    return h.response({
      status: 'success',
      message: 'Lagu berhasil ditambahkan ke Playlist'
    }).code(201)
  }

  async getSongsFromPlaylistHandler (request) {
    const { id: userId } = request.auth.credentials
    const { id: playlistId } = request.params

    await this._playlistsService.verifyPlaylistAccess(playlistId, userId)
    const playlist = await this._playlistsService.getPlaylistById(playlistId)
    playlist.songs = await this._playlistsService.getPlaylistSongsById(playlistId)

    return {
      status: 'success',
      data: { playlist }
    }
  }

  async deleteSongFromPlaylistHandler (request) {
    const { id: userId } = request.auth.credentials
    const { id: playlistId } = request.params

    await this._playlistsService.verifyPlaylistAccess(playlistId, userId)

    await this._validator.validatePlaylistSongPayload(request.payload)
    const { songId } = request.payload

    await this._playlistsService.deletePlaylistSongById({ playlistId, songId })

    const { title } = await this._songsService.getSongById(songId)
    const { username } = await this._usersService.getUserById(userId)
    await this._playlistsService.addPlaylistActivity({ username, title, action: 'delete', playlistId })

    return {
      status: 'success',
      message: 'Lagu berhasil dihapus dari Playlist'
    }
  }

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
