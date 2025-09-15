import {DB_USER, DB_PASSWORD, DB_NAME, DB_HOST, DB_PORT} from './db_credentials.ts';
import { Client } from 'pg';
import * as fs from 'fs/promises';
import path from 'path';

const dbConfig = {
	user: DB_USER,
	host: DB_HOST,
	database: DB_NAME,
	password: DB_PASSWORD, // <<< Make sure to change this!
	port: DB_PORT,
};

async function runSqlScripts() {
	const client = new Client(dbConfig);

	try {
		await client.connect();
		console.log('Connected to the database.');

		// Step 1: Execute the dump.sql file to create the schema.
		const dumpSqlPath = path.resolve(__dirname, 'dump.sql');
		const dumpSql = fs.readFileSync(dumpSqlPath, 'utf8');
		console.log('Executing dump.sql...');
		await client.query(dumpSql);
		console.log('dump.sql executed successfully.');

		// Step 2: Execute the content.sql file to populate the schema.
		const contentSqlPath = path.resolve(__dirname, 'content.sql');
		const contentSql = fs.readFileSync(contentSqlPath, 'utf8');
		console.log('Executing content.sql...');
		await client.query(contentSql);
		console.log('content.sql executed successfully.');

		console.log('All SQL scripts ran successfully!');

	} catch (err) {
		console.error('Error executing SQL scripts:', err);
	} finally {
		await client.end();
		console.log('Connection closed.');
	}
}

runSqlScripts();

async function testDbConnection() {
	// Create a new client instance using your configuration.
	const client = new Client(dbConfig);

	try {
		// Attempt to connect to the database.
		console.log('Connecting to the database...');
		await client.connect();
		console.log('Successfully connected to the database!');

		const query = 'SELECT * FROM test."user"';
		console.log(`Executing query: "${query}"`);

		const result = await client.query(query);

// Check if any rows were returned.
		if (result.rows.length > 0) {
			console.log('\n--- Data from the "test.user" table ---');
			console.log(result.rows);
			console.log('-------------------------------------------\n');
		} else {
			console.log('The "cats" table is empty.');
		}

	} catch (err) {
		// Log any errors that occur during connection or query execution.
		console.error('Error connecting to or querying the database:', err.stack);
	} finally {
		// Always close the connection to the database.
		await client.end();
		console.log('Connection to the database closed.');
	}
}

testDbConnection();
