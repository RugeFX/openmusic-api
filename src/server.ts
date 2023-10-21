import 'dotenv/config'

import Hapi from '@hapi/hapi'
import { ClientError } from './exceptions'
import type { ResponseObject, Request, ResponseToolkit } from '@hapi/hapi'
// Albums
import albums from './api/albums'
import AlbumsValidator from './validator/albums'
import AlbumsService from './services/postgres/AlbumsService'
// Songs
import songs from './api/songs'
import SongsValidator from './validator/songs'
import SongsService from './services/postgres/SongsService'

const init = async (): Promise<void> => {
  const albumsService = new AlbumsService()
  const songsService = new SongsService()

  const server = Hapi.server({
    port: process.env.PORT ?? 5000,
    host: process.env.HOST ?? '0.0.0.0',
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

  await server.register([{
    plugin: albums,
    options: {
      service: albumsService,
      validator: AlbumsValidator
    }
  }, {
    plugin: songs,
    options: {
      service: songsService,
      validator: SongsValidator
    }
  }
  ])

  server.ext('onPreResponse', registerPreResponse)

  await server.start()
  console.log(`Server berjalan pada ${server.info.uri}`)
}

function registerPreResponse (request: Request, h: ResponseToolkit): ResponseObject | symbol {
  const { response } = request
  if (response instanceof Error) {
    if (response instanceof ClientError) {
      return h.response({
        status: 'fail',
        message: response.message
      }).code(response.statusCode)
    }

    return !response.isServer
      ? h.continue
      : h.response({
        status: 'error',
        message: 'Terjadi kegagalan pada server kami'
      }).code(500)
  }
  return h.continue
}

void init()
