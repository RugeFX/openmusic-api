const { PlaylistPayloadSchema, PlaylistSongPayloadSchema } = require('./schema')
const { InvariantError } = require('../../exceptions')

const PlaylistsValidator = {
  /** @param {unknown} payload */
  validatePlaylistPayload: (payload) => {
    const validationResult = PlaylistPayloadSchema.validate(payload)
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message)
    }
  },
  /** @param {unknown} payload */
  validatePlaylistSongPayload: (payload) => {
    const validationResult = PlaylistSongPayloadSchema.validate(payload)
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message)
    }
  }
}

module.exports = PlaylistsValidator
