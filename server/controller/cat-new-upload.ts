import * as express from 'express';
import {Request, Response} from 'express';
import * as path from "node:path";
import * as fs from "node:fs/promises";
import { v4 as uuidv4 } from 'uuid';
import { File} from 'multer';
import {Cat} from "../../src/app/cats/cat";

//The problem here is, that the database is seeded from external source, when bootstrapping the app, that means,
//I can't store multiple images to connect with one cat, because that would either mean no compatible types,
//Where I would store array of urls to the images in "image" key, or changing the cat model to store either image or
//array of images in "images" key, but I think this is not the subject of this exercise, so I will go with the easiest
//option here, where I will store all images as they are meant for different cat. So there will be new cat for every uloaded
//image, although it has one name, all of them will be different ID, which means, they are all unique entities.
//This doesn't make sense in real app, but it is what it is.

//the optimisation here is questionable. It is "optimized" to write the cats all at once, but it's not trully an
//optimisation, because all the db.json is loaded and then rewrote with appended cats, but that is the json database
//limitation.

const storageDir = path.join(__dirname, '../storage');
const dbFilePath = path.join(storageDir, 'db.json');

interface MulterRequest extends Request {
	files?: File[];
}

export const catNewUpload = async (req: MulterRequest, res: Response) => {
	const uploadedFiles = req.files as File[];
	const { title } = req.body;

	// Check for both the existence of files and a title.
	if (!uploadedFiles || uploadedFiles.length === 0 || !title) {
		return res.status(400).send({ error: 'Missing images or title' });
	}

	// Map the uploaded files to an array of new cat objects.
	const newCats = uploadedFiles.map(image => ({
		id: uuidv4(),
		date: new Date(),
		image: `/api/cat/image/${image.filename}`, // Store a single image path
		title: title,
		rating: 0,
		rating_sum: 0,
		rating_count: 0,
	}));

	try {
		// Start with a default, empty array.
		let cats: Cat[] = [];

		// Attempt to read and parse the existing database file
		try {
			const data = await fs.readFile(dbFilePath, 'utf8');
			const parsedData = JSON.parse(data);

			// Check if the parsed data is a valid array.
			if (Array.isArray(parsedData)) {
				cats = parsedData;
			} else {
				console.warn('db.json exists but is not an array. Starting with an empty database.');
			}
		} catch (error: any) {
			// This is a safe path if the file doesn't exist ('ENOENT') or has invalid JSON
			if (error.code !== 'ENOENT' && !(error instanceof SyntaxError)) {
				throw error; // Re-throw any other unexpected errors
			}
		}

		// Add the new cats to the database and save the file.
		cats.push(...newCats);
		await fs.writeFile(dbFilePath, JSON.stringify(cats, null, 2), 'utf8');

	} catch (error) {
		console.error('Error updating db.json:', error);
		return res.status(500).send({ error: 'Internal server error' });
	}

	// Respond with the newly created cat objects.
	res.status(201).send(newCats);
};
