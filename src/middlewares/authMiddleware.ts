// middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const checkAuth = (roles = []) => {
    return async (req, res, next) => {
        try {
            const token = req.headers.authorization.split(" ")[1]; // Bearer token
            if (!token) {
                return res.status(403).json({ message: "No token provided" });
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id);

            if (!user || (roles.length && !roles.includes(user.role))) {
                return res.status(403).json({ message: "Forbidden" });
            }

            req.user = user;
            next();
        } catch (error) {
            return res.status(401).json({ message: "Unauthorized" });
        }
    };
};

module.exports = checkAuth;
