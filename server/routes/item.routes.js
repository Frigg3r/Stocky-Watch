const Router = require('express');
const router = new Router();
const itemController = require('../controller/item.controller');
const searchController = require('../controller/search.controller');
const favoriteController = require('../controller/favorite.controller');
const characteristicController = require('../controller/characteristic.controller');
const photoController = require('../controller/photo.controller'); 

router.post('/item', itemController.createItem);
router.get('/items', itemController.getItems);
router.get('/item/:id', itemController.getOneItem);
router.delete('/item/:id', itemController.deleteItem);
router.put('/item/:id', itemController.createItem);
router.get('/categories', itemController.getCategories);
router.get('/brands', itemController.getBrands);
router.get('/countries', itemController.getCountries);
router.get('/characteristics', characteristicController.getCharacteristics);
router.post('/characteristic', characteristicController.createCharacteristic);
router.put('/characteristic/:id', characteristicController.updateCharacteristic);
router.delete('/characteristic/:id', characteristicController.deleteCharacteristic);
router.get('/search', searchController.searchItems);
router.post('/favorites', favoriteController.addToFavorites);
router.get('/favorites/:userId', favoriteController.getFavorites);
router.delete('/favorites', favoriteController.removeFromFavorites);

router.post('/photo', photoController.addPhoto);
router.put('/photo/:id', photoController.updatePhoto);

// Добавление нового маршрута для получения характеристик по группам
router.get('/characteristics/by-group', characteristicController.getCharacteristicsByGroup);

router.get('/favorites/:userId/:itemId', favoriteController.getFavoriteStatus);


module.exports = router;
