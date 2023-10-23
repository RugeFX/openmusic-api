/* eslint-disable camelcase */
const mapDBSongToModel = (withId) => ({
  id,
  title,
  year,
  genre,
  performer,
  duration,
  album_id
}) => withId
  ? ({
      id,
      title,
      year,
      genre,
      performer,
      duration,
      albumId: album_id
    })
  : ({
      title,
      year,
      genre,
      performer,
      duration,
      albumId: album_id
    })

const mapDBPlaylistToResponse = ({ id, name, username }) => ({ id, name, username })

const mapDBPlaylistSongsToResponse = ({ id, title, performer }) => ({ id, title, performer })

const mapDBActivitiesToResponse = ({ username, title, action, time }) => ({ username, title, action, time })

module.exports = { mapDBSongToModel, mapDBPlaylistToResponse, mapDBPlaylistSongsToResponse, mapDBActivitiesToResponse }
