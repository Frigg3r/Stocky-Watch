const Router = require('express');
const router = new Router();
const itemController = require('../controller/item.controller');
const searchController = require('../controller/search.controller');
const favoriteController = require('../controller/favorite.controller');

router.post('/item', itemController.createItem);

router.get('/items', itemController.getItems);

router.get('/item/:id', itemController.getOneItem);

router.delete('/item/:id', itemController.deleteItem);

router.put('/item/:id', itemController.createItem);

router.get('/search', searchController.searchItems);

router.post('/favorites', favoriteController.addToFavorites);
router.get('/favorites/:userId', favoriteController.getFavorites);
router.delete('/favorites', favoriteController.removeFromFavorites);

module.exports = router;
