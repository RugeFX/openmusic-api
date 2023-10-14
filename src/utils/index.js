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

module.exports = { mapDBSongToModel }
