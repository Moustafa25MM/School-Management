const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const classroomSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    school: {
      type: Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
    students: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Classroom', classroomSchema);
