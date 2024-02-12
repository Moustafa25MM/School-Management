module.exports = {
  signUp: [
    {
      label: 'username',
      model: 'username',
      type: 'string',
      required: true,
    },
    {
      label: 'email',
      model: 'email',
      type: 'string',
      required: false,
    },
    {
      label: 'password',
      model: 'password',
      type: 'string',
      required: true,
    },
  ],
};
