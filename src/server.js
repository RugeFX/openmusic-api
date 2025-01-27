require('dotenv').config()

const Hapi = require('@hapi/hapi')
const Jwt = require('@hapi/jwt')
const Inert = require('@hapi/inert')
const path = require('path')
const { ClientError } = require('./exceptions')
// Albums
const albums = require('./api/albums')
const AlbumsValidator = require('./validator/albums')
const AlbumsService = require('./services/postgres/AlbumsService')
// Songs
const songs = require('./api/songs')
const SongsValidator = require('./validator/songs')
const SongsService = require('./services/postgres/SongsService')
// Users
const users = require('./api/users')
const UsersService = require('./services/postgres/UsersService')
const UsersValidator = require('./validator/users')
// Authentications
const authentications = require('./api/authentications')
const AuthenticationsService = require('./services/postgres/AuthenticationsService')
const TokenManager = require('./tokenize/TokenManager')
const AuthenticationsValidator = require('./validator/authentications')
// Playlists
const playlists = require('./api/playlists')
const PlaylistsService = require('./services/postgres/PlaylistsService')
const PlaylistsValidator = require('./validator/playlsits')
// Collaborations
const collaborations = require('./api/collaborations')
const CollaborationsService = require('./services/postgres/CollaborationsService')
const CollaborationsValidator = require('./validator/collaborations')
const config = require('./utils/config')
// Exports
const _exports = require('./api/exports')
const ProducerService = require('./services/rabbitmq/ProducerService')
const ExportsValidator = require('./validator/exports')
// Storage
const StorageService = require('./services/storage/StorageService')
const UploadsValidator = require('./validator/uploads')
const CacheService = require('./services/redis/CacheService')

/**
 * @import { HapiJwt } from "@hapi/jwt"
 */

const init = async () => {
  const cacheService = new CacheService()
  const albumsService = new AlbumsService(cacheService)
  const songsService = new SongsService()
  const usersService = new UsersService()
  const authService = new AuthenticationsService()
  const collaborationsService = new CollaborationsService()
  const playlistsService = new PlaylistsService(collaborationsService)
  const storageService = new StorageService(
    path.resolve(__dirname, 'api/albums/file/covers')
  )

  const server = Hapi.server({
    port: config.app.port,
    host: config.app.host,
    routes: {
      cors: {
        origin: ['*']
      }
    }
  })

  server.route([
    {
      method: 'GET',
      path: '/',
      handler: (req, h) => {
        return h.response({
          message: 'Hello world!',
          version: '1.0.0'
        })
      }
    }
  ])

  await server.register([
    {
      plugin: Jwt
    },
    {
      plugin: Inert
    }
  ])

  server.auth.strategy('jwtauth', 'jwt', {
    keys: config.token.accessTokenKey,
    /** @type {HapiJwt.VerifyKeyOptions} */
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: config.token.accessTokenAge
    },
    /** @type {HapiJwt.OptionsValidateFunction} */
    validate: async (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id
      }
    })
  })

  await server.register([
    {
      plugin: albums,
      options: {
        albumsService,
        songsService,
        storageService,
        albumsValidator: AlbumsValidator,
        uploadsValidator: UploadsValidator
      }
    },
    {
      plugin: songs,
      options: {
        service: songsService,
        validator: SongsValidator
      }
    },
    {
      plugin: users,
      options: {
        service: usersService,
        validator: UsersValidator
      }
    },
    {
      plugin: authentications,
      options: {
        authenticationsService: authService,
        usersService,
        tokenManager: TokenManager,
        validator: AuthenticationsValidator
      }
    },
    {
      plugin: playlists,
      options: {
        playlistsService,
        songsService,
        usersService,
        validator: PlaylistsValidator
      }
    },
    {
      plugin: collaborations,
      options: {
        collaborationsService,
        playlistsService,
        usersService,
        validator: CollaborationsValidator
      }
    },
    {
      plugin: _exports,
      options: {
        playlistsService,
        producerService: ProducerService,
        validator: ExportsValidator
      }
    }
  ])

  server.ext('onPreResponse', registerPreResponse)

  await server.start()
  console.log(`Server berjalan pada ${server.info.uri}`)
}

/**
 * @param {import('@hapi/hapi').Request} request
 * @param {import('@hapi/hapi').ResponseToolkit} h
 * @returns
 */
function registerPreResponse (request, h) {
  const { response } = request
  if (response instanceof Error) {
    if (response instanceof ClientError) {
      return h
        .response({
          status: 'fail',
          message: response.message
        })
        .code(response.statusCode)
    }

    console.log(response)

    return !response.isServer
      ? h.continue
      : h
        .response({
          status: 'error',
          message: 'Terjadi kegagalan pada server kami'
        })
        .code(500)
  }
  return h.continue
}

init()
