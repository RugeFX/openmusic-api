const ExportsHandler = require('./handler');
const routes = require('./routes');

/** @typedef {Object} Options
 *  @property {import('../../services/rabbitmq/ProducerService')} producerService
 *  @property {import('../../services/postgres/PlaylistsService')} playlistsService
 *  @property {import('../../validator/exports')} validator
 */

/** @type {import('@hapi/hapi').Plugin<Options>} */
module.exports = {
    name: 'exports',
    version: '1.0.0',
    register: async (server, { producerService, playlistsService, validator }) => {
        const exportsHandler = new ExportsHandler(producerService, playlistsService, validator);
        server.route(routes(exportsHandler));
    },
};