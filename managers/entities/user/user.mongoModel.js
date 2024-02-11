const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the roles in an enum
const Roles = {
  SuperAdmin: 'super_admin',
  SchoolAdmin: 'school_admin',
  Student: 'student',
};

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  role: {
    type: String,
    enum: Object.values(Roles),
    default: Roles.Student,
  },
  school: {
    type: Schema.Types.ObjectId,
    ref: 'School',
    required: function () {
      return this.role === Roles.SchoolAdmin;
    },
  },
  classroom: {
    type: Schema.Types.ObjectId,
    ref: 'Classroom',
    required: function () {
      return this.role === Roles.Student;
    },
  },
});

Object.freeze(Roles);

module.exports = mongoose.model('User', userSchema);
