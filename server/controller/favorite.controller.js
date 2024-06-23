const db = require('../db');

class FavoriteController {
    async addToFavorites(req, res) {
        const { userId, itemId } = req.body;
        console.log('Add to favorites request:', req.body); // Debugging information
        try {
            console.log('Before DB query'); // Debugging information
            const result = await db.query('INSERT INTO favorite (id_user, id_watch) VALUES ($1, $2) RETURNING *', [userId, itemId]);
            console.log('DB query result:', result.rows); // Debugging information
            res.json(result.rows[0]);
        } catch (error) {
            console.error('Error adding to favorites:', error); // Debugging information
            res.status(500).send('Error adding to favorites: ' + error.message);
        }
    }

    async getFavorites(req, res) {
        const { userId } = req.params;
        try {
            const result = await db.query(`
                SELECT w.*, p.photo 
                FROM favorite f
                JOIN watch w ON f.id_watch = w.id
                LEFT JOIN photo p ON w.id = p.id_item
                WHERE f.id_user = $1
            `, [userId]);
            res.json(result.rows);
        } catch (error) {
            console.error('Error retrieving favorites:', error); // Debugging information
            res.status(500).send('Error retrieving favorites: ' + error.message);
        }
    }

    async removeFromFavorites(req, res) {
        const { userId, itemId } = req.body;
        console.log('Remove from favorites request:', req.body); // Debugging information
        try {
            const result = await db.query('DELETE FROM favorite WHERE id_user = $1 AND id_watch = $2 RETURNING *', [userId, itemId]);
            console.log('DB query result:', result.rows); // Debugging information
            if (result.rowCount > 0) {
                res.json({ message: 'Item removed from favorites' });
            } else {
                res.status(404).json({ message: 'Item not found in favorites' });
            }
        } catch (error) {
            console.error('Error removing from favorites:', error); // Debugging information
            res.status(500).json({ message: 'Error removing from favorites: ' + error.message });
        }
    }

    async getFavoriteStatus(req, res) {
        const { userId, itemId } = req.params;
        try {
            const result = await db.query(
                'SELECT * FROM favorite WHERE id_user = $1 AND id_watch = $2',
                [userId, itemId]
            );
            res.json(result.rows.length > 0);
        } catch (error) {
            console.error('Error getting favorite status:', error);
            res.status(500).send('Error getting favorite status: ' + error.message);
        }
    }
}

module.exports = new FavoriteController();
