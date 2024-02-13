module.exports = {
  createClassroom: [
    {
      label: 'Name',
      model: 'name',
      type: 'String',
      required: true,
      unique: true,
    },
    {
      label: 'School',
      model: 'school',
      type: 'ObjectId',
      required: true,
      unique: false,
    },
    {
      label: 'Student',
      model: 'student',
      type: '[ObjectId]',
      ref: 'User',
      required: false,
    },
  ],
};
