const db = require('../db');

class SearchController {
    async searchItems(req, res) {
        const { name, categories, Водозащита, Материал, Форма, id_brand, id_country } = req.query;
        // Убираем строки с логированием
        // console.log(`Search params - name: ${name}, categories: ${categories}, Водозащита: ${Водозащита}, Материал: ${Материал}, Форма: ${Форма}, id_brand: ${id_brand}, id_country: ${id_country}`);

        let query = `
            SELECT w.*, p.photo, b.name AS brand_name, c.name AS country_name
            FROM watch w
            LEFT JOIN photo p ON w.id = p.id_item
            LEFT JOIN brand b ON w.id_brand = b.id_brand
            LEFT JOIN country c ON w.id_country = c.id_country
        `;
        let queryParams = [];
        let whereClauses = [];

        if (name) {
            whereClauses.push(`w.name ILIKE $${whereClauses.length + 1}`);
            queryParams.push(`%${name}%`);
        }

        if (categories) {
            const categoryIds = categories.split(',').map(id => parseInt(id, 10));
            whereClauses.push(`EXISTS (SELECT 1 FROM category_watch cw WHERE cw.id_watch = w.id AND cw.id_category = ANY($${whereClauses.length + 1}::int[]))`);
            queryParams.push(categoryIds);
        }

        if (Водозащита) {
            const waterResistanceValues = Водозащита.split(',');
            whereClauses.push(`EXISTS (SELECT 1 FROM characteristic_watch ch 
                                   JOIN characteristic c ON ch.id_characteristic = c.id_characteristic 
                                   WHERE ch.id_watch = w.id AND c.name ILIKE 'Водозащита%' AND ch.value = ANY($${whereClauses.length + 1}))`);
            queryParams.push(waterResistanceValues);
        }

        if (Материал) {
            const materialValues = Материал.split(',');
            whereClauses.push(`EXISTS (SELECT 1 FROM characteristic_watch ch 
                                   JOIN characteristic c ON ch.id_characteristic = c.id_characteristic 
                                   WHERE ch.id_watch = w.id AND c.name ILIKE 'Материал%' AND ch.value = ANY($${whereClauses.length + 1}))`);
            queryParams.push(materialValues);
        }

        if (Форма) {
            const shapeValues = Форма.split(',');
            whereClauses.push(`EXISTS (SELECT 1 FROM characteristic_watch ch 
                                   JOIN characteristic c ON ch.id_characteristic = c.id_characteristic 
                                   WHERE ch.id_watch = w.id AND c.name ILIKE 'Форма%' AND ch.value = ANY($${whereClauses.length + 1}))`);
            queryParams.push(shapeValues);
        }

        if (id_brand) {
            whereClauses.push(`w.id_brand = $${whereClauses.length + 1}`);
            queryParams.push(id_brand);
        }

        if (id_country) {
            whereClauses.push(`w.id_country = $${whereClauses.length + 1}`);
            queryParams.push(id_country);
        }

        if (whereClauses.length > 0) {
            query += ` WHERE ${whereClauses.join(' AND ')}`;
        }

        query += ' ORDER BY w.id';

        // Убираем строки с логированием
        // console.log('SQL Query:', query);
        // console.log('Query Params:', queryParams);

        try {
            const items = await db.query(query, queryParams);
            res.json(items.rows);
        } catch (error) {
            console.error('Database error:', error);
            res.status(500).send('Internal server error');
        }
    }
}

module.exports = new SearchController();
