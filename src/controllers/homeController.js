const authService = require('../services/authService');
const { homePathForRole } = require('../utils/authHelper');

class HomeController {
  index(req, res) {
    const token = req.cookies?.equiwork_token;
    if (token) {
      try {
        const payload = authService.verifyToken(token);
        return res.redirect(homePathForRole(payload.rol));
      } catch {
        res.clearCookie('equiwork_token');
      }
    }
    res.redirect('/login');
  }
}

module.exports = new HomeController();
