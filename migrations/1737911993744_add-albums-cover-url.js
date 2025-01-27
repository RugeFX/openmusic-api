/** @param {import('node-pg-migrate').MigrationBuilder} pgm */
exports.up = pgm => {
    pgm.addColumns('albums', {
        cover_url: {
            type: 'TEXT',
            notNull: false
        }
    });
};

/** @param {import('node-pg-migrate').MigrationBuilder} pgm */
exports.down = pgm => {
    pgm.dropColumns('albums', 'cover_url');
};
