const express = require("express");
const { connection } = require("./db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { userRouter } = require("./Routes/userRouter");
const { notesRouter } = require("./Routes/notesRouter");
const app = express();
const dotenv = require("dotenv").config();
const cors = require("cors");
const { userModel } = require("./Model/userModel");
app.use(cors());

app.use(express.json());
// app.use("/users", userRouter);
// app.use("/notes", notesRouter);

app.post("/signup", (req, res) => {
  try {
    bcrypt.hash(req.body.password, 5, async (err, hash) => {
      if (hash) {
        try {
          const user = new userModel({ ...req.body, password: hash });
          await user.save();
          res.send({ msg: "USER REGISTERED", USER: user });
        } catch (error) {
          res.send({ msg: `${error}` });
        }
      } else {
        res.send({ msg: `${err}` });
      }
    });
  } catch (error) {
    res.send({ msg: `${error}` });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });
    if (!user) {
      res.send({ msg: "User not found" });
    } else {
      bcrypt.compare(password, user.password, async (err, result) => {
        if (result) {
          jwt.sign({ id: user._id }, process.env.loginSecret, (err, token) => {
            if (err) {
              res.send({ msg: "JWT Error", error: `${err}` });
            } else {
              res.send({ msg: "USER LOGGED IN", token, user });
            }
          });
        } else if (!result) {
          res.send({ msg: "Wrong Cred" });
        }
      });
    }
  } catch (error) {
    res.send({ msg: `${error}` });
  }
});

app.get("/", (req, res) => {
  res.send("HOME");
});

app.listen(process.env.PORT, async () => {
  await connection;
  console.log("Connected to DB");
  console.log(`Listening at ${process.env.PORT}`);
});
