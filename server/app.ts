import * as express from 'express';
import {Request, Response} from 'express';
import * as session from 'express-session';
import * as path from "node:path";
import * as fs from "node:fs/promises";
import cors = require('cors');
import { v4 as uuidv4 } from 'uuid';
import multer = require('multer');

import {getTopRatedCats} from './controller/cats-top-rated';
import {getCatToRate, postCatRating} from "./controller/cats-rate";
import {catNewUpload} from "./controller/cat-new-upload";
import {authenticateApiKey} from "./controller/auth-api-key";
import {csfrToken, csrfMiddleware} from "./controller/csrf";
import {getUsersWithScenarios} from "../sql/user_controller/listing_users";
import {editUser} from "../sql/user_controller/edit-user"
import {getUserById} from "../sql/user_controller/get-user-by-id";

const app: express.Application = express();
const storageDir = path.join(__dirname, 'storage');
const imagesDir = path.join(storageDir, 'images');

// Multer storage configuration
const fileStorage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, imagesDir);
	},
	filename: (req, file, cb) => {
		// Generate a unique filename using uuid
		cb(null, uuidv4() + path.extname(file.originalname));
	},
});

const upload = multer({ storage: fileStorage, limits: { fileSize: 10 * 1024 * 1024 } });

// Ensure the storage and images directories exist
(async () => {
	try {
		await fs.mkdir(storageDir, { recursive: true });
		await fs.mkdir(imagesDir, { recursive: true });
	} catch (err) {
		console.error("Failed to create storage directories:", err);
	}
})();

app.use(express.json())

app.set('trust proxy', 1);

// Configure CORS to allow the custom headers
app.use(cors({
	origin: '*', // Allow all origins for simplicity in this example
	methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
	allowedHeaders: ['Content-Type', 'Authorization', 'X-Api-Key', 'X-Csrf-Token'],
	credentials: true,
}));

app.use(session({
	secret: 'keyboard cat',
	resave: true,
	saveUninitialized: true,
	cookie: { secure: false },
}));

// --- PROVIDE CSRF TOKEN FOR USER ---
app.get('/api/csrf-token', csfrToken);

// --- SERVE STATIC IMAGES FOR UPLOADED CATS ---
app.use('/api/cat/image', express.static(imagesDir));

// --- API KEY AUTHENTIFICATION ---
app.use(authenticateApiKey);

// --- LISTS ALL USERS FROM DB ---
app.get('/api/users', getUsersWithScenarios);

// --- GET USER BY ID FOR EDITING ---
app.get('/api/users/:id', getUserById);

//works on BE through postman, but problem when connected to FE. Something is wrong
// with the browser not sure what. The sessions returned don't contain the token

// --- CSRF attact middleware ---
app.use(csrfMiddleware);

// --- BE HOME ---
app.get('/',  (req: Request, res: Response) => {res.send('Hello!')});

// --- SERVER APPLICATION TEST ---
app.get('/api/ping', (req: Request, res: Response) => {res.send('pong')});

// --- 1.3.2: GET whole list of cats from db.json ---
app.get('/api/cats/top-rated', getTopRatedCats);

// --- 1.3.1: GET random cat from db.json ---
app.get('/api/cats/rate', getCatToRate);

// ---  1.3.3: POST to update a cat's rating ---
app.post('/api/cat/rating',postCatRating);

// --- UPLOADING CATS ---
app.post('/api/cats/upload', upload.array('image', 3), catNewUpload);

// --- UPDATE USER BY ID ---
app.put('/api/users/:id', editUser);

export {app};
