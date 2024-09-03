export function checkLoggedIn (req, res, next) {
if (!req.user) {
    return res.sendStatus(401).json({message: "Unauthorized"});
} 
    next();
  
};