require('dotenv').config()

const Hapi = require('@hapi/hapi')
const albums = require('./api/albums')

const init = async () => {
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
      return h.response({ message: 'Hello world!' })
    }
  })

  await server.register({
    plugin: albums,
    options: {
      service: notesService,
      validator: NotesValidator
    }
  })

  await server.start()
  console.log(`Server berjalan pada ${server.info.uri}`)
}

await init()
