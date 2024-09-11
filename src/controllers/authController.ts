import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User } from '../models/user';
import logger from '../middleware/logger'; // Assuming you have a Winston logger
import { sendResetEmail } from '../config/mailer';

// Generate access token
const generateAccessToken = (user: User) => {
  return jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET!, { expiresIn: process.env.JWT_EXPIRATION });
};

// Generate refresh token
const generateRefreshToken = (user: User) => {
  return jwt.sign({ userId: user.id, email: user.email }, process.env.REFRESH_TOKEN_SECRET!, { expiresIn: process.env.REFRESH_TOKEN_EXPIRATION });
};

export const register = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    // Log the registration attempt
    logger.info(`Attempt to register user with email: ${email}`);

    // Check if the user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      logger.warn(`Registration failed - User with email ${email} already exists`);
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password
    // const hashedPassword = await bcrypt.hash(password, parseInt(process.env.SALT_ROUNDS!, 10));
    // logger.info(`Password hashed for email: ${email}`);

    // Create the new user
    const newUser = await User.create({ email, password: password });

    // Generate access and refresh tokens
    const accessToken = generateAccessToken(newUser);
    const refreshToken = generateRefreshToken(newUser);

    // Save refresh token to the user
    newUser.refreshToken = refreshToken;
    await newUser.save();

    // Log successful registration
    logger.info(`User registered successfully with email: ${email}`);

    // Send tokens as response
    res.status(201).json({ accessToken, refreshToken });
  } catch (error: any) {
    // Log the error details
    logger.error(`Error during registration for email: ${email}, Error: ${error.message}`);

    res.status(500).json({ message: 'Server error' });
  }
};


// Login User
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    // Log the login attempt
    logger.info(`Login attempt with email: ${email}`);

    // Check if the user exists
    const user = await User.findOne({ where: { email } });
    if (!user) {
      logger.warn(`Login failed - No user found with email: ${email}`);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if the password is valid
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      logger.warn(`Login failed - Invalid password for email: ${email}`);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate access and refresh tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Save refresh token to the user
    user.refreshToken = refreshToken;
    await user.save();

    // Log successful login
    logger.info(`User logged in successfully with email: ${email}`);

    // Send tokens as response
    res.json({ accessToken, refreshToken });
  } catch (error: any) {
    // Log any server error that occurs
    logger.error(`Error during login for email: ${email}, Error: ${error.message}`);
    res.status(500).json({ message: 'Server error' });
  }
};

// Refresh Token
export const refreshToken = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ message: 'Refresh token required' });

  try {
    const decoded: any = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!);
    const user = await User.findOne({ where: { id: decoded.userId, refreshToken } });

    if (!user) return res.status(403).json({ message: 'Invalid refresh token' });

    const newAccessToken = generateAccessToken(user);
    res.json({ accessToken: newAccessToken });
  } catch (error) {
    res.status(403).json({ message: 'Invalid refresh token' });
  }
};

// Forgot Password
export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ message: 'User does not exist' });

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetToken = resetToken;
    user.resetTokenExpiration = new Date(Date.now() + 3600000); // 1 hour expiration
    await user.save();

    await sendResetEmail(user, resetToken);
    res.json({ message: 'Password reset link sent to your email' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
export const resetPassword = async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;

  try {
    // Fetch the user with the reset token
    const user = await User.findOne({ where: { resetToken: token } });

    if (!user) {
      logger.warn(`No user found with reset token: ${token}`);
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    // Log the current time and token expiration time for debugging
    const currentTime = new Date();
    const tokenExpiration = user.resetTokenExpiration;

    logger.info(`Current time: ${currentTime.toISOString()}`);
    logger.info(`Token expiration time: ${tokenExpiration?.toISOString()}`);

    // Check if the token is expired
    if (!tokenExpiration || currentTime > tokenExpiration) {
      logger.warn(`Reset token expired for user: ${user.email}`);
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    // Hash the new password and reset token fields
    user.password = newPassword;
    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;
    await user.save();

    logger.info(`Password reset successfully for user: ${user.email}`);
    res.json({ message: 'Password reset successfully' });
  } catch (error: any) {
    logger.error(`Error resetting password: ${error.message}`);
    res.status(500).json({ message: 'Server error' });
  }
};
