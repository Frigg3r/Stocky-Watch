const db = require('../db');

class CharacteristicController {
    async getCharacteristics(req, res) {
        try {
            const characteristics = await db.query('SELECT * FROM characteristic');
            res.json(characteristics.rows);
        } catch (error) {
            console.error('Database error:', error);
            res.status(500).send('Internal server error');
        }
    }

    async createCharacteristic(req, res) {
        const { name } = req.body;
        try {
            const newCharacteristic = await db.query(
                'INSERT INTO characteristic (name) VALUES ($1) RETURNING *',
                [name]
            );
            res.json(newCharacteristic.rows[0]);
        } catch (error) {
            console.error('Database error:', error);
            res.status(500).send('Internal server error');
        }
    }

    async updateCharacteristic(req, res) {
        const { id } = req.params;
        const { name } = req.body;
        try {
            const updatedCharacteristic = await db.query(
                'UPDATE characteristic SET name = $1 WHERE id_characteristic = $2 RETURNING *',
                [name, id]
            );
            res.json(updatedCharacteristic.rows[0]);
        } catch (error) {
            console.error('Database error:', error);
            res.status(500).send('Internal server error');
        }
    }

    async deleteCharacteristic(req, res) {
        const { id } = req.params;
        try {
            await db.query('DELETE FROM characteristic WHERE id_characteristic = $1', [id]);
            res.json({ success: true });
        } catch (error) {
            console.error('Database error:', error);
            res.status(500).send('Internal server error');
        }
    }
}

module.exports = new CharacteristicController();
