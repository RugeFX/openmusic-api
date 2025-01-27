const ExportPlaylistPayloadSchema = require('./schema')
const InvariantError = require('../../exceptions/InvariantError')

const ExportsValidator = {
  /** @param {unknown} payload */
  validateExportPlaylistPayload: (payload) => {
    const validationResult = ExportPlaylistPayloadSchema.validate(payload)

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message)
    }
  }
}

module.exports = ExportsValidator
