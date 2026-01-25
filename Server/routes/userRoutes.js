import express from 'express';
import { registerUser, userLogin } from '../controllers/userControllers.js';
const router = express.Router();

router.post('/users', registerUser);
router.post('/users/login', userLogin);

export default router;
