const bcrypt = require('bcrypt');

module.exports = class School {
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
    this.usersCollection = 'school';
    this.httpExposed = ['post=createSchool', 'get=listSchools'];
    this.cache = cache;
  }

  async createSchool({ __longToken, name, address, administrator }) {
    const requestingUser = await this.mongomodels.user.findById(
      __longToken.userId
    );
    if (!requestingUser || requestingUser.role !== 'super_admin') {
      return {
        ok: false,
        code: 403,
        errors: 'Only a super_admin can create a school.',
      };
    }

    if (administrator) {
      const schoolAdmin = await this.mongomodels.user.findById(administrator);
      if (!schoolAdmin || schoolAdmin.role !== 'school_admin') {
        return {
          ok: false,
          code: 400,
          errors: 'Invalid administrator ID or the user is not a school admin.',
        };
      }
    }

    const schoolInfo = { name, address, administrator };

    console.log(schoolInfo);
    let result = await this.validators.school.createSchool(schoolInfo);
    if (result) return result;

    const school = await this.mongomodels.school.findOne({ name: name });
    if (school) {
      return {
        ok: false,
        code: 409,
        errors: 'School with this name or address already exists.',
      };
    }

    let createdSchool = await this.mongomodels.school.create(schoolInfo);

    return {
      ok: true,
      school: createdSchool,
    };
  }
  async listSchools({ __longToken }) {
    const requestingUser = await this.mongomodels.user.findById(
      __longToken.userId
    );
    if (!requestingUser || requestingUser.role !== 'super_admin') {
      return {
        ok: false,
        code: 403,
        errors: 'Only a super_admin can list the schools.',
      };
    }

    // Fetch and return all the schools
    const schools = await this.mongomodels.school.find({});
    return {
      ok: true,
      schools,
    };
  }
};
