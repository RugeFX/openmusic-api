const {
  DeleteAuthenticationPayloadSchema,
  PostAuthenticationPayloadSchema,
  PutAuthenticationPayloadSchema
} = require('./schema')
const { InvariantError } = require('../../exceptions')

const AuthenticationsValidator = {
  validatePostAuthenticationPayload: (payload) => {
    const validationResult = PostAuthenticationPayloadSchema.validate(payload)
    if (validationResult.error !== undefined) {
      throw new InvariantError(validationResult.error.message)
    }
  },
  validatePutAuthenticationPayload: (payload) => {
    const validationResult = PutAuthenticationPayloadSchema.validate(payload)
    if (validationResult.error !== undefined) {
      throw new InvariantError(validationResult.error.message)
    }
  },
  validateDeleteAuthenticationPayload: (payload) => {
    const validationResult = DeleteAuthenticationPayloadSchema.validate(payload)
    if (validationResult.error !== undefined) {
      throw new InvariantError(validationResult.error.message)
    }
  }
}

module.exports = AuthenticationsValidator
