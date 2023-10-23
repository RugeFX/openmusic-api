const InvariantError = require('../../exceptions/InvariantError')
const { UserPayloadSchema } = require('./schema')

const UsersValidator = {
  validateUserPayload: (payload) => {
    const validationResult = UserPayloadSchema.validate(payload)

    if (validationResult.error !== undefined) {
      throw new InvariantError(validationResult.error.message)
    }
  }
}

module.exports = UsersValidator
