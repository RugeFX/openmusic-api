const SongsHandler = require('./handler')
const routes = require('./routes')

/** @typedef {Object} Options
 *  @property {import('../../services/postgres/SongsService')} service
 *  @property {import('../../validator/songs')} validator
 */

/** @type {import('@hapi/hapi').Plugin<Options>} */
module.exports = {
  name: 'songs',
  version: '1.0.0',
  register: async (server, { service, validator }) => {
    const songsHandler = new SongsHandler(service, validator)
    server.route(routes(songsHandler))
  }
}
