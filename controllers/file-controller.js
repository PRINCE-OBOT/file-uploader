const path = require("path");
const multer = require("multer");
const fs = require("fs");
const {
  validationResult,
  matchedData,
  check,
  body
} = require("express-validator");
const { prisma } = require("../lib/prisma");
const { format } = require("date-fns");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/files/");
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

const validatedFileName = [
  body("name").trim().notEmpty().withMessage(`${fileNameErr} not be empty`)
];

const validatedFile = [
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

    validFiles.splice(0);
    invalidFiles.splice(0);
  }
];

const getController = async (req, res) => {
  const fileId = req.params.fileId;

  const file = await prisma.file.findUnique({
    where: { id: fileId }
  });

  file.createdAt = format(file.createdAt, "EEE dd, MMMM, yyyy");
  file.updatedAt = format(file.updatedAt, "EEE dd, MMMM, yyyy");

  return res.json(file);
};

const getAllController = async (req, res) => {
  const files = await prisma.file.findMany({
    where: { folderId: null }
  });

  return res.json(files);
};

const updateController = [
  validatedFileName,

  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array()
      });
    }

    const fileId = req.params.fileId;

    const { name } = matchedData(req);

    await prisma.file.update({
      where: { id: fileId },
      data: {
        name
      }
    });

    return res.json({ ok: true });
  }
];

const deleteController = async (req, res) => {
  const fileId = req.params.fileId;

  await prisma.file.delete({
    where: {
      id: fileId
    }
  });

  return res.json({ ok: true });
};

const downloadController = async (req, res) => {
  // dev
  const file = await prisma.file.findUnique({
    where: { id: req.params.fileId }
  });
  const dirArr = __dirname.split("/");
  const dir = dirArr.slice(0, dirArr.length - 1).join("/");
  
  const filePath = path.join(dir, "public/files/", file.name);
  res.download(filePath, file.originalName); // 2nd arg = name shown to user

  //  production -- uncomment this for production

  // const file = await prisma.file.findUnique({
  //   where: { id: req.params.fileId }
  // });

  // const response = await fetch(file.url);
  // const buffer = await response.arrayBuffer();

  // res.setHeader("Content-Disposition", `attachment; filename="${file.name}"`);
  // res.setHeader("Content-Type", file.mimeType);
  // res.send(Buffer.from(buffer));
};

module.exports = {
  postController,
  getController,
  getAllController,
  updateController,
  downloadController,
  deleteController
};
