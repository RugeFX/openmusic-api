const {
  DeleteAuthenticationPayloadSchema,
  PostAuthenticationPayloadSchema,
  PutAuthenticationPayloadSchema
} = require('./schema')
const { InvariantError } = require('../../exceptions')

const AuthenticationsValidator = {
  /** @param {unknown} payload */
  validatePostAuthenticationPayload: (payload) => {
    const validationResult = PostAuthenticationPayloadSchema.validate(payload)
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message)
    }
  },
  /** @param {unknown} payload */
  validatePutAuthenticationPayload: (payload) => {
    const validationResult = PutAuthenticationPayloadSchema.validate(payload)
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message)
    }
  },
  /** @param {unknown} payload */
  validateDeleteAuthenticationPayload: (payload) => {
    const validationResult = DeleteAuthenticationPayloadSchema.validate(payload)
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message)
    }
  }
}

module.exports = AuthenticationsValidator
