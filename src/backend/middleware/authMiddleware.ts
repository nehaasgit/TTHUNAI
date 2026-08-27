import { Request, Response, NextFunction } from 'express';
import { Database } from '../utils/db.js';
import { verifyIdToken } from '../utils/firebaseAdmin.js';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'No authorization token provided' });
    return;
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Invalid authorization token format' });
    return;
  }

  try {
    const decoded = await verifyIdToken(token);
    if (!decoded) {
      res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
      return;
    }

    const { uid, phoneNumber } = decoded;

    // Look up the user by id, firebaseUID, or phoneNumber
    const users = Database.getUsers();
    let user = users.find(u => u.id === uid || u.firebaseUID === uid);

    if (!user && phoneNumber) {
      // Clean phone numbers to compare
      const cleanPhone = phoneNumber.replace(/\D/g, '').slice(-10);
      user = users.find(u => {
        const uPhone = u.phoneNumber.replace(/\D/g, '').slice(-10);
        return uPhone === cleanPhone;
      });

      if (user) {
        // Update user to bind Firebase UID and Authentication Provider
        Database.updateUser(user.id, {
          firebaseUID: uid,
          authenticationProvider: 'phone'
        });
        // Retrieve updated user
        user = Database.findUserById(user.id) || user;
      }
    }

    if (!user) {
      // If user is verified on Firebase Auth but hasn't completed profile,
      // create a placeholder user so they can complete profile setup
      const newUser = {
        id: uid,
        phoneNumber: phoneNumber || '',
        firebaseUID: uid,
        authenticationProvider: 'phone',
        profileSetupCompleted: false,
      };
      Database.createUser(newUser);
      req.user = newUser;
    } else {
      req.user = user;
    }

    next();
  } catch (error) {
    console.error('Error verifying authorization token:', error);
    res.status(401).json({ error: 'Unauthorized: Verification failed' });
  }
};
