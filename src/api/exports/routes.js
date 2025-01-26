/** @type {(handler: import("./handler")) => import("@hapi/hapi").ServerRoute[]} */
const routes = (handler) => [
    {
        method: 'POST',
        path: '/export/playlists/{playlistId}',
        handler: handler.postExportPlaylistHandler,
        options: {
            auth: 'jwtauth',
        },
    },
];

module.exports = routes;