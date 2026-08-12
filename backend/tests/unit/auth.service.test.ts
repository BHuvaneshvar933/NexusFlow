import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { AuthService } from '../../src/modules/auth/auth.service';
import { prisma } from '../../src/config/database';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

jest.mock('../../src/config/database', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

jest.mock('bcryptjs', () => ({
  genSalt: (jest.fn() as any).mockResolvedValue('salt'),
  hash: (jest.fn() as any).mockResolvedValue('hashed_password'),
  compare: jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('mocked_token'),
}));

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('registerUser', () => {
    it('should successfully register a new user and return token', async () => {
      (prisma.user.findUnique as any).mockResolvedValue(null);
      (prisma.user.create as any).mockResolvedValue({
        id: 'user_1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user',
        password: 'hashed_password'
      });

      const result = await AuthService.registerUser({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      });

      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 'salt');
      expect(prisma.user.create).toHaveBeenCalled();
      expect(jwt.sign).toHaveBeenCalled();
      
      expect(result).toEqual({
        user: {
          id: 'user_1',
          name: 'Test User',
          email: 'test@example.com',
          role: 'user',
        },
        token: 'mocked_token'
      });
    });

    it('should throw an error if the user already exists', async () => {
      (prisma.user.findUnique as any).mockResolvedValue({ id: 'existing_user' });

      await expect(
        AuthService.registerUser({ name: 'Test', email: 'exist@example.com', password: 'pw' })
      ).rejects.toThrow('User already exists');

      expect(prisma.user.create).not.toHaveBeenCalled();
    });
  });

  describe('loginUser', () => {
    it('should successfully login and return a token for valid credentials', async () => {
      (prisma.user.findUnique as any).mockResolvedValue({
        id: 'user_1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user',
        password: 'hashed_password'
      });
      (bcrypt.compare as any).mockResolvedValue(true);

      const result = await AuthService.loginUser({
        email: 'test@example.com',
        password: 'password123'
      });

      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashed_password');
      expect(jwt.sign).toHaveBeenCalled();
      expect(result.token).toBe('mocked_token');
    });

    it('should throw an error for nonexistent user', async () => {
      (prisma.user.findUnique as any).mockResolvedValue(null);

      await expect(
        AuthService.loginUser({ email: 'nonexistent@example.com', password: 'pw' })
      ).rejects.toThrow('Invalid email or password');
    });

    it('should throw an error for invalid password', async () => {
      (prisma.user.findUnique as any).mockResolvedValue({
        id: 'user_1',
        email: 'test@example.com',
        password: 'hashed_password'
      });
      (bcrypt.compare as any).mockResolvedValue(false);

      await expect(
        AuthService.loginUser({ email: 'test@example.com', password: 'wrong' })
      ).rejects.toThrow('Invalid email or password');
    });
  });
});
