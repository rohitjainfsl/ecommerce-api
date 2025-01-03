import path from "path";
import multer from "multer";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, path.join(__dirname, "../uploads"));
  },

  filename: (req, file, callback) => {
    const filename = `${Date.now()} - ${Math.round(Math.random() * 1000000)}`;
    const ext = `${path.extname(file.originalname)}`;
    callback(null, filename + ext);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 2, files: 1 },
});
export default upload;
