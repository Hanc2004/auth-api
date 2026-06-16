const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  // 1. Get the token from the Authorization header
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided, access denied' });
  }

  // 2. Extract just the token (remove "Bearer " prefix)
  const token = authHeader.split(' ')[1];

  try {
    // 3. Verify the token using our secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Attach the decoded user info to the request object
    req.user = decoded;

    // 5. Let the request continue to the actual route
    next();

  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = protect;