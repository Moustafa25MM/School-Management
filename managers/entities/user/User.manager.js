const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

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
    __longToken,
    username,
    email,
    password,
    role,
    school,
    classroomId,
  }) {
    const requestingUser = await this.mongomodels.user.findById(
      __longToken.userId
    );

    if (!requestingUser) {
      return {
        ok: false,
        code: 403,
        errors: 'You do not have permission to create this type of user.',
      };
    }

    if (requestingUser.role === 'student') {
      return {
        ok: false,
        code: 403,
        errors: 'Students cannot create users.',
      };
    }

    if (requestingUser.role === 'school_admin' && role !== 'student') {
      return {
        ok: false,
        code: 403,
        errors: 'School admins can only create students.',
      };
    }

    if (
      requestingUser.role === 'super_admin' &&
      role !== 'school_admin' &&
      role !== 'super_admin'
    ) {
      return {
        ok: false,
        code: 403,
        errors: 'Super admins can only create school admins or super admins.',
      };
    }

    // Role-based field requirement checks
    if (role === 'school_admin') {
      if (!school) {
        return {
          ok: false,
          code: 400,
          errors: 'Missing school ID for school admin creation.',
        };
      } else {
        // Check if the school exists
        const schoolExists = await this.mongomodels.school.findById(school);
        if (!schoolExists) {
          return {
            ok: false,
            code: 404,
            errors: 'School does not exist.',
          };
        }
      }
    }

    if (role === 'student') {
      if (!classroomId) {
        return {
          ok: false,
          code: 400,
          errors: 'Missing classroom ID for student creation.',
        };
      } else if (!mongoose.Types.ObjectId.isValid(classroomId)) {
        return {
          ok: false,
          code: 400,
          errors: 'The classroom ID provided is not a valid ObjectId.',
        };
      } else {
        const classroomExists = await this.mongomodels.classroom.findById(
          classroomId
        );
        if (!classroomExists) {
          return {
            ok: false,
            code: 404,
            errors: 'Classroom does not exist.',
          };
        }
      }
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
      classroomId,
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
      userData.classroom = classroomId;
    }

    // Creation Logic
    const createdUser = await this.mongomodels.user.create(userData);

    return {
      user: createdUser,
    };
  }
};
