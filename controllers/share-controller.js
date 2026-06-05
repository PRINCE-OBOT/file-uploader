const { prisma } = require("../lib/prisma");

const postController = async (req, res) => {
  const folderId = req.body.folderId;

  const oneDay = new Date(Date.now() + 24 * 60 * 60 * 1000); // Expires in 24 hours

  await prisma.sharedFolder.upsert({
    where: { folderId },
    update: {
      expiresAt: oneDay
    },
    create: {
      folderId,
      expiresAt: oneDay
    }
  });

  await prisma.folder.update({
    where: { id: folderId },
    data: { sharedFolderId: folderId }
  });

  return res.json({ ok: true });
};

const parentFolder = [];

const pushParentFolderRec = async (folder) => {
  if (!folder) return;

  parentFolder.unshift(folder);

  if (folder.id === folder.sharedFolderId) return;

  const folderObj = await prisma.folder.findUnique({
    where: {
      id: folder.id
    },
    include: {
      parent: true
    }
  });

  pushParentFolderRec(folderObj.parent);
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
  if (sharedFolderArr.length === 0) res.redirect("/log-in");

  const sharedFolder = sharedFolderArr[0];

  //  redirect to log in if id is expired
  if (sharedFolder.expiresAt < new Date()) res.redirect("/log-in");

  if (file) {
    parentFolder.push(file.name);

    await pushParentFolderRec(file.folder);
    res.json({ file, parentFolder });
  } else {
    // otherwise, get the name of the it parent recursively, it children and the parent folder
    

    await pushParentFolderRec(folder);
    res.render("index", {
      title: "File Uploader | Shared",
      pageTemplate: "shared",
      folder,
      parentFolder
    });
  }

  parentFolder.splice(0);

  if (folder) {
    await prisma.folder.update({
      where: { id: sharedFolderId },
      data: {
        children: {
          updateMany: {
            where: {},
            data: { sharedFolderId }
          }
        },
        files: {
          updateMany: {
            where: {},
            data: { sharedFolderId }
          }
        }
      }
    });
  }
};

module.exports = { getController, postController };

// if folder is in the object
// render it
// if file is in the object, render it
// when file come
// if
