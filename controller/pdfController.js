import connection from '../index.js';

// export const uploadPDF = (req, res) => {
//     const { file, body } = req; // Get file and body (for name and description)
//     if (!file) {
//         return res.status(400).json({ message: 'No file uploaded' });
//     }
//     const { name, description } = body; // Extract name and description from request body
//     // Insert data into the database
//     const query = `INSERT INTO pdfs (name, description, file_path) VALUES (?, ?, ?)`;
//     connection.execute(query, [name, description, file.path], (err, result) => {
//         if (err) {
//             return res.status(500).json({ message: 'Failed to save PDF data', error: err });
//         }
//         res.status(200).json({
//             statusCode:201,
//             message: 'PDF uploaded and saved successfully',
//             data: {
//                 filename: file.filename,
//                 path: file.path,
//                 name,
//                 description,
//             },
//         });
//     });
// };
  
export const uploadPDF = (req, res) => {
    const { files, body } = req;
    // If no files are uploaded
    if (!files || files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }
    const { name, description } = body; // Extract name and description from request body
    files.forEach(file => {
      const query = `INSERT INTO pdfs (name, description, file_path) VALUES (?, ?, ?)`;
      connection.execute(query, [name, description, file.path], (err, result) => {
        if (err) {
          return res.status(500).json({ message: 'Failed to save PDF data', error: err });
        }
      });
    });
    res.status(200).json({
        statusCode:201,
      message: 'PDF(s) uploaded and saved successfully',
      data: files.map(file => ({
        filename: file.filename,
        path: file.path,
      })),
    });
  };
export const getPDFs = (req, res) => {
    const query = `SELECT * FROM pdfs`;
    connection.execute(query, (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Failed to save PDF data', error: err });
        }
        res.status(200).json({
            statusCode:200,
            result
        });
    });
  };
  