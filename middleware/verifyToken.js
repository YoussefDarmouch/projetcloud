const jwt = require("jsonwebtoken");
const path = require("path");

require('dotenv').config({ path: path.join(__dirname, '../.env') });

function verifyToken(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Token manquant' });
    }

    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Token invalide' });
    }
}

module.exports = verifyToken;
