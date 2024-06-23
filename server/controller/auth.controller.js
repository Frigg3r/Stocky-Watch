const db = require('../db');
const md5 = require('md5');
const pidCrypt = require('pidcrypt');
require('pidcrypt/aes_cbc');

const aes = new pidCrypt.AES.CBC();
const cryptoKey = 'это_ключик_для_шифрования))';

class AuthController {
    async checkSession(req, res) {
        const sessionCookie = req.cookies['APP_SESSION'];
        const userName = aes.decryptText(sessionCookie, cryptoKey);
        const result = await db.query(
            'SELECT U.id, U.login, U.name, U.lastname, U.email, U.phone, R.name as role FROM users U ' +
                'INNER JOIN roles R ON R.id = U.role ' +
                'WHERE U.login = $1',
            [userName]
        );
        if (result.rows[0]) {
            res.json({
                success: true,
                userInfo: {
                    id: result.rows[0].id,
                    login: result.rows[0].login,
                    name: result.rows[0].name,
                    lastname: result.rows[0].lastname,
                    email: result.rows[0].email,
                    phone: result.rows[0].phone,
                    role: result.rows[0].role
                }
            });
        } else {
            res.json({
                success: false
            });
        }
    }


    async login(req, res) {
        const userRecord = req.body;
        const result = await db.query(
            'SELECT U.id, U.login, U.name, U.lastname, U.email, U.phone, R.name as role FROM users U ' +
                'INNER JOIN roles R ON R.id = U.role ' +
                'WHERE U.login = $1 AND U.password = $2',
            [userRecord.login, md5(userRecord.password)]
        );
        let response;
        if (result.rows[0]) {
            res.cookie('APP_SESSION', aes.encryptText(userRecord.login, cryptoKey), {
                httpOnly: true
            });
            response = {
                success: true,
                userInfo: {
                    id: result.rows[0].id,
                    login: result.rows[0].login,
                    name: result.rows[0].name,
                    lastname: result.rows[0].lastname,
                    email: result.rows[0].email,
                    phone: result.rows[0].phone,
                    role: result.rows[0].role
                }
            };
        } else {
            response = { success: false };
        }
        res.json(response);
    }


    async register(req, res) {
        const userRecord = req.body;
        const checkResult = await db.query('SELECT * FROM users WHERE login = $1', [userRecord.login]);
        let response;
        if (checkResult.rows.length === 0) {
            const defaultRoleResult = await db.query('SELECT id FROM roles WHERE name = $1', ['user']);
            const defaultRoleId = defaultRoleResult.rows[0].id;
            await db.query('INSERT INTO users (login, password, role) values ($1, $2, $3)', [
                userRecord.login,
                md5(userRecord.password),
                defaultRoleId
            ]);
            const result = await db.query(
                'SELECT U.id, U.login, R.name as role FROM users U ' +
                'INNER JOIN roles R ON R.id = U.role ' +
                'WHERE U.login = $1',
                [userRecord.login]
            );
            res.cookie('APP_SESSION', aes.encryptText(userRecord.login, cryptoKey), {
                httpOnly: true
            });
            response = {
                success: true,
                userInfo: {
                    id: result.rows[0].id,
                    login: result.rows[0].login,
                    role: result.rows[0].role
                }
            };
            res.json(response);
        } else {
            response = { success: false, message: 'Login already exists' };
            res.status(400).json(response);
        }
    }    

    async logout(req, res) {
        res.clearCookie('APP_SESSION');
        console.log('Logout request received'); // Debugging information
        res.json({ success: true });
    }

    async getUser(req, res) {
        const userId = req.params.id;
        const result = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
        if (result.rows.length > 0) {
            res.json({
                success: true,
                userInfo: result.rows[0]
            });
        } else {
            res.status(404).json({ success: false, message: 'User not found' });
        }
    }

// auth.controller.js
async updateUser(req, res) {
    const userId = req.params.id;
    const { name, lastname, email, phone } = req.body;
    await db.query('UPDATE users SET name = $1, lastname = $2, email = $3, phone = $4 WHERE id = $5', [name, lastname, email, phone, userId]);
    const result = await db.query('SELECT U.id, U.login, U.name, U.lastname, U.email, U.phone, R.name as role FROM users U INNER JOIN roles R ON R.id = U.role WHERE U.id = $1', [userId]);
    if (result.rows.length > 0) {
        res.json({
            success: true,
            userInfo: {
                id: result.rows[0].id,
                login: result.rows[0].login,
                name: result.rows[0].name,
                lastname: result.rows[0].lastname,
                email: result.rows[0].email,
                phone: result.rows[0].phone,
                role: result.rows[0].role // убедитесь, что роль возвращается
            }
        });
    } else {
        res.status(500).json({ success: false, message: 'Failed to update user' });
    }
}

}

module.exports = new AuthController();
