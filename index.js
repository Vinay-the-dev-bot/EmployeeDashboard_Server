const express = require("express");
const { connection } = require("./db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const app = express();
const dotenv = require("dotenv").config();
const cors = require("cors");
const { userModel } = require("./Model/userModel");
const { employeeModel } = require("./Model/employeeModel");
app.use(cors());

app.use(express.json());

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

app.get("/employee", async (req, res) => {
  const { page = 1, limit = 5 } = req.query;
  // const employees = await employeeModel.find().limit(5).page(2);
  const employees = await employeeModel
    .find()
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit))
    .exec();
  res.send(employees);
});
app.post("/employee", async (req, res) => {
  try {
    const employee = new employeeModel({ ...req.body });
    await employee.save();
    res.send({ msg: "EMPLOYEE ADDED", employee });
  } catch (error) {
    res.send({ msg: "Error", error });
  }
});

app.patch("/employee/:employeeId", async (req, res) => {
  console.log(req.params);
  try {
    const employee = await employeeModel.findOne({
      _id: req.params.employeeId,
    });
    console.log(employee);
    await employeeModel.findByIdAndUpdate(
      { _id: req.params.employeeId },
      req.body
    );
    res.send({ msg: "EMPLOYEE EDITED" });
  } catch (error) {
    res.send({ msg: "ajdasd", error });
  }
});

app.delete("/employee/:employeeId", async (req, res) => {
  const employee = await employeeModel.findOne({ _id: req.params.employeeId });
  if (employee) {
    await employeeModel.findByIdAndDelete({ _id: req.params.employeeId });
    res.send({ msg: "Employee Deleted" });
  } else {
    res.send({ msg: "employee NOT FOUND" });
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
