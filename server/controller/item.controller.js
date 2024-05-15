const db = require('../db');
const { checkUserRole } = require('../utils/check-user-role');

class ItemController {
    async createItem(req, res) {
        const userRole = await checkUserRole(req);
        if (userRole === 'admin') {
            const { id, name, description, id_brand, id_country, quantity, cost } = req.body;
            let item;
            if (id) {
                item = await db.query(
                    'UPDATE watch SET name = $1, description = $2, id_brand = $3, id_country = $4, quantity = $5, cost = $6 WHERE id = $7 RETURNING *',
                    [name, description, id_brand, id_country, quantity, cost, id]
                );
            } else {
                item = await db.query(
                    'INSERT INTO watch (name, description, id_brand, id_country, quantity, cost) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
                    [name, description, id_brand, id_country, quantity, cost]
                );
            }
            res.json(item.rows[0]);
        } else {
            res.status(403).send('You do not have rights to create/update items!');
        }
    }

    async getItems(req, res) {
        const { name } = req.query;
        try {
            let query = `
                SELECT w.*, p.photo, b.name AS brand_name, c.name AS country_name
                FROM watch w
                LEFT JOIN photo p ON w.id = p.id_item
                LEFT JOIN brand b ON w.id_brand = b.id_brand
                LEFT JOIN country c ON w.id_country = c.id_country
            `;
            let queryParams = [];
            if (name) {
                query += ` WHERE w.name ILIKE $1`; // Используем ILIKE для регистронезависимого поиска
                queryParams.push(`%${name}%`); // Обеспечиваем поиск с частичным соответствием
            }
            query += ' ORDER BY w.id';
            const items = await db.query(query, queryParams);
            res.json(items.rows);
        } catch (error) {
            console.error('Database error:', error);
            res.status(500).send('Internal server error');
        }
    }
    
    async getOneItem(req, res) {
        const id = req.params.id;
        const item = await db.query(`SELECT * FROM watch WHERE id = $1`, [id]);
        res.json(item.rows[0]);
    }

    async deleteItem(req, res) {
        const userRole = await checkUserRole(req);
        if (userRole === 'admin') {
            const id = req.params.id;
            await db.query(`DELETE FROM category_watch WHERE id_watch = $1`, [id]);
            await db.query(`DELETE FROM watch WHERE id = $1`, [id]);
            
            // Check if table is empty and reset sequence if it is
            const countResult = await db.query(`SELECT COUNT(*) FROM watch`);
            if (countResult.rows[0].count == 0) {
                await db.query(`ALTER SEQUENCE watch_id_seq RESTART WITH 1`);
            }

            res.json({ success: true });
        } else {
            res.status(403).send('You do not have rights to delete items!');
        }
    }
}

module.exports = new ItemController();
