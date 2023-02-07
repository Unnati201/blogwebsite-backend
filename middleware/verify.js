const jwt = require("jsonwebtoken");

module.exports = async (req, res, next) => {
  //Check for the token
  const token = await req.header("token");
  if (!token)
    return res.status(401).json({
      message: "Token does not exists!",
    });

  //Trying to Verify token
  const secretkey = "someprivatekey";

  try {
    jwt.verify(token, secretkey);
    next();
  } catch (err) {
    res.status(400).json({
      error: err,
    });
  }
};
