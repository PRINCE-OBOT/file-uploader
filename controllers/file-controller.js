const multer = require("multer");
const fs = require("fs");
const { validationResult, matchedData, check } = require("express-validator");
const { prisma } = require("../lib/prisma");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "files/");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage });

const invalidFiles = [];
const validFiles = [];

const separateFiles = (file) => {
  const { size, mimetype } = file;

  const limits = {
    image: 1024 * 1024 * 10, // 10MB for images
    video: 1024 * 1024 * 50 // 50MB for videos
  };

  if (
    (mimetype.startsWith("image/") && size > limits.image) ||
    (mimetype.startsWith("video/") && size > limits.video)
  ) {
    invalidFiles.push(file);
  } else {
    validFiles.push(file);
  }
};

const validatedFile = [
  check("files").custom((value, { req }) => {
    if (!req.files || req.files.length === 0) {
      throw new Error("Files are required");
    }

    req.files.forEach(separateFiles);

    if (invalidFiles.length > 0) {
      throw new Error(
        "Image and Video file size should not exceed 10MB, 50MB respectively"
      );
    }

    return true;
  })
];

const fileController = [
  upload.array("files", 10),
  validatedFile,
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
        invalidFiles
      });
    }

    // Your UI form should have a folderId where the file will be saved under, it will be sent anonymously
    const userId = req.user.id;
    const folderId = req.body.folderId || null;

    // Problem Encounter
    // Do providing `folderId` directly no longer supported again, that I have to use `folder` to connect explicitly

    await Promise.all(
      validFiles.map((file) =>
        prisma.file.create({
          data: {
            name: file.originalname,
            url: file.path,
            mimetype: file.mimetype,
            size: file.size,
            userId,
            folderId
          }
        })
      )
    );

    res.json({ message: "Created a file" });
    // ("index", { title: "homepage", pageTemplate: "homepage" });

    invalidFiles.forEach((file) => {
      fs.unlink(file.path, (err) => {
        if (err) console.error("Failed to delete invalid file:", err);
      });
    });
  }
];

module.exports = fileController;
