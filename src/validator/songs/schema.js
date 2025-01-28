const Joi = require('joi')

const SongPayloadSchema = Joi.object({
  title: Joi.string().max(50).required(),
  year: Joi.number().integer().min(1900).max(new Date().getFullYear()).required(),
  genre: Joi.string().max(25).required(),
  performer: Joi.string().required(),
  duration: Joi.number(),
  albumId: Joi.string()
})

module.exports = { SongPayloadSchema }
