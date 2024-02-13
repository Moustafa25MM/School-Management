const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const classroomSchema = new Schema(
  {
    classroomName: {
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

classroomSchema.index({ classroomName: 1, school: 1 }, { unique: true });
module.exports = mongoose.model('Classroom', classroomSchema);
