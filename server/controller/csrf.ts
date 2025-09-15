import { Request, Response, NextFunction } from 'express';
import * as session from 'express-session';
import { v4 as uuidv4 } from 'uuid';

// Add a declaration to augment the Express Request type with a session property.
declare module 'express-serve-static-core' {
	interface Request {
		session: session.Session & { csrfToken: string };
	}
}

/**
 * Middleware to protect against CSRF attacks by validating a token.
 * This middleware checks for a valid CSRF token in the 'x-csrf-token'
 * header for all HTTP methods except GET, HEAD, and OPTIONS.
 */
export const csrfMiddleware = (req: Request, res: Response, next: NextFunction) => {
	// Skip CSRF check for safe methods like GET, HEAD, and OPTIONS.
	if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
		return next();
	}

	const csrfToken = req.headers['x-csrf-token'];
	const sessionToken = req.session?.csrfToken;

	console.log('csrf' + csrfToken);
	console.log('session' + sessionToken);

	if (!csrfToken || csrfToken !== sessionToken) {
		return res.status(403).json({ error: 'Forbidden: Invalid CSRF token' });
	}

	next();
};

export const csfrToken = async (req: Request, res: Response) => {
	// Check if a CSRF token already exists in the session
	if (!req.session.csrfToken) {
		req.session.csrfToken = uuidv4();
	}
	res.json({ csrfToken: req.session.csrfToken });
};
