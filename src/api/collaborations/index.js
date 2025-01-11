const CollaborationsHandler = require('./handler')
const routes = require('./routes')

/** @typedef {Object} Options
 *  @property {import('../../services/postgres/CollaborationsService')} collaborationsService
 *  @property {import('../../services/postgres/PlaylistsService')} playlistsService
 *  @property {import('../../services/postgres/UsersService')} usersService
 *  @property {import('../../validator/collaborations')} validator
 */

/** @type {import('@hapi/hapi').Plugin<Options>} */
module.exports = {
  name: 'collaborations',
  version: '1.0.0',
  register: async (server, { collaborationsService, playlistsService, usersService, validator }) => {
    const collaborationsHandler = new CollaborationsHandler(
      collaborationsService, playlistsService, usersService, validator
    )
    server.route(routes(collaborationsHandler))
  }
}
