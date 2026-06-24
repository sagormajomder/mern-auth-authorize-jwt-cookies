import jwt from 'jsonwebtoken';

export async function verifyToken(req, res, next) {
  const cookies = req.cookies;
  if (!cookies?.accessToken) {
    return res.status(401).json({ message: 'Unauthorized access' });
  }

  const accessToken = cookies.accessToken;
  jwt.verify(accessToken, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error('Middleware: JWT Verification Failed:', err.message);
      return res.status(401).send({ message: 'Unauthorized access' });
    }
    req.user = decoded;
    next();
  });
}

// Middleware to verify User role
export const verifyUser = (req, res, next) => {
  const { user } = req.user;
  console.log(user);
  if (user && user.role === 'user') {
    next();
  } else {
    res.status(403).json({ message: 'Forbidden access' });
  }
};
