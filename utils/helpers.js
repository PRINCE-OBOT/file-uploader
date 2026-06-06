const cloudinary = require("../lib/cloudinary");
const streamifier = require("streamifier");

function getFolderId(folderIds) {
  const folderId = Array.isArray(folderIds) ? folderIds[0] : folderIds;

  return folderId === "null" ? null : folderId;
}

function uploadToCloudinary(file) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "auto",
        folder: "drive"
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    streamifier.createReadStream(file.buffer).pipe(uploadStream);
  });
}

module.exports = {
  getFolderId,
  uploadToCloudinary
};
