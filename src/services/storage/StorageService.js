const fs = require('fs')

class StorageService {
  /**
       * @param {string} folder
       */
  constructor (folder) {
    this._folder = folder

    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true })
    }
  }

  /**
       * @param {import("stream").Readable} file
       * @param {{ filename: string, headers: object }} meta
       * @returns {Promise<string>}
      */
  writeFile (file, meta) {
    const filename = +new Date() + meta.filename
    const path = `${this._folder}/${filename}`

    const fileStream = fs.createWriteStream(path)

    return new Promise((resolve, reject) => {
      fileStream.on('error', (error) => reject(error))
      file.pipe(fileStream)
      file.on('end', () => resolve(filename))
    })
  }

  /**
       * @param {string} filename
       */
  deleteFile (filename) {
    return fs.promises.unlink(`${this._folder}/${filename}`)
  }
}

module.exports = StorageService
