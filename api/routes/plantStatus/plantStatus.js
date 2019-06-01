const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const PlantStatus = require("../../models/plantStatus");
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
  PlantStatus.find()
    .select("soil light temp createdAt _id")
    .exec()
    .then(docs => {
      const response = {
        count: docs.length,
        statusPlant: docs.map(doc => {
          return {
            soil: doc.soil,
            light: doc.light,
            temp: doc.temp,
            date: doc.createdAt,
            _id: doc._id,
            request: {
              type: "GET",
              url: "http://localhost:3000/plantStatus/" + doc._id
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

router.post("/", upload.single("statusImage"), (req, res, next) => {
  console.log(req.file);

  const plantStatus = new PlantStatus({
    _id: new mongoose.Types.ObjectId(),
    soil: req.body.soil,
    light: req.body.light,
    temp: req.body.temp
  });

  plantStatus
    .save()
    .then(result => {
      //console.log(result);
      res.status(200).json({
        message: "Status created",
        createdPlatStatus: result
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

// POST without image
// router.post("/",(req, res, next) => {

//   const plantStatus = new PlantStatus({
//     _id: new mongoose.Types.ObjectId(),
//     soil: req.body.soil,
//     light: req.body.light,
//     temp: req.body.temp
//   });

//   plantStatus
//     .save()
//     .then(result => {
//       //console.log(result);
//       res.status(200).json({
//         message: "Status created",
//         createdPlatStatus: result
//       });
//     })
//     .catch(err => {
//       console.log(err);
//       res.status(500).json({
//         error: err
//       });
//     });
// });

router.get("/:plantStatusId", (req, res, next) => {
  const id = req.params.plantStatusId;

  PlantStatus.findById(id)
    .exec()
    .then(doc => {
      if (doc) {
        res.status(200).json(doc);
      } else {
        res.status(200).json({
          message: "No valid entry found for provided id"
        });
      }
      console.log("From database", doc);
      res.status(200).json(doc);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

router.patch("/:plantStatusId", (req, res, next) => {
  const id = req.params.plantStatusId;
  const updateOps = {};

  for (const ops of req.body) {
    updateOps[ops.name] = ops.value;
  }
  PlantStatus.update({ _id: id }, { $set: updateOps })
    .exec()
    .then(result => {
      res.status(200).json({
        message: "Product updated",
        request: {
          type: "GET",
          url: "http://localhost:3000/plantStatus/" + id
        }
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

router.delete("/:plantStatusId", (req, res, next) => {
  const id = req.params.plantStatusId;

  PlantStatus.deleteOne({ _id: id })
    .exec()
    .then(result => {
      res.status(200).json(result);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

module.exports = router;
