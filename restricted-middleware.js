module.exports = (req, res, next) => {
  console.log(req.session);
  console.log(req.session.user);
  
    if (req.session && req.session.user) {
      next();
    } else {
      res.status(401).json({ message: "Not authorized" });
    }
  };