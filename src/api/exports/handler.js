const autoBind = require("auto-bind");

/**
 * @import { Request, ResponseToolkit } from "@hapi/hapi"
 * @import ProducerService from "../../services/rabbitmq/ProducerService"
 * @import PlaylistsService from "../../services/postgres/PlaylistsService"
 * @typedef {import('../../validator/exports')} Validator
 */

class ExportsHandler {
    /**
   * @param {ProducerService} producerService
   * @param {PlaylistsService} playlistsService
   * @param {Validator} validator
   */
    constructor(producerService, playlistsService, validator) {
        /**
         * @type {ProducerService}
         * @private
         */
        this._producerService = producerService;
        /**
         * @type {PlaylistsService}
         * @private
         */
        this._playlistsService = playlistsService;
        /**
         * @type {Validator}
         * @private
         */
        this._validator = validator;

        autoBind(this)
    }

    /**
     * @param {Request} request
     * @param {ResponseToolkit} h
     */
    async postExportPlaylistHandler(request, h) {
        const { playlistId } = request.params
        this._validator.validateExportPlaylistPayload(request.payload);

        const { id: userId } = request.auth.credentials;
        await this._playlistsService.verifyPlaylistOwner(playlistId, userId);

        const message = {
            playlistId,
            userId,
            targetEmail: request.payload.targetEmail,
        };

        await this._producerService.sendMessage('export:playlist', JSON.stringify(message));

        return h.response({
            status: 'success',
            message: 'Permintaan Anda dalam antrean',
        }).code(201);
    }
}

module.exports = ExportsHandler;