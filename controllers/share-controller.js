const { prisma } = require("../lib/prisma");

const postController = async (req, res) => {
  const folderId = req.body.folderId;

  await prisma.sharedFolder.create({
    data: {
      folderId,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // Expires in 24 hours
    }
  });

  res.json({
    message: "Folder shared successfully"
  });
};

const getController = async (req, res) => {
  const folderId = req.params.folderId;

  const sharedFolderArr = await prisma.sharedFolder.findMany({
    where: {
      folderId
    }
  });

  const sharedFolder = sharedFolderArr[0];

  if (sharedFolder && sharedFolder.expiresAt > new Date()) {
    return res.json({
      message: "Shared folder",
      sharedFolder
    });
  }

  res.redirect("/log-in");
};

module.exports = { getController, postController };
