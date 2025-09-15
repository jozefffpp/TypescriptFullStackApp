// This script initializes the server by fetching data from a remote URL and saving it to a local JSON file.

// We check for fs.promises to ensure the Node.js version is compatible.
const fs = require('fs');
if (!fs.promises) {
	console.error("ERROR: This script requires a modern version of Node.js (v10 or higher).");
	console.error("Please update your Node.js installation to continue.");
	process.exit(1);
}
const fsp = fs.promises; // Use a new variable for clarity

const path = require('path');
const axios = require('axios');

// The URL to fetch the cat data from
const DATA_URL = 'https://hook.eu1.integromat.com/10r7cd1lcwve9j241i98k1f3nn4o3j8g';
// The destination file path
const STORAGE_PATH = path.join(__dirname, '..', './server/storage');
const DB_FILE = path.join(STORAGE_PATH, 'db.json');

async function bootstrap() {
	console.log('Starting application bootstrap...');

	try {
		// Ensure the storage directory exists
		console.log('Checking for storage directory...');
		await fsp.mkdir(STORAGE_PATH, { recursive: true });
		console.log('Storage directory is ready.');

		// Fetch the data from the remote URL
		console.log(`Fetching data from ${DATA_URL}...`);
		const response = await axios.get(DATA_URL);
		const catData = response.data;
		console.log(`Successfully fetched ${catData.length} cat records.`);

		// Write the fetched data to the db.json file
		console.log(`Saving data to ${DB_FILE}...`);
		await fsp.writeFile(DB_FILE, JSON.stringify(catData, null, 2));
		console.log('Data saved successfully. Bootstrap complete!');

	} catch (error) {
		console.error('An error occurred during bootstrap:');
		if (error.response) {
			console.error(`HTTP Error: ${error.response.status} - ${error.response.statusText}`);
			console.error('Response data:', error.response.data);
		} else if (error.request) {
			console.error('No response received from the server.');
		} else {
			console.error('Error message:', error.message);
		}
		process.exit(1);
	}
}

// Execute the bootstrap function
bootstrap();
