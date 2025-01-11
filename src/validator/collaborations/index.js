const { InvariantError } = require('../../exceptions')
const { CollaborationPayloadSchema } = require('./schema')

const CollaborationsValidator = {
  /** @param {unknown} payload */
  validateCollaborationPayload: (payload) => {
    const validationResult = CollaborationPayloadSchema.validate(payload)

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message)
    }
  }
}

module.exports = CollaborationsValidator
