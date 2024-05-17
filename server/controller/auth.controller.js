const db = require('../db');
const md5 = require('md5');
const pidCrypt = require('pidcrypt');
require('pidcrypt/aes_cbc');

const aes = new pidCrypt.AES.CBC();
const cryptoKey = 'это_ключик_для_шифрования))';

class AuthController {
    async checkSession(req, res) {
        const sessionCookie = req.cookies['APP_SESSION'];
        console.log('Session cookie:', sessionCookie); // Debugging information
        const userName = aes.decryptText(sessionCookie, cryptoKey);
        console.log('Decrypted userName:', userName); // Debugging information
        const result = await db.query(
            'SELECT U.id, U.login, R.name as role FROM users U ' +
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
        console.log('Login request:', userRecord); // Debugging information
        const result = await db.query(
            'SELECT U.id, U.login, R.name as role FROM users U ' +
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
                    role: result.rows[0].role
                }
            };
        } else {
            response = { success: false };
        }
        console.log('Login response:', response); // Debugging information
        res.json(response);
    }

    async register(req, res) {
        const userRecord = req.body;
        console.log('Register request:', userRecord); // Debugging information
        const checkResult = await db.query('SELECT * FROM users WHERE login = $1', [userRecord.login]);
        let response;
        if (!checkResult.rows[0]) {
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
        } else {
            response = { success: false };
        }
        console.log('Register response:', response); // Debugging information
        res.json(response);
    }

    async logout(req, res) {
        res.clearCookie('APP_SESSION');
        console.log('Logout request received'); // Debugging information
        res.json({ success: true });
    }
}

module.exports = new AuthController();
