module.exports = {
  createSchool: [
    {
      label: 'Name',
      model: 'name',
      type: 'String',
      required: true,
      unique: true,
    },
    {
      label: 'Address',
      model: 'address',
      type: 'String',
      required: true,
      unique: false,
    },
    {
      label: 'Administrator',
      model: 'administrator',
      type: 'ObjectId',
      ref: 'User',
      required: false,
    },
  ],
};
