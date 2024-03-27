const mongoose = require("mongoose");

const employeeSchema = mongoose.Schema(
  {
    firstName: { type: String, require: true },
    lastName: { type: String, require: true },
    email: { type: String, require: true, unique: true },
    salary: { type: String, require: true },
    department: { type: String, require: true },
  },
  { versionKey: false }
);

const employeeModel = mongoose.model("employees", employeeSchema);

module.exports = { employeeModel };

// {
//   "title": "TItle 1",
//   "body": "Body 1",
// }
