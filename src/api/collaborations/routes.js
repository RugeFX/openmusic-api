/** @type {(handler: import("./handler")) => import("@hapi/hapi").ServerRoute[]} */
const routes = (handler) => [
  {
    method: 'POST',
    path: '/collaborations',
    handler: handler.postCollaborationHandler,
    options: {
      auth: 'jwtauth'
    }
  },
  {
    method: 'DELETE',
    path: '/collaborations',
    handler: handler.deleteCollaborationHandler,
    options: {
      auth: 'jwtauth'
    }
  }
]

module.exports = routes
