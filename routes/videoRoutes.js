import express from 'express';
import multer from 'multer';
import path from 'path';
import { uploadVideo, getVideos } from '../controller/videoController.js';

const videoRoutes = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/videos');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Route for single video upload
// videoRoutes.post('/upload', upload.single('video'), uploadVideo);

// Route for multiple video upload
videoRoutes.post('/videoUpload', upload.array('videos', 10), uploadVideo); // max 10 files

// Route to get all videos
videoRoutes.get('/videos', getVideos);

export default videoRoutes;
