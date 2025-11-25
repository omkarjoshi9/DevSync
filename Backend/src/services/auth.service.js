import { User } from '../models/User.js';
import { RefreshToken } from '../models/RefreshToken.js';
import { PasswordResetToken } from '../models/PasswordResetToken.js';
import { generateAccessToken, generateRefreshToken, verifyToken } from '../utils/jwt.js';
import { AuthenticationError, NotFoundError, ValidationError } from '../utils/errors.js';
import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger.js';

export class AuthService {
  static async register({ email, password, firstName, lastName }) {
    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      throw new ValidationError('Email already registered');
    }

    // Create user
    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
    });

    // Generate tokens
    const accessToken = generateAccessToken({ userId: user.id });
    const refreshToken = generateRefreshToken({ userId: user.id });

    // Store refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days
    await RefreshToken.create({
      userId: user.id,
      token: refreshToken,
      expiresAt,
    });

    logger.info('User registered', { userId: user.id, email });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        avatarUrl: user.avatar_url,
        subscriptionTier: user.subscription_tier,
      },
      accessToken,
      refreshToken,
    };
  }

  static async login({ email, password }) {
    const user = await User.findByEmail(email);
    if (!user) {
      throw new AuthenticationError('Invalid email or password');
    }

    if (!user.password_hash) {
      throw new AuthenticationError('Please use OAuth to login');
    }

    const isValid = await User.verifyPassword(user, password);
    if (!isValid) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Generate tokens
    const accessToken = generateAccessToken({ userId: user.id });
    const refreshToken = generateRefreshToken({ userId: user.id });

    // Store refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await RefreshToken.create({
      userId: user.id,
      token: refreshToken,
      expiresAt,
    });

    logger.info('User logged in', { userId: user.id, email });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        avatarUrl: user.avatar_url,
        subscriptionTier: user.subscription_tier,
      },
      accessToken,
      refreshToken,
    };
  }

  static async refreshAccessToken(refreshToken) {
    const tokenRecord = await RefreshToken.findByToken(refreshToken);
    if (!tokenRecord) {
      throw new AuthenticationError('Invalid refresh token');
    }

    const decoded = verifyToken(refreshToken);
    const user = await User.findById(decoded.userId);
    if (!user) {
      throw new NotFoundError('User');
    }

    // Delete old refresh token
    await RefreshToken.delete(refreshToken);

    // Generate new tokens
    const newAccessToken = generateAccessToken({ userId: user.id });
    const newRefreshToken = generateRefreshToken({ userId: user.id });

    // Store new refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await RefreshToken.create({
      userId: user.id,
      token: newRefreshToken,
      expiresAt,
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  static async logout(refreshToken) {
    if (refreshToken) {
      await RefreshToken.delete(refreshToken);
    }
    return { message: 'Logged out successfully' };
  }

  static async forgotPassword(email) {
    const user = await User.findByEmail(email);
    if (!user) {
      // Don't reveal if user exists
      return { message: 'If the email exists, a password reset link has been sent' };
    }

    // Generate reset token
    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour

    await PasswordResetToken.create({
      userId: user.id,
      token,
      expiresAt,
    });

    // TODO: Send email with reset link
    // await emailService.sendPasswordResetEmail(user.email, token);

    logger.info('Password reset requested', { userId: user.id, email });

    return { message: 'If the email exists, a password reset link has been sent' };
  }

  static async resetPassword(token, newPassword) {
    const tokenRecord = await PasswordResetToken.findByToken(token);
    if (!tokenRecord) {
      throw new ValidationError('Invalid or expired reset token');
    }

    await User.update(tokenRecord.user_id, { password: newPassword });
    await PasswordResetToken.markAsUsed(token);

    logger.info('Password reset completed', { userId: tokenRecord.user_id });

    return { message: 'Password reset successfully' };
  }

  static async googleAuth(idToken) {
    try {
      // If Google OAuth is not configured, provide helpful error
      if (!process.env.GOOGLE_CLIENT_ID) {
        throw new AuthenticationError('Google OAuth is not configured. Please set GOOGLE_CLIENT_ID in environment variables.');
      }

      // Verify Google ID token
      const { OAuth2Client } = await import('google-auth-library');
      const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
      
      const ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload) {
        throw new AuthenticationError('Invalid Google token');
      }

      const { sub: googleId, email, given_name: firstName, family_name: lastName, picture: avatarUrl } = payload;

      if (!email) {
        throw new AuthenticationError('Email not provided by Google');
      }

      // Check if user exists by Google ID
      let user = await User.findByGoogleId(googleId);

      if (!user) {
        // Check if user exists by email
        user = await User.findByEmail(email);
        
        if (user) {
          // Link Google account to existing user
          await User.update(user.id, { 
            googleId,
            avatarUrl: avatarUrl || user.avatar_url,
          });
        } else {
          // Create new user
          user = await User.create({
            email,
            firstName: firstName || 'User',
            lastName: lastName || '',
            googleId,
            avatarUrl,
            password: null, // No password for OAuth users
          });
        }
      } else {
        // Update avatar if changed
        if (avatarUrl && user.avatar_url !== avatarUrl) {
          await User.update(user.id, { avatarUrl });
          user.avatar_url = avatarUrl;
        }
      }

      // Generate tokens
      const accessToken = generateAccessToken({ userId: user.id });
      const refreshToken = generateRefreshToken({ userId: user.id });

      // Store refresh token
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);
      await RefreshToken.create({
        userId: user.id,
        token: refreshToken,
        expiresAt,
      });

      logger.info('User authenticated via Google', { userId: user.id, email });

      return {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          avatarUrl: user.avatar_url,
          subscriptionTier: user.subscription_tier,
        },
        accessToken,
        refreshToken,
      };
    } catch (error) {
      if (error instanceof AuthenticationError || error instanceof ValidationError) {
        throw error;
      }
      logger.error('Google OAuth error', { error: error.message });
      throw new AuthenticationError('Google authentication failed: ' + error.message);
    }
  }

  static async getCurrentUser(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User');
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      avatarUrl: user.avatar_url,
      subscriptionTier: user.subscription_tier,
      emailVerified: user.email_verified,
      createdAt: user.created_at,
    };
  }
}

