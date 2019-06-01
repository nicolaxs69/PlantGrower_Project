const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const PlantImage = require("../../models/image");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "./uploads/");
  },

  filename: function(req, file, cb) {
    cb(null, new Date().toISOString() + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  // reject a file
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5 //5 mb
  },
  fileFilter: fileFilter
});

router.get("/", (req, res, next) => {
  PlantImage.find()
    .select("image createdAt _id")
    .exec()
    .then(docs => {
      const response = {
        count: docs.length,
        imagePlant: docs.map(doc => {
          return {
            image: doc.image,
            date: doc.createdAt,
            _id: doc._id,
            request: {
              type: "GET",
              url: "http://localhost:3000/plantImage/" + doc._id
            }
          };
        })
      };
      //   if(docs >= 0){
      res.status(200).json(response);
      //   } else {
      //       res.status(404).json({
      //           message: 'No data found, empty status'
      //       })
      //   }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

router.post("/", upload.single("image"), (req, res, next) => {
  console.log(req.file);

  const plantImage = new PlantImage({
    _id: new mongoose.Types.ObjectId(),
    image: req.file.path
  });

  plantImage
    .save()
    .then(result => {
      //console.log(result);
      res.status(200).json({
        message: "Status created",
        createdPlatImage: result
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

module.exports = router;
