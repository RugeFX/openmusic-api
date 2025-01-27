const redis = require('redis');
const config = require('../../utils/config');

class CacheService {
    constructor() {
        this._client = redis.createClient({
            socket: {
                host: config.redis.host,
            },
        });

        this._client.on('error', (error) => {
            console.error(error);
        });

        this._client.connect();
    }

    /**
     * @param {string} key 
     * @param {string} value 
     * @param {number} expirationInSecond 
     */
    async set(key, value, expirationInSecond = 3600) {
        await this._client.set(key, value, {
            EX: expirationInSecond,
        });
    }

    /**
     * @param {string} key 
     */
    async get(key) {
        const result = await this._client.get(key);

        if (result === null) throw new Error('Cache tidak ditemukan');

        return result;
    }

    /**
     * @param {string} key 
     */
    delete(key) {
        return this._client.del(key);
    }
}

module.exports = CacheService;