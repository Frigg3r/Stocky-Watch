const db = require('../db');

class SearchController {
    async searchItems(req, res) {
        const { name } = req.query;
        console.log(`Search for name: ${name}`); // Проверьте, что сервер получает параметр
        if (!name) {
            return res.status(400).json({ error: "Name parameter is required" });
        }
        try {
            const result = await db.query(
                `SELECT * FROM watch WHERE name ILIKE $1`, [`%${name}%`]
            );
            console.log('DB search result:', result.rows);  // Убедитесь, что запрос возвращает результат
            res.json(result.rows);
        } catch (error) {
            console.error('Database error:', error);
            res.status(500).send('Internal server error');
        }
    }
}

module.exports = new SearchController();
