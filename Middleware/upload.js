const multer = require("multer");
// const Playlist = require("../model/playlist");

let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./Uploads");
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now() + "-" + file.originalname);
  },
});
// For uploading single image
let upload = multer({
  storage: storage,
}).single("image");

//For uploading multiple images
// var upload = multer({
//   storage: storage,
// }).array("images", 3); // Accepts up to 3 images, you can adjust the number as needed

module.exports = upload;
