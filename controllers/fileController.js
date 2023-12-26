const AWS = require("aws-sdk");
const multer = require("multer");
const pool = require("../config/database");

const upload = multer({ dest: "uploads/" });

async function uploadFile(req, res) {
  try {
    const { originalname, size, mimetype } = req.file;
    const userId = req.user.id;
    const folderId = req.body.folderId; // Assuming the folderId is provided in the request body

    const folderExistQuery =
      "SELECT * FROM folders WHERE user_id = $1 AND id = $2";
    const folderExistValues = [userId, folderId];
    const folderExistResult = await pool.query(
      folderExistQuery,
      folderExistValues
    );

    if (folderExistResult.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Folder not found for the user." });
    }

    // Upload file to AWS S3
    const uploadParams = {
      Bucket: "your_s3_bucket_name",
      Key: `${userId}/${folderId}/${originalname}`,
      Body: req.file.buffer,
      ContentType: mimetype,
    };

    const s3UploadResponse = await s3.upload(uploadParams).promise();

    // Insert file metadata into the database
    const insertFileQuery = `
      INSERT INTO files (user_id, folder_id, file_name, file_size, file_type, s3_key)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`;
    const insertFileValues = [
      userId,
      folderId,
      originalname,
      size,
      mimetype,
      s3UploadResponse.Key,
    ];
    const insertedFile = await pool.query(insertFileQuery, insertFileValues);

    return res.status(201).json({ file: insertedFile.rows[0] });
  } catch (error) {
    console.error("Error uploading file:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

async function manageFile(req, res) {
  const fileId = req.params.id;

}

module.exports = {
  uploadFile,
  manageFile,
};
