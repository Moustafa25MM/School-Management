const bcrypt = require('bcrypt');

module.exports = class Auth {
  constructor({
    utils,
    cache,
    config,
    cortex,
    managers,
    validators,
    mongomodels,
  }) {
    this.config = config;
    this.cortex = cortex;
    this.validators = validators;
    this.mongomodels = mongomodels;
    this.tokenManager = managers.token;
    this.usersCollection = 'auth';
    this.httpExposed = ['post=signupAdmin', 'post=login'];
  }

  async signupAdmin({ username, email, password }) {
    let userInfo = {
      username,
      email,
      password,
      role: 'super_admin',
    };

    let validationResult = await this.validators.auth.signUp(userInfo);
    if (validationResult) return validationResult;

    const userExists = await this.mongomodels.user.findOne({
      $or: [{ username }, { email }],
    });
    if (userExists) {
      throw new Error('User already exists');
    }

    userInfo.password = await bcrypt.hash(password, 12);

    let newUser = await this.mongomodels.user.create(userInfo);

    return { newUser };
  }

  async login({ email, password }) {
    let user = await this.mongomodels.user
      .findOne({ email })
      .select('+password');
    if (!user) {
      throw new Error('User Not Found');
    }

    let passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      throw new Error('Invalid email or password');
    }

    const access_token = this.tokenManager.genLongToken({
      userId: user._id,
      userKey: {
        email: user.email,
        role: user.role,
      },
    });

    user.password = undefined;

    return { user, access_token };
  }
};
