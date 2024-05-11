const Router = require('express')
const router = new Router()
const itemController = require('../controller/item.controller')
const searchController = require('../controller/search.controller'); // Убедитесь, что путь правильный


router.post('/item', itemController.createItem)
router.get('/items', itemController.getItems)
router.get('/item/:id', itemController.getOneItem)
router.delete('/item/:id', itemController.deleteItem)
router.put('/item/:id', itemController.createItem); // Обработка обновления элемента
router.get('/search', searchController.searchItems);


module.exports = router