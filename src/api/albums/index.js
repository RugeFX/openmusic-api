const AlbumsHandler = require('./handler')
const routes = require('./routes')

/** @typedef {Object} Options
 *  @property {import('../../services/postgres/AlbumsService')} albumsService
 *  @property {import('../../services/postgres/SongsService')} songsService
 *  @property {import('../../services/storage/StorageService')} storageService
 *  @property {import('../../validator/albums')} albumsValidator
 *  @property {import('../../validator/uploads')} uploadsValidator
 */

/** @type {import('@hapi/hapi').Plugin<Options>} */
module.exports = {
  name: 'albums',
  version: '1.0.0',
  register: async (server, { albumsService, songsService, storageService, albumsValidator, uploadsValidator }) => {
    const albumsHandler = new AlbumsHandler(albumsService, songsService, storageService, albumsValidator, uploadsValidator)
    server.route(routes(albumsHandler))
  }
}
