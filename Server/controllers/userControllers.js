import bcrypt from 'bcryptjs';
import { collections } from '../config/db.js';

export async function registerUser(req, res) {
  const data = req.body;

  const isExist = await collections.users.findOne({ email: data.email });

  if (isExist) {
    return res.status(409).json({ message: 'User already exist' });
  }

  const hashPassword = await bcrypt.hash(data.password, 10);

  const newUser = {
    ...data,
    password: hashPassword,
    role: 'user',
    createdAt: new Date().toISOString(),
  };

  const result = await collections.users.insertOne(newUser);

  await res.status(201).json({ success: true, result });
}
