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
const { getFolderId, uploadToCloudinary } = require("../utils/helpers");
const cloudinary = require("../lib/cloudinary");

const storage = multer.memoryStorage();

const upload = multer({ storage });

const fileNameErr = "File name must";

const validatedFileName = [
  body("name").trim().notEmpty().withMessage(`${fileNameErr} not be empty`)
];

const postController = [
  upload.array("files", 10),
  async (req, res, next) => {
    const invalidFiles = [];
    const validFiles = [];

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ errors: [{ msg: "Files are required" }] });
    }

    req.files.forEach((file) => {
      const limits = {
        image: 1024 * 1,
        video: 1024 * 1024 * 50
      };

      if (
        (file.mimetype.startsWith("image/") && file.size > limits.image) ||
        (file.mimetype.startsWith("video/") && file.size > limits.video)
      ) {
        invalidFiles.push(file);
      } else {
        validFiles.push(file);
      }
    });

    if (invalidFiles.length > 0) {
      return res.status(400).json({
        message: "Some files failed validation",
        invalidFiles
      });
    }

    const userId = req.user.id;

    const folderId = getFolderId(req.body.folderId);

    await Promise.all(
      validFiles.map(async (file) => {
        const uploaded = await uploadToCloudinary(file);

        return prisma.file.create({
          data: {
            name: file.originalname,
            url: uploaded.secure_url,
            publicId: uploaded.public_id,
            mimetype: file.mimetype,
            size: file.size,
            userId,
            folderId
          }
        });
      })
    );

    res.json({ ok: true, message: "Created a file" });
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

const downloadController = async (req, res) => {
  const file = await prisma.file.findUnique({
    where: { id: req.params.fileId }
  });

  const url = cloudinary.url(file.publicId, {
    flags: "attachment"
  });

  res.redirect(url);
};

const deleteController = async (req, res) => {
  const fileId = req.params.fileId;

  const file = await prisma.file.findUnique({
    where: { id: fileId }
  });

  await cloudinary.uploader.destroy(file.publicId, {
    resource_type: "image"
  });

  await prisma.file.delete({
    where: { id: fileId }
  });

  res.json({ ok: true });
};

module.exports = {
  postController,
  getController,
  getAllController,
  updateController,
  downloadController,
  deleteController
};
