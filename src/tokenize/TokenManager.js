const Jwt = require('@hapi/jwt')
const InvariantError = require('../exceptions/InvariantError')
const config = require('../utils/config')

const TokenManager = {
  /** @param {object} payload */
  generateAccessToken: (payload) => Jwt.token.generate(payload, config.token.accessTokenKey),
  /** @param {object} payload */
  generateRefreshToken: (payload) => Jwt.token.generate(payload, config.token.refreshTokenKey),
  /**
   * @param {string} refreshToken
   * @returns {object}
  */
  verifyRefreshToken: (refreshToken) => {
    try {
      const artifacts = Jwt.token.decode(refreshToken)
      Jwt.token.verifySignature(artifacts, config.token.refreshTokenKey)
      const { payload } = artifacts.decoded
      return payload
    } catch (error) {
      throw new InvariantError('Refresh token tidak valid')
    }
  }
}

module.exports = TokenManager
