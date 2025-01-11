const UsersHandler = require('./handler')
const routes = require('./routes')

/** @typedef {Object} Options
 *  @property {import('../../services/postgres/UsersService')} service
 *  @property {import('../../validator/users')} validator
 */

/** @type {import('@hapi/hapi').Plugin<Options>} */
module.exports = {
  name: 'users',
  version: '1.0.0',
  register: async (server, { service, validator }) => {
    const usersHandler = new UsersHandler(service, validator)
    server.route(routes(usersHandler))
  }
}
