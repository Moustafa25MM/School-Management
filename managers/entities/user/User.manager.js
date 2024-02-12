const bcrypt = require('bcrypt');

module.exports = class User {
  constructor({
    utils,
    cache,
    config,
    cortex,
    managers,
    validators,
    mongomodels,
  } = {}) {
    this.config = config;
    this.cortex = cortex;
    this.validators = validators;
    this.mongomodels = mongomodels;
    this.tokenManager = managers.token;
    this.usersCollection = 'user';
    this.httpExposed = ['post=createUser'];
  }

  async createUser({
    creatorRole,
    username,
    email,
    password,
    role,
    school,
    classroom,
  }) {
    if (creatorRole === 'student') {
      return {
        ok: false,
        code: 403,
        errors: 'You do not have permission to create this type of user.',
      };
    }

    if (creatorRole === 'school_admin' && role !== 'student') {
      return {
        ok: false,
        code: 403,
        errors: 'School admins can only create Students.',
      };
    }

    if (
      (creatorRole === 'super_admin' && role !== 'school_admin') ||
      (creatorRole === 'super_admin' && role !== 'super_admin')
    ) {
      return {
        ok: false,
        code: 403,
        errors:
          'Super admins can only create school admins or other super admins.',
      };
    }

    // Role-based field requirement checks
    if (role === 'school_admin' && !school) {
      return {
        ok: false,
        code: 400,
        errors: 'Missing school ID for school admin creation.',
      };
    }

    if (role === 'student' && !classroom) {
      return {
        ok: false,
        code: 400,
        errors: 'Missing classroom ID for student creation.',
      };
    }

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

    // Data validation
    let result = await this.validators.user.createUser({
      username,
      email,
      password,
      role,
      school,
      classroom,
    });
    if (result) return result;

    const hashedPassword = await bcrypt.hash(password, 12);
    const userData = {
      username,
      email,
      password: hashedPassword,
      role,
    };

    if (role === 'school_admin') {
      userData.school = school;
    }

    if (role === 'student') {
      userData.classroom = classroom;
    }

    // Creation Logic
    const createdUser = await this.mongomodels.user.create(userData);

    return {
      user: createdUser,
    };
  }
};
