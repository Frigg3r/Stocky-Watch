const db = require('../db');

class PhotoController {
    async addPhoto(req, res) {
        const { id_item, url } = req.body;
        try {
            const newPhoto = await db.query(
                'INSERT INTO photo (id_item, photo) VALUES ($1, $2) RETURNING *',
                [id_item, url]
            );
            res.json(newPhoto.rows[0]);
        } catch (error) {
            console.error('Database error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async updatePhoto(req, res) {
        const { id } = req.params;
        const { url } = req.body;
        try {
            const photoExists = await db.query('SELECT * FROM photo WHERE id_item = $1', [id]);
            if (photoExists.rows.length === 0) {
                const newPhoto = await db.query(
                    'INSERT INTO photo (id_item, photo) VALUES ($1, $2) RETURNING *',
                    [id, url]
                );
                res.json(newPhoto.rows[0]);
            } else {
                const updatedPhoto = await db.query(
                    'UPDATE photo SET photo = $1 WHERE id_item = $2 RETURNING *',
                    [url, id]
                );
                res.json(updatedPhoto.rows[0]);
            }
        } catch (error) {
            console.error('Database error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}

module.exports = new PhotoController();
