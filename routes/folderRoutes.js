const express = require("express");
const router = express.Router();
const folderController = require("../controllers/folderController");
router.post("/folders", folderController.createFolder);
router.post("/folders/:parentId/subfolders", folderController.createSubfolder);

module.exports = router;
