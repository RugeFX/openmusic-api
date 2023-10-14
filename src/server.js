require('dotenv').config()

const Hapi = require('@hapi/hapi')
const { ClientError } = require('./exceptions')
// Albums
const albums = require('./api/albums')
const AlbumsValidator = require('./validator/albums')
const AlbumsService = require('./services/postgres/AlbumsService')
// Songs
const songs = require('./api/songs')
const SongsValidator = require('./validator/songs')
const SongsService = require('./services/postgres/SongsService')

const init = async () => {
  const albumsService = new AlbumsService()
  const songsService = new SongsService()

  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*']
      }
    }
  })

  server.route({
    method: 'GET',
    path: '/',
    handler: (req, h) => {
      return h.response({ message: 'Hello world!', version: '1.0.0' })
    }
  })

  await server.register({
    plugin: albums,
    options: {
      service: albumsService,
      validator: AlbumsValidator
    }
  })

  await server.register({
    plugin: songs,
    options: {
      service: songsService,
      validator: SongsValidator
    }
  })

  server.ext('onPreResponse', registerPreResponse)

  await server.start()
  console.log(`Server berjalan pada ${server.info.uri}`)
}

function registerPreResponse (request, h) {
  const { response } = request
  if (response instanceof Error) {
    switch (true) {
      case (response instanceof ClientError):
        return h.response({
          status: 'fail',
          message: response.message
        }).code(response.statusCode)

      case (!response.isServer):
        return h.continue

      default:
        return h.response({
          status: 'error',
          message: 'Terjadi kegagalan pada server kami'
        }).code(500)
    }
  }
  return h.continue
}

init()
