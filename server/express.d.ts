import { File as MulterFile } from "multer";

declare global {
	namespace Express {
		interface Request {
			file?: MulterFile;       // for upload.single
			files?: MulterFile[];    // for upload.array
		}
	}
}
