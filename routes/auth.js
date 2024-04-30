const express = require("express");
const User = require("../models/User");
const { body, validationResult } = require("express-validator");
const router = express.Router();
var bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
var fetchuser = require("../middleware/fetchuser");

const JWT_SECRET = "someboyisagoodb$oy";

// ROUTE 1 : Create a User using POST-"/api/auth/createuser" . No login required

router.post(
  "/createuser",
  [
    body("name").isLength({ min: 3 }),
    body("email", "Enter a valid Email").isEmail(),
    body("password", "Password should be atleat 5 characters").isLength({
      min: 5,
    }),
  ],

  async (req, res) => {
    //If there are any errors , Return bad request and the errors
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      success = false;
      return res.status(400).json({success, errors: errors.array() });
    }
    // Check whether an account with a email exists already
    try {
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        success = false;
        return res.status(400).json({success, error: "Email already exists" });
      }
      //Creating Hash of passwords
      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(req.body.password, salt);

      user = await User.create({
        name: req.body.name,
        password: secPass,
        email: req.body.email,
        type: req.body.type,
      });

      const data = {
        user: {
          id: user.id,
        },
      };
      success = true;
      res.json({ success});
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server Error");
    }
  }
);
// ROUTE 2 : Auntheticate a  User using POST-"/api/auth/login" . No login required

router.post(
  "/login",
  [
    body("email", "Enter a valid Email").isEmail(),
    body("password", "Password cannot be blank").exists(),
  ],

  async (req, res) => {
    //If there are any errors , Return bad request and the errors
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    try {
      let user = await User.findOne({ email });
      if (!user) {
        success = false;
        return res
          .status(400)
          .json({ success, error: "Incorrect Credentials" });
      }
      const passwordCompare = await bcrypt.compare(password, user.password);
      if (!passwordCompare) {
        success = false;
        return res
          .status(400)
          .json({ success, error: "Incorrect Credentials" });
      }
      const data = {
        user: {
          id: user.id,
        },
      };
      const authtoken = jwt.sign(data, JWT_SECRET);
      const type = user.type;
      success = true;

      res.json({ success, type, authtoken });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server Error");
    }
  }
);

// ROUTE 3 : Get logged in  User details using POST-"/api/auth/getuser" . Login required
router.post("/getuser", fetchuser, async (req, res) => {
  try {
    userId = req.user.id;
    const user = await User.findById(userId).select("-password");
    res.send(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal server Error");
  }
});

module.exports = router;
