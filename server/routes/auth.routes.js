const Router = require('express');
const router = new Router();
const authController = require('../controller/auth.controller');

router.post('/login', authController.login);
router.post('/register', authController.register);
router.get('/logout', authController.logout); // Убедитесь, что маршрут для выхода существует
router.get('/checkSession', authController.checkSession);
router.get('/user/:id', authController.getUser); // Новый маршрут для получения информации о пользователе
router.put('/user/:id', authController.updateUser); // Новый маршрут для обновления информации о пользователе

module.exports = router;
