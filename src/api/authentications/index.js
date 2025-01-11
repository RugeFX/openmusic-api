const AuthenticationsHandler = require('./handler')
const routes = require('./routes')

/** @typedef {Object} Options
 *  @property {import('../../services/postgres/AuthenticationsService')} authenticationsService
 *  @property {import('../../services/postgres/UsersService')} usersService
 *  @property {import('../../tokenize')} tokenManager
 *  @property {import('../../validator/authentications')} validator
 */

/** @type {import('@hapi/hapi').Plugin<Options>} */
module.exports = {
  name: 'authentications',
  version: '1.0.0',
  register: async (server, {
    authenticationsService,
    usersService,
    tokenManager,
    validator
  }) => {
    const authenticationsHandler = new AuthenticationsHandler(
      authenticationsService,
      usersService,
      tokenManager,
      validator
    )
    server.route(routes(authenticationsHandler))
  }
}
