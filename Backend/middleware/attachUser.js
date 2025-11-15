// backend/middleware/attachUser.js
const User = require('../models/User');

async function attachUser(req, _res, next) {
  try {
    const id = req.header('x-user-id');
    if (!id) return next();
    const user = await User.findById(id);
    if (user) req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = attachUser;
