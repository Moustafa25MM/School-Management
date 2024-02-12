const Roles = require('./user.mongoModel');
module.exports = {
  createUser: [
    {
      label: 'Username',
      model: 'username',
      type: 'String',
      required: true,
      unique: true,
    },
    {
      label: 'Email',
      model: 'email',
      type: 'String',
      required: true,
      unique: true,
    },
    {
      label: 'Password',
      model: 'password',
      type: 'String',
      required: true,
    },
    {
      label: 'Role',
      type: 'String',
      enum: Roles,
      default: Roles.Student,
    },
    {
      label: 'School',
      type: 'ObjectId',
      ref: 'School',
      conditionalRequired: true,
      condition: (user) => user.role === Roles.SchoolAdmin,
    },
    {
      label: 'Classroom',
      type: 'ObjectId',
      ref: 'Classroom',
      conditionalRequired: true,
      condition: (user) => user.role === Roles.Student,
    },
  ],
};
