module.exports = {
  createClassroom: [
    {
      label: 'ClassroomName',
      model: 'classroomName',
      type: 'String',
      required: true,
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
