const { body, validationResult, matchedData } = require("express-validator");
const { prisma } = require("../lib/prisma");

const folderNameErr = "Folder name must";

const validateFolder = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage(`${folderNameErr} not be empty`)
    .isLength({ min: 1, max: 50 })
    .withMessage(`${folderNameErr} be between 1 and 50 characters`)
    .matches(/^[^<>\\\/:*"]+$/)
    .withMessage(`${folderNameErr} not contain ^</\:*">`)
];

const postController = [
  validateFolder,
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array()
      });
    }

    // Your UI form should have a parentId of name for input, it will be sent anonymously
    const userId = req.user.id;
    const parentId = req.body.parentId;
    const { name } = matchedData(req);

    await prisma.folder.create({
      data: {
        name,
        userId,
        parentId
      }
    });

    res.json({ message: "Created a folder" });
    // ("index", { title: "homepage", pageTemplate: "homepage" });
  }
];

const getController = async (req, res) => {
  // click on folder,
  // get the id of the folder from params
  const folderId = req.params.folderId;

  // get the folder
  const folder = await prisma.folder.findUnique({
    where: {
      id: folderId
    },
    include: {
      children: true,
      files: true
    }
  });

  // pass it children down
  res.json({ folder });

  // check if folder has shareFolderId
  // if it has update the children and files to have the shareFolderId
  const sharedFolderId = folder.sharedFolderId;

  if (sharedFolderId) {
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

const updateController = [
  validateFolder,
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array()
      });
    }

    const folderId = req.body.folderId;
    const { name } = matchedData(req);

    await prisma.folder.update({
      where: { id: folderId },
      data: {
        name
      }
    });

    res.json({ mes: "Folder updated successfully" });
  }
];

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
  postController,
  updateController,
  deleteController
};
