/** @type {(handler: import("./handler")) => import("@hapi/hapi").ServerRoute[]} */
const routes = (handler) => [
  {
    method: 'GET',
    path: '/songs',
    handler: handler.getAllSongsHandler
  },
  {
    method: 'POST',
    path: '/songs',
    handler: handler.postSongHandler
  },
  {
    method: 'GET',
    path: '/songs/{id}',
    handler: handler.getSongByIdHandler
  },
  {
    method: 'PUT',
    path: '/songs/{id}',
    handler: handler.putSongByIdHandler
  },
  {
    method: 'DELETE',
    path: '/songs/{id}',
    handler: handler.deleteSongByIdHandler
  }
]

module.exports = routes
