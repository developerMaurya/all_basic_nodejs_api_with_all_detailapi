import connection from '../index.js'; // Assuming you have the database connection set up.

export const uploadVideo = (req, res) => {
  const { files, body } = req; // Get files and body (for name and description)

  if (!files) {
    return res.status(400).json({ message: 'No files uploaded' });
  }

  const { name, description } = body; // Extract name and description from the request body

  // Insert data into the database for each file
  files.forEach((file) => {
    const query = `INSERT INTO videos (name, description, file_path) VALUES (?, ?, ?)`;
    connection.execute(query, [name, description, file.path], (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'Failed to save video data', error: err });
      }
    });
  });

  res.status(200).json({
    message: 'Video(s) uploaded and saved successfully',
    data: files.map((file) => ({
      filename: file.filename,
      path: file.path,
    })),
  });
};

export const getVideos = (req, res) => {
  const query = 'SELECT * FROM videos';
  connection.execute(query, (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to retrieve videos', error: err });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: 'No videos found' });
    }

    res.status(200).json({
      statusCode: 200,
      result,
    });
  });
};
