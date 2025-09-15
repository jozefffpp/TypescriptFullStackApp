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

// Interface for the fields that can be updated
interface UserPayload {
	email?: string;
	name?: string;
	timezone_id?: number;
	country_id?: number;
}

/**
 * Express handler to edit a user and return the updated record.
 * It connects to the database, constructs a dynamic UPDATE query, and then
 * calls the existing get_users_with_scenarios function to return the result.
 */
export const editUser = async (req: Request, res: Response): Promise<void> => {
	const client = new Client(dbConfig);
	const userId = parseInt(req.params.id);
	const payload: UserPayload = req.body;

	// Validate the user ID from the URL parameter
	if (isNaN(userId)) {
		res.status(400).json({ message: 'Invalid user ID provided.' });
		return;
	}

	try {
		await client.connect();

		let setClauses: string[] = [];
		let queryParams: any[] = [];
		let paramIndex = 1;

		// Dynamically build the UPDATE query based on the payload
		// This ensures only the provided fields are updated
		if (payload.email !== undefined) {
			setClauses.push(`email = $${paramIndex++}`);
			queryParams.push(payload.email);
		}
		if (payload.name !== undefined) {
			setClauses.push(`name = $${paramIndex++}`);
			queryParams.push(payload.name);
		}
		if (payload.timezone_id !== undefined) {
			setClauses.push(`timezone_id = $${paramIndex++}`);
			queryParams.push(payload.timezone_id);
		}
		if (payload.country_id !== undefined) {
			setClauses.push(`country_id = $${paramIndex++}`);
			queryParams.push(payload.country_id);
		}

		// Check if there are any fields to update
		if (setClauses.length === 0) {
			res.status(400).json({ message: 'No fields provided to update.' });
			return;
		}

		// Add the WHERE clause and user ID to the query parameters
		queryParams.push(userId);
		const updateQuery = `UPDATE test.user SET ${setClauses.join(', ')} WHERE id = $${paramIndex}`;

		// Execute the dynamic UPDATE query
		await client.query(updateQuery, queryParams);

		// Fetch the single, updated record by calling the existing function
		const result = await client.query('SELECT * FROM test.get_users_with_scenarios($1, $2, $3, $4, $5, $6, $7)', [
			50, // pagination_limit (default)
			0,  // pagination_offset (default)
			'id', // sort_by (default)
			'ASC', // sort_dir (default)
			userId, // filter_id to get only this user
			null, // filter_name (not used)
			null  // filter_organization_id (not used)
		]);

		// Return the single updated record or a 404 if the user was not found
		if (result.rows.length > 0) {
			res.status(200).json({ user: result.rows[0] });
		} else {
			res.status(404).json({ message: 'User not found' });
		}

	} catch (error) {
		console.error('Error updating user:', error);
		res.status(500).json({ message: 'Internal Server Error', error: (error as Error).message });
	} finally {
		// Ensure the client connection is closed
		await client.end();
	}
};
