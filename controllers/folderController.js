const pool = require("../config/database");
async function createFolder(req, res) {
  try {
    const { folderName } = req.body;
    const userId = req.user.id;
    const folderExistQuery =
      "SELECT * FROM folders WHERE user_id = $1 AND folder_name = $2";
    const folderExistValues = [userId, folderName];
    const folderExistResult = await pool.query(
      folderExistQuery,
      folderExistValues
    );

    if (folderExistResult.rows.length > 0) {
      return res.status(400).json({
        message: "Folder with the same name already exists for the user.",
      });
    }

    const insertFolderQuery =
      "INSERT INTO folders (user_id, folder_name) VALUES ($1, $2) RETURNING *";
    const insertFolderValues = [userId, folderName];
    const insertedFolder = await pool.query(
      insertFolderQuery,
      insertFolderValues
    );

    return res.status(201).json({ folder: insertedFolder.rows[0] });
  } catch (error) {
    console.error("Error creating folder:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

async function createSubfolder(req, res) {
  try {
    const { folderName } = req.body;
    const userId = req.user.id;
    const parentId = req.params.parentId;
    const parentFolderQuery =
      "SELECT * FROM folders WHERE user_id = $1 AND id = $2";
    const parentFolderValues = [userId, parentId];
    const parentFolderResult = await pool.query(
      parentFolderQuery,
      parentFolderValues
    );

    if (parentFolderResult.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Parent folder not found for the user." });
    }

    // Check if the subfolder already exists for the user
    const subfolderExistQuery =
      "SELECT * FROM folders WHERE user_id = $1 AND parent_id = $2 AND folder_name = $3";
    const subfolderExistValues = [userId, parentId, folderName];
    const subfolderExistResult = await pool.query(
      subfolderExistQuery,
      subfolderExistValues
    );

    if (subfolderExistResult.rows.length > 0) {
      return res.status(400).json({
        message: "Subfolder with the same name already exists for the user.",
      });
    }

    // Insert the new subfolder into the database
    const insertSubfolderQuery =
      "INSERT INTO folders (user_id, parent_id, folder_name) VALUES ($1, $2, $3) RETURNING *";
    const insertSubfolderValues = [userId, parentId, folderName];
    const insertedSubfolder = await pool.query(
      insertSubfolderQuery,
      insertSubfolderValues
    );

    return res.status(201).json({ subfolder: insertedSubfolder.rows[0] });
  } catch (error) {
    console.error("Error creating subfolder:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

module.exports = {
  createFolder,
  createSubfolder,
};
