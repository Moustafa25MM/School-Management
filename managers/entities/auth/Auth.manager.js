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

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return {
        ok: false,
        code: 400,
        errors: 'Invalid email format. Please provide a valid email address.',
      };
    }
    const userExistsWithUsername = await this.mongomodels.user.findOne({
      username,
    });
    if (userExistsWithUsername) {
      return {
        ok: false,
        code: 409,
        errors: 'Username is already taken.',
      };
    }

    const userExistsWithEmail = await this.mongomodels.user.findOne({ email });
    if (userExistsWithEmail) {
      return {
        ok: false,
        code: 409,
        errors: 'Email is already registered.',
      };
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
      return {
        ok: false,
        code: 404,
        errors: 'User Not Found.',
      };
    }

    let passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return {
        ok: false,
        code: 401,
        errors: 'Invalid Email or Password.',
      };
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
