const PlaylistsHandler = require('./handler')
const routes = require('./routes')

/** @typedef {Object} Options
 *  @property {import('../../services/postgres/PlaylistsService')} playlistsService
 *  @property {import('../../services/postgres/SongsService')} songsService
 *  @property {import('../../services/postgres/UsersService')} usersService
 *  @property {import('../../validator/playlsits')} validator
 */

/** @type {import('@hapi/hapi').Plugin<Options>} */
module.exports = {
  name: 'playlists',
  version: '1.0.0',
  register: async (server, {
    playlistsService,
    songsService,
    usersService,
    validator
  }) => {
    const playlistsHandler = new PlaylistsHandler(playlistsService, songsService, usersService, validator)
    server.route(routes(playlistsHandler))
  }
}
