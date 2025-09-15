import { Request, Response, NextFunction } from 'express';
// This is a dummy API key for demonstration purposes.
const VALID_API_KEY = 'key123';

// Middleware to authenticate requests using an API key
export const authenticateApiKey = (req: Request, res: Response, next: NextFunction) => {
	if (req.method === 'OPTIONS') {
		return next();
	}
	// Check for the 'x-api-key' header
	const apiKey = req.headers['x-api-key'];

	if (!apiKey) {
		return res.status(401).json({ error: 'Unauthorized: Missing API key' });
	}

	if (apiKey !== VALID_API_KEY) {
		return res.status(403).json({ error: 'Forbidden: Invalid API key' });
	}

	next();
};
