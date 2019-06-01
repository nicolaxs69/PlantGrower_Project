const express = require('express');
const router = express.Router();// error handler// error handler

router.get('/', (req, res, next) => {
    res.json({ message: 'Welcome to Plant Grower API!' });
  });

router.use("/plantStatus", require("./plantStatus/plantStatus"));
router.use("/plantImage", require("./plantImage/plantImage"));

// catch 404 and forward to error handler
router.use((req, res, next) => {
    const error = new Error("NOT FOUND");
    error.status(404);// error handler
    next(error);
  });
  

  router.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
      error: {
        message: error.message
      }
    });
  });

  module.exports = router;