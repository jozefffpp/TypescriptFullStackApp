import { Request, Response } from 'express';
import * as fs from 'fs/promises';
import * as path from 'path';
import {Cat} from "../../src/app/cats/cat";

const dbFilePath = path.join(__dirname, '..', 'storage', 'db.json');

// Handler for the GET request to /api/cats/rate
export const getCatToRate = async (req: Request, res: Response) => {
	try {
		const data = await fs.readFile(dbFilePath, 'utf8');
		const cats: Cat[] = JSON.parse(data);

		if (cats.length === 0) {
			return res.status(404).json({ message: 'No cats found.' });
		}

		const randomIndex = Math.floor(Math.random() * cats.length);
		const randomCat = cats[randomIndex];

		// Destructure the object to get only the required fields
		const { id, image, title, date } = randomCat;

		// Respond with a new object containing only these four fields
		res.json({ id, image, title, date });
	} catch (error) {
		console.error('Error fetching random cat:', error);
		res.status(500).json({ message: 'Internal Server Error' });
	}
};

// Handler for the POST request to /api/cat/rating
export const postCatRating = async (req: Request, res: Response) => {
	try {
		// Destructure the cat's ID and new rating from the request body.
		const { id, rating } = req.body;

		// Ensure the request body contains both ID and rating.
		if (!id || typeof rating === 'undefined') {
			return res.status(400).json({ message: 'Bad Request: Missing cat ID or rating.' });
		}

		// 1. Read the current database file.
		const data = await fs.readFile(dbFilePath, 'utf8');
		const cats: Cat[] = JSON.parse(data);

		// 2. Find the index of the cat to update.
		const catIndex = cats.findIndex(c => c.id === id);

		// 3. Handle the case where the cat is not found.
		if (catIndex === -1) {
			return res.status(404).json({ message: `Cat with ID ${id} not found.` });
		}

		// 4. Update the cat's rating in the in-memory array.
		cats[catIndex].rating_count = cats[catIndex].rating_count + 1;
		cats[catIndex].rating_sum = cats[catIndex].rating_sum + rating;
		cats[catIndex].rating = cats[catIndex].rating_sum / cats[catIndex].rating_count;

		// 5. Write the updated array back to the database file.
		await fs.writeFile(dbFilePath, JSON.stringify(cats, null, 2), 'utf8');

		// 6. Send a success response back to the client.
		res.json({ message: 'Cat rating updated successfully.', updatedCat: cats[catIndex] });
	} catch (error) {
		console.error('Error updating cat rating:', error);
		res.status(500).json({ message: 'Internal Server Error' });
	}
};
