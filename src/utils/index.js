/* eslint-disable camelcase */
const config = require('./config')

/**
 * @import { Song } from '../services/postgres/SongsService'
 */

/** @param {Omit<Song, "albumId"> & { album_id: Song["albumId"] }} initial */
const mapDBSongToModel =
  ({
    id,
    title,
    year,
    genre,
    performer,
    duration,
    album_id
  }) => ({
    id,
    title,
    year,
    genre,
    performer,
    duration,
    albumId: album_id
  })

/**
 *
 * @param {Object} initial
 * @param {string} initial.id
 * @param {string} initial.name
 * @param {number} initial.year
 * @param {string | null} initial.cover_url
 * @returns
 */
const mapDBAlbumToModel = ({ id, name, year, cover_url }) => ({ id, name, year, coverUrl: cover_url ? `http://${config.app.host}:${config.app.port}/upload/covers/${cover_url}` : null })

module.exports = { mapDBSongToModel, mapDBAlbumToModel }
