import { Request, Response } from 'express';
import { Client } from 'pg';
import { DB_USER, DB_PASSWORD, DB_NAME, DB_HOST, DB_PORT } from '../db_credentials';

// The database connection configuration
const dbConfig = {
	user: DB_USER,
	host: DB_HOST,
	database: DB_NAME,
	password: DB_PASSWORD,
	port: DB_PORT,
};

export const getUserById = async (req: Request, res: Response): Promise<void> => {
	const client = new Client(dbConfig);
	const userId = parseInt(req.params.id, 10);

	// Check if the ID is a valid number.
	if (isNaN(userId)) {
		res.status(400).json({ error: 'Bad Request: User ID must be a number.' });
		return;
	}

	try {
		await client.connect();
		const queryText = `SELECT * FROM test."user" WHERE id = $1`;
		const result = await client.query(queryText, [userId]);

		if (result.rows.length === 0) {
			res.status(404).json({ error: 'Not Found: User not found.' });
		} else {
			res.json({ user: result.rows[0] });
		}
	} catch (error) {
		console.error('Error fetching user from database:', error);
		res.status(500).json({ error: 'Internal Server Error' });
	} finally {
		await client.end();
	}
};
