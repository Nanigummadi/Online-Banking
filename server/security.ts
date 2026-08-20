import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { db } from './db';
import { UserEntity, UserRole } from './types';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_digital_wallet_production_2026_xyz';
const JWT_EXPIRES_IN = '24h';

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  fullName: string;
}

export interface AuthenticatedRequest extends Request {
  user?: UserEntity;
  tokenPayload?: JwtPayload;
}

export function generateToken(user: UserEntity): string {
  const payload: JwtPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    fullName: user.fullName,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}

// Authentication Filter
export function authenticateJWT(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Full authentication is required to access this resource. Missing Bearer token.',
      timestamp: new Date().toISOString(),
    });
  }

  const token = authHeader.substring(7).trim();
  try {
    const payload = verifyToken(token);
    const user = db.findUserById(payload.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The token belongs to a user that no longer exists.',
        timestamp: new Date().toISOString(),
      });
    }

    if (user.status !== 'ACTIVE') {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Access denied.',
        timestamp: new Date().toISOString(),
      });
    }

    req.user = user;
    req.tokenPayload = payload;
    next();
  } catch (err: any) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired JWT token. Please log in again.',
      timestamp: new Date().toISOString(),
    });
  }
}

// Role Authorization Filter
export function authorizeRoles(...allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized access.',
        timestamp: new Date().toISOString(),
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Requires one of the following roles: [${allowedRoles.join(', ')}]. Current role: ${req.user.role}`,
        timestamp: new Date().toISOString(),
      });
    }

    next();
  };
}
