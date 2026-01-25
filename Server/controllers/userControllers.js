import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { collections } from '../config/db.js';

export async function getUserProfile(req, res) {
  const { email } = req.query;

  const user = await collections.users.findOne({ email });

  res.status(200).json(user);
}

export async function registerUser(req, res) {
  const data = req.body;

  const isExist = await collections.users.findOne({ email: data.email });

  if (isExist) {
    return res
      .status(409)
      .json({ success: false, message: 'User already exist' });
  }

  const hashPassword = await bcrypt.hash(data.password, 10);

  const newUser = {
    email: data.email,
    name: data.name,
    password: hashPassword,
    role: 'user',
    createdAt: new Date().toISOString(),
  };

  const result = await collections.users.insertOne(newUser);

  await res.status(201).json({ success: true, result });
}

export async function userLogin(req, res) {
  const body = req.body;

  const user = await collections.users.findOne({ email: body.email });

  if (!user) {
    return res
      .status(404)
      .json({ success: false, message: 'Invalid user email or password' });
  }

  const isPassMatch = await bcrypt.compare(body.password, user.password);

  if (!isPassMatch) {
    return res
      .status(404)
      .json({ success: false, message: 'Invalid user email or password' });
  }

  const { password: _, ...withoutPasswordUser } = user;

  const token = jwt.sign(
    { user: withoutPasswordUser },
    process.env.JWT_SECRET,
    {
      expiresIn: '1h',
    },
  );

  const refreshToken = jwt.sign(
    { user: withoutPasswordUser },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: '1h',
    },
  );

  // set accessToken
  res.cookie('accessToken', token, {
    httpOnly: true,
    secret: false,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000,
  });

  // set refresh token
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secret: false,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({ success: true, user: withoutPasswordUser });
}

export async function refreshToken(req, res) {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res.status(401).json({ message: 'No refresh token provided' });
    }

    jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET,
      (err, decoded) => {
        if (err) {
          return res.status(403).json({ message: 'Invalid refresh token' });
        }

        const { user } = decoded;
        const accessToken = jwt.sign({ user }, process.env.JWT_SECRET, {
          expiresIn: '1h',
        });

        res.cookie('accessToken', accessToken, {
          httpOnly: true,
          secret: false,
          sameSite: 'lax',
          maxAge: 24 * 60 * 60 * 1000,
        });

        res.status(200).json({ success: true, accessToken });
      }
    );
  } catch (error) {
    console.error('Refresh Token Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
