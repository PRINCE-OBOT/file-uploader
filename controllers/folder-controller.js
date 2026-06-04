const { body, validationResult, matchedData } = require("express-validator");
const { prisma } = require("../lib/prisma");

const postController = async (req, res) => {
  const userId = req.user.id;
  const { parentId, name } = req.body;

  await prisma.folder.create({
    data: {
      name,
      userId,
      parentId
    }
  });

  return res.json({ ok: true });
};

const getAllController = async (req, res) => {
  const folders = await prisma.folder.findMany({
    where: { parentId: null }
  });

  return res.json(folders);
};

const getController = async (req, res) => {
  const folderId = req.params.folderId;

  const folder = await prisma.folder.findUnique({
    where: {
      id: folderId
    },
    include: {
      children: true,
      files: true
    }
  });

  return res.json(folder);
};

const updateController = async (req, res) => {
  const folderId = req.params.folderId;

  const { name } = req.body;

  await prisma.folder.update({
    where: { id: folderId },
    data: {
      name
    }
  });

  return res.json({ ok: true });
};

const deleteController = async (req, res) => {
  const folderId = req.body.folderId;

  await prisma.folder.delete({
    where: {
      id: folderId
    }
  });

  res.json({
    message: "Folder deleted successfully"
  });
};

module.exports = {
  getController,
  getAllController,
  postController,
  updateController,
  deleteController
};
