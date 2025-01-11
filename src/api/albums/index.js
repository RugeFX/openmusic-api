const AlbumsHandler = require('./handler')
const routes = require('./routes')

/** @typedef {Object} Options
 *  @property {import('../../services/postgres/AlbumsService')} albumsService
 * @property {import('../../services/postgres/SongsService')} songsService
 *  @property {import('../../validator/albums')} validator
 */

/** @type {import('@hapi/hapi').Plugin<Options>} */
module.exports = {
  name: 'albums',
  version: '1.0.0',
  register: async (server, { albumsService, songsService, validator }) => {
    const albumsHandler = new AlbumsHandler(albumsService, songsService, validator)
    server.route(routes(albumsHandler))
  }
}
