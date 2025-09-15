import { Request, Response } from 'express';
import * as fs from 'fs/promises';
import * as path from 'path';
import {Cat} from "../../src/app/cats/cat";
const dbFilePath = path.join(__dirname, '..', 'storage', 'db.json');

// Handler for the GET request to /api/cats/top-rated
export const getTopRatedCats = async (req: Request, res: Response): Promise<void> => {
	try {
		const data = await fs.readFile(dbFilePath, 'utf8');
		const cats: Cat[] = JSON.parse(data);

		// Sort cats by rating in descending order
		const sortedCats = cats.sort((a, b) => b.rating - a.rating);

		res.json({ cats: sortedCats });
	} catch (error) {
		console.error('Error fetching cats list:', error);
		res.status(500).json({ message: 'Internal Server Error' });
	}
};
