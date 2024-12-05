import express from 'express';
import multer from 'multer';
import path from 'path';
import {uploadPDF,getPDFs} from '../controller/pdfController.js';


const pdfRoutes = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// pdfRoutes.post('/upload', upload.single('pdf'), uploadPDF);
pdfRoutes.post('/upload', upload.array('pdfs', 10), uploadPDF); 
pdfRoutes.get('/pdfs', getPDFs);

export default pdfRoutes;
