const multer = require("multer");
const fs = require("fs");
const {
  validationResult,
  matchedData,
  check,
  body
} = require("express-validator");
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
const fileNameErr = "File name must";

const separateValidFilesFromInvalid = (file) => {
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

const validateFileName = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage(`${fileNameErr} not be empty`)
    .isLength({ min: 1, max: 20 })
    .withMessage(`${fileNameErr} be between 1 and 20 characters`)
    .matches(/^[^<>\\\/:*"]+$/)
    .withMessage(`${fileNameErr} not contain ^</\:*">`)
];

const validatedFile = [
  ...validateFileName,
  check("files").custom((value, { req }) => {
    if (!req.files || req.files.length === 0) {
      throw new Error("Files are required");
    }

    req.files.forEach(separateValidFilesFromInvalid);

    if (invalidFiles.length > 0) {
      throw new Error(
        "Image and Video file size should not exceed 10MB, 50MB respectively"
      );
    }

    return true;
  })
];

const postController = [
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

    const userId = req.user.id;
    const folderId = req.body.folderId || null;

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

const getController = async (req, res) => {
  const fileId = req.params.fileId;

  const file = await prisma.file.findUnique({
    where: { id: fileId }
  });

  res.json({ file });
};

const updateController = [
  validateFileName,
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array()
      });
    }

    const fileId = req.body.fileId;
    const { name } = matchedData(req);

    await prisma.file.update({
      where: { id: fileId },
      data: {
        name
      }
    });

    res.json({ mes: "File updated successfully" });
  }
];

const deleteController = async (req, res) => {
  const fileId = req.body.fileId;

  await prisma.file.delete({
    where: {
      id: fileId
    }
  });

  res.json({
    message: "Folder deleted successfully"
  });
};

module.exports = {
  postController,
  getController,
  updateController,
  deleteController
};
