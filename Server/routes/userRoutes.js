import express from 'express';
import {
    getUserProfile,
    refreshToken,
    registerUser,
    userLogin
} from '../controllers/userControllers.js';
import { verifyToken, verifyUser } from '../middleware/authMiddleware.js';
const router = express.Router();

router.post('/users', registerUser);
router.post('/users/login', userLogin);
router.post('/users/refresh-token', refreshToken);
router.get('/users/me', verifyToken, verifyUser, getUserProfile);

export default router;
