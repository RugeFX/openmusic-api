const config = {
    app: {
        host: process.env.HOST || 'localhost',
        port: process.env.PORT || 5000,
    },
    token: {
        accessTokenKey: process.env.ACCESS_TOKEN_KEY,
        accessTokenAge: parseInt(process.env.ACCESS_TOKEN_AGE),
        refreshTokenKey: process.env.REFRESH_TOKEN_KEY,
    },
    postgres: {
        user: process.env.PGUSER || 'postgres',
        password: process.env.PGPASSWORD || 'password',
        database: process.env.PGDATABASE || 'openmusic',
        host: process.env.PGHOST || 'localhost',
        port: process.env.PGPORT || 5432
    },
    s3: {
        bucketName: process.env.AWS_BUCKET_NAME,
    },
    rabbitMq: {
        server: process.env.RABBITMQ_SERVER,
    },
    redis: {
        host: process.env.REDIS_SERVER,
    },
}

module.exports = config