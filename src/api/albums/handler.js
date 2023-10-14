const ClientError = require('../../exceptions/ClientError')
const autoBind = require('auto-bind')

class AlbumsHandler {
  constructor (service, validator) {
    this._service = service
    this._validator = validator

    autoBind(this)
  }

  async postAlbumHandler (request, h) {
    try {
      this._validator.validateAlbumPayload(request.payload)
      const { name, year } = request.payload

      const albumId = await this._service.addAlbum({ name, year })

      const response = h.response({
        status: 'success',
        message: 'Album berhasil ditambahkan',
        data: {
          albumId
        }
      })
      response.code(201)
      return response
    } catch (error) {
      if (error instanceof ClientError) {
        return h.response({
          status: 'fail',
          message: error.message
        }).code(error.statusCode)
      }

      console.error(error)
      return h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.'
      }).code(500)
    }
  }

  async getAlbumByIdHandler (request, h) {
    try {
      const { id } = request.params
      const note = await this._service.getNoteById(id)
      return {
        status: 'success',
        data: {
          note
        }
      }
    } catch (error) {
      if (error instanceof ClientError) {
        return h.response({
          status: 'fail',
          message: error.message
        }).code(error.statusCode)
      }

      console.error(error)
      return h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.'
      }).code(500)
    }
  }

  async putAlbumByIdHandler (request, h) {
    try {
      this._validator.validateNotePayload(request.payload)
      const { title, body, tags } = request.payload
      const { id } = request.params

      await this._service.editNoteById(id, { title, body, tags })

      return {
        status: 'success',
        message: 'Catatan berhasil diperbarui'
      }
    } catch (error) {
      if (error instanceof ClientError) {
        return h.response({
          status: 'fail',
          message: error.message
        }).code(error.statusCode)
      }

      console.error(error)
      return h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.'
      }).code(500)
    }
  }

  async deleteAlbumByIdHandler (request, h) {
    try {
      const { id } = request.params
      await this._service.deleteNoteById(id)

      return {
        status: 'success',
        message: 'Catatan berhasil dihapus'
      }
    } catch (error) {
      if (error instanceof ClientError) {
        return h.response({
          status: 'fail',
          message: error.message
        }).code(error.statusCode)
      }

      console.error(error)
      return h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.'
      }).code(500)
    }
  }
}

module.exports = AlbumsHandler
