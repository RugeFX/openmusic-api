const { AlbumPayloadSchema } = require('./schema')
const { InvariantError } = require('../../exceptions')

const AlbumsValidator = {
  /** @param {unknown} payload */
  validateAlbumPayload: (payload) => {
    const validationResult = AlbumPayloadSchema.validate(payload)
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message)
    }
  }
}

module.exports = AlbumsValidator
