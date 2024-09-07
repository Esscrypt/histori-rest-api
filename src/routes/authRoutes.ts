import { Router } from 'express';
import { register, login, refreshToken, forgotPassword, resetPassword } from '../controllers/authController';

const router = Router();

/**
 * @swagger
 * /register:
 *   post:
 *     description: Register a new user
 *     responses:
 *       200:
 *         description: User registered successfully
 */
router.post('/register', register);

/**
 * @swagger
 * /login:
 *   post:
 *     description: Login a user
 *     responses:
 *       200:
 *         description: User logged in successfully
 */
router.post('/login', login);

/**
 * @swagger
 * /refresh-token:
 *   post:
 *     description: Refresh the access token
 *     responses:
 *       200:
 *         description: Access token refreshed
 */
router.post('/refresh-token', refreshToken);

/**
 * @swagger
 * /forgot-password:
 *   post:
 *     description: Request a password reset
 *     responses:
 *       200:
 *         description: Password reset email sent
 */
router.post('/forgot-password', forgotPassword);

/**
 * @swagger
 * /reset-password:
 *   post:
 *     description: Reset a user's password
 *     responses:
 *       200:
 *         description: Password reset successfully
 */
router.post('/reset-password', resetPassword);

export default router;
