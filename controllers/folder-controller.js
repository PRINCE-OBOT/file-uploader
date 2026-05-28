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

const folderController = [
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
0
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

module.exports = folderController;
