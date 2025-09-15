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

/**
 * Express handler to get a list of users with aggregated data.
 * It connects to the database, calls the PostgreSQL function, and returns the results.
 **/
export const getUsersWithScenarios = async (req: Request, res: Response): Promise<void> => {
	const client = new Client(dbConfig);

	// Parse query parameters for filtering, sorting, and pagination
	const {
		pagination_limit = 50,
		pagination_offset = 0,
		sort_by = 'id',
		sort_dir = 'ASC',
		filter_id,
		filter_name,
		filter_organization_id
	} = req.query;

	try {
		await client.connect();

		// Call the PostgreSQL function with the provided parameters
		// The function's parameters must be passed as an array
		const result = await client.query(
			'SELECT * FROM test.get_users_with_scenarios($1, $2, $3, $4, $5, $6, $7)',
			[
				pagination_limit,
				pagination_offset,
				sort_by,
				sort_dir,
				filter_id ? parseInt(filter_id as string) : null,
			filter_name as string || null,
			filter_organization_id ? parseInt(filter_organization_id as string) : null
	]
	);

		// Return the results to the client
		res.status(200).json({ users: result.rows });

	} catch (error) {
		console.error('Error fetching users:', error);
		res.status(500).json({ message: 'Internal Server Error', error: (error as Error).message });
	} finally {
		await client.end();
	}
};
