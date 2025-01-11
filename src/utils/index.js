/* eslint-disable camelcase */

/**
 * @import { Song } from '../services/postgres/SongsService'
 * @import { Playlist, PlaylistSongActivity } from '../services/postgres/PlaylistsService'
 * @import { User} from '../services/postgres/UsersService'
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
 * @param {Playlist & { username: User["username"] }} initial
 */
const mapDBPlaylistToResponse = ({ id, name, username }) => ({ id, name, username })

/**
 * @param {Song} initial
 */
const mapDBPlaylistSongsToResponse = ({ id, title, performer }) => ({ id, title, performer })

/**
 * @param {Object} initial
 * @param {string} initial.username
 * @param {string} initial.title
 * @param {string} initial.action
 * @param {string} initial.time
 */
const mapDBActivitiesToResponse = ({ username, title, action, time }) => ({ username, title, action, time })

module.exports = { mapDBSongToModel, mapDBPlaylistToResponse, mapDBPlaylistSongsToResponse, mapDBActivitiesToResponse }
