const db = require('../db');

class CharacteristicController {
    async getCharacteristics(req, res) {
        try {
            const characteristics = await db.query('SELECT * FROM characteristic ORDER BY id_characteristic ASC');
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

    async getCharacteristicGroups(req, res) {
        try {
            const characteristicGroups = await db.query('SELECT * FROM characteristic_group ORDER BY id_group ASC');
            res.json(characteristicGroups.rows);
        } catch (error) {
            console.error('Database error:', error);
            res.status(500).send('Internal server error');
        }
    }

    async getCharacteristicsByGroup(req, res) {
        const { group } = req.query;
        try {
            const characteristics = await db.query(
                'SELECT * FROM characteristic WHERE name LIKE $1',
                [`${group}%`]
            );
            res.json(characteristics.rows);
        } catch (error) {
            console.error('Database error:', error);
            res.status(500).send('Internal server error');
        }
    }
}

module.exports = new CharacteristicController();
