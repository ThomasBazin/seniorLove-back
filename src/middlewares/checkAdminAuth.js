export function checkAdminAuth(req, res, next) {
  if (!req.session.admin) {
    return res.status(401).render('error', {
      statusCode: 401,
      error: 'Unauthorized',
      skipHeader: true,
    });
  }
  next();
}
