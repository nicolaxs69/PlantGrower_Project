const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    email: {
      type: String, required: true,
      index: { unique: true, dropDups: true },
      lowercase: true,
      validate: { validator: emailValidator, message: '{VALUE} is not a valid email!' }
    },
    password:  { type: String, required: true }
  }
);

module.exports = mongoose.model("User", userSchema);

function emailValidator(email) {
  return /^[a-z0-9]([a-z0-9-_\.]*[a-z0-9])*@([a-z0-9]([a-z0-9-]*[a-z0-9])*\.)+[a-z0-9]{2,5}$/.test(email);
}

