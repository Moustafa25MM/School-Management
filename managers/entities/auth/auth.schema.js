module.exports = {
  signUp: [
    {
      label: 'Username',
      model: 'username',
      type: 'string',
      required: true,
    },
    {
      label: 'Email',
      model: 'email',
      type: 'string',
      required: false,
    },
    {
      label: 'Password',
      model: 'password',
      type: 'string',
      required: true,
    },
  ],
};
