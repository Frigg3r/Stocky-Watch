const db = require('../db');
const { checkUserRole } = require('../utils/check-user-role');

class ItemController {
    async createItem(req, res) {
        const userRole = await checkUserRole(req);
        if (userRole === 'admin') {
            const { id, name, description, id_brand, id_country, quantity, cost, categories, characteristics, photo } = req.body;
            let item;
            try {
                if (id) {
                    item = await db.query(
                        'UPDATE watch SET name = $1, description = $2, id_brand = $3, id_country = $4, quantity = $5, cost = $6 WHERE id = $7 RETURNING *',
                        [name, description, id_brand, id_country, quantity, cost, id]
                    );
                    await db.query('DELETE FROM category_watch WHERE id_watch = $1', [id]);
                    await db.query('DELETE FROM characteristic_watch WHERE id_watch = $1', [id]);
                    await db.query('DELETE FROM photo WHERE id_item = $1', [id]);
                } else {
                    item = await db.query(
                        'INSERT INTO watch (name, description, id_brand, id_country, quantity, cost) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
                        [name, description, id_brand, id_country, quantity, cost]
                    );
                }

                const itemId = item.rows[0].id;

                if (photo) {
                    await db.query(
                        'INSERT INTO photo (id_item, photo) VALUES ($1, $2) RETURNING *',
                        [itemId, photo]
                    );
                }

                if (categories && categories.length > 0) {
                    const insertCategories = categories.map(category_id => {
                        if (category_id !== null) {
                            return db.query('INSERT INTO category_watch (id_category, id_watch) VALUES ($1, $2)', [category_id, itemId]);
                        }
                    });
                    await Promise.all(insertCategories);
                }
                if (characteristics && characteristics.length > 0) {
                    const insertCharacteristics = characteristics.map(({ id_characteristic, value }) => {
                        if (id_characteristic !== null) {
                            return db.query('INSERT INTO characteristic_watch (id_characteristic, id_watch, value) VALUES ($1, $2, $3)', [id_characteristic, itemId, value]);
                        }
                    });
                    await Promise.all(insertCharacteristics);
                }
                res.json(item.rows[0]);
            } catch (error) {
                console.error('Database error:', error);
                res.status(500).send('Internal server error');
            }
        } else {
            res.status(403).send('You do not have rights to create/update items!');
        }
    }

    async getCategories(req, res) {
        try {
            const categories = await db.query('SELECT * FROM category');
            res.json(categories.rows);
        } catch (error) {
            console.error('Database error:', error);
            res.status(500).send('Internal server error');
        }
    }

    async getItems(req, res) {
        const { name, categories, characteristics } = req.query;
        try {
            console.log('Search params:', { name, categories, characteristics });

            let query = `
                SELECT w.*, p.photo, b.name AS brand_name, c.name AS country_name
                FROM watch w
                LEFT JOIN photo p ON w.id = p.id_item
                LEFT JOIN brand b ON w.id_brand = b.id_brand
                LEFT JOIN country c ON w.id_country = c.id_country
            `;
            let queryParams = [];
            let conditions = [];

            if (name) {
                conditions.push(`w.name ILIKE $${queryParams.length + 1}`);
                queryParams.push(`%${name}%`);
            }
            if (categories) {
                const categoryArray = categories.split(',');
                conditions.push(`w.id IN (
                    SELECT cw.id_watch FROM category_watch cw WHERE cw.id_category = ANY($${queryParams.length + 1}::int[])
                )`);
                queryParams.push(categoryArray);
            }
            if (characteristics) {
                const characteristicArray = characteristics.split(',');
                conditions.push(`w.id IN (
                    SELECT cw.id_watch FROM characteristic_watch cw WHERE cw.id_characteristic = ANY($${queryParams.length + 1}::int[])
                )`);
                queryParams.push(characteristicArray);
            }
            if (conditions.length > 0) {
                query += ' WHERE ' + conditions.join(' AND ');
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
        try {
            const item = await db.query(
                `SELECT w.*, b.name AS brand_name, c.name AS country_name, p.photo AS photo 
                 FROM watch w 
                 LEFT JOIN brand b ON w.id_brand = b.id_brand 
                 LEFT JOIN country c ON w.id_country = c.id_country 
                 LEFT JOIN photo p ON w.id = p.id_item 
                 WHERE w.id = $1`, 
                 [id]
            );
            const categories = await db.query('SELECT id_category FROM category_watch WHERE id_watch = $1', [id]);
            const characteristics = await db.query('SELECT * FROM characteristic_watch WHERE id_watch = $1', [id]);
    
            res.json({
                ...item.rows[0],
                categories: categories.rows.map(row => row.id_category),
                characteristics: characteristics.rows.map(row => ({ id_characteristic: row.id_characteristic, value: row.value }))
            });
        } catch (error) {
            console.error('Error fetching item:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async deleteItem(req, res) {
        const userRole = await checkUserRole(req);
        if (userRole === 'admin') {
            const id = req.params.id;
            try {
                await db.query(`DELETE FROM category_watch WHERE id_watch = $1`, [id]);
                await db.query(`DELETE FROM characteristic_watch WHERE id_watch = $1`, [id]);
                await db.query(`DELETE FROM photo WHERE id_item = $1`, [id]);
                await db.query(`DELETE FROM watch WHERE id = $1`, [id]);
                
                // Check if table is empty and reset sequence if it is
                const countResult = await db.query(`SELECT COUNT(*) FROM watch`);
                if (countResult.rows[0].count == 0) {
                    await db.query(`ALTER SEQUENCE watch_id_seq RESTART WITH 1`);
                }
    
                res.json({ success: true });
            } catch (error) {
                console.error('Error deleting item:', error);
                res.status(500).json({ error: 'Internal server error' });
            }
        } else {
            res.status(403).send('You do not have rights to delete items!');
        }
    }

    async getBrands(req, res) {
        try {
            const brands = await db.query('SELECT id_brand, name FROM brand');
            res.json(brands.rows);
        } catch (error) {
            console.error('Database error:', error);
            res.status(500).send('Internal server error');
        }
    }

    async getCountries(req, res) {
        try {
            const countries = await db.query('SELECT id_country, name FROM country');
            res.json(countries.rows);
        } catch (error) {
            console.error('Database error:', error);
            res.status(500).send('Internal server error');
        }
    }
}

module.exports = new ItemController();
