module.exports = {
  createUser: [
    {
      model: 'User',
      fields: [
        {
          name: 'username',
          type: 'String',
          required: true,
          unique: true,
        },
        {
          name: 'email',
          type: 'String',
          required: true,
          unique: true,
        },
        {
          name: 'password',
          type: 'String',
          required: true,
        },
        {
          name: 'role',
          type: 'String',
          enum: Roles,
          default: Roles.Student,
        },
        {
          name: 'school',
          type: 'ObjectId',
          ref: 'School',
          conditionalRequired: true,
          condition: (user) => user.role === Roles.SchoolAdmin,
        },
        {
          name: 'classroom',
          type: 'ObjectId',
          ref: 'Classroom',
          conditionalRequired: true,
          condition: (user) => user.role === Roles.Student,
        },
      ],
    },
  ],
};
