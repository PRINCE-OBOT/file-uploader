const { prisma } = require("../lib/prisma");

const postController = async (req, res) => {
  const folderId = req.body.folderId;

  await prisma.sharedFolder.create({
    data: {
      folderId,
      expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000) // Expires in 24 hours
    }
  });

  await prisma.folder.update({
    where: { id: folderId },
    data: { sharedFolderId: folderId }
  });

  res.json({
    message: "Folder shared successfully"
  });
};

const folderNames = [];

const getFolderNamesRec = async (folder) => {
  if (!folder) return;

  folderNames.push(folder.name);

  console.log(folder.name);
  if (folder.id === folder.sharedFolderId) return;
  console.log("running");

  const folderObj = await prisma.folder.findUnique({
    where: {
      id: folder.id
    },
    include: {
      parent: true
    }
  });

  getFolderNamesRec(folderObj.parent);
};

const getController = async (req, res) => {
  const id = req.params.id;

  let folder = await prisma.folder.findUnique({
    where: { id },
    include: {
      children: true,
      files: true
    }
  });

  let file, sharedFolderId;

  if (!folder) {
    file = await prisma.file.findUnique({
      where: { id },
      include: { folder: true }
    });

    sharedFolderId = file.sharedFolderId;
  } else {
    sharedFolderId = folder.sharedFolderId;
  }

  const sharedFolderArr = await prisma.sharedFolder.findMany({
    where: { folderId: sharedFolderId }
  });

  // redirect to log in if such id does not exist in the share folder db
  if (sharedFolderArr.length === 0)
    return res.status(400).json({ message: "shared folder id does not exist" });

  const sharedFolder = sharedFolderArr[0];

  //  redirect to log in if id is expired
  if (sharedFolder.expiresAt < new Date())
    return res.status(400).json({ message: "share folder id expires" });

  if (file) {
    folderNames.push(file.name);

    await getFolderNamesRec(file.folder);
    res.json({ file, folderNames });
  } else {
    // otherwise, get the name of the it parent recursively, it children and the parent folder
    await getFolderNamesRec(folder);
    res.json({ folder, folderNames });
  }

  folderNames.splice(0);
};

module.exports = { getController, postController };
