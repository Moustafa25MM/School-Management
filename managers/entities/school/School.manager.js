const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

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
    this.httpExposed = [
      'post=createSchool',
      'get=listSchools',
      'get=getSchoolById',
      'delete=deleteSchool',
      'get=listSchoolAdmins',
      'patch=updateSchool',
    ];
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

    let result = await this.validators.school.createSchool(schoolInfo);
    if (result) return result;

    const existingSchool = await this.mongomodels.school.findOne({
      name: name,
    });
    if (existingSchool) {
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
  async getSchoolById({ __longToken, schoolId }) {
    const requestingUser = await this.mongomodels.user.findById(
      __longToken.userId
    );
    if (!requestingUser || requestingUser.role !== 'super_admin') {
      return {
        ok: false,
        code: 403,
        errors: 'Only a super_admin can get the school',
      };
    }
    if (!schoolId) {
      return {
        ok: false,
        code: 400,
        errors: 'Enter a Valid schoolId',
      };
    }

    if (!mongoose.Types.ObjectId.isValid(schoolId)) {
      return {
        ok: false,
        code: 400,
        errors: 'The School ID provided is not a valid ObjectId.',
      };
    }

    const school = await this.mongomodels.school.findById(schoolId);
    if (!school) {
      return {
        ok: false,
        code: 404,
        errors: 'School not found.',
      };
    }
    return {
      ok: true,
      school,
    };
  }
  async deleteSchool({ __longToken, schoolId }) {
    const requestingUser = await this.mongomodels.user.findById(
      __longToken.userId
    );
    if (!requestingUser || requestingUser.role !== 'super_admin') {
      return {
        ok: false,
        code: 403,
        errors: 'Only a super_admin can get the school',
      };
    }
    if (!schoolId) {
      return {
        ok: false,
        code: 400,
        errors: 'Enter a Valid schoolId',
      };
    }
    if (!mongoose.Types.ObjectId.isValid(schoolId)) {
      return {
        ok: false,
        code: 400,
        errors: 'The School ID provided is not a valid ObjectId.',
      };
    }
    // Delete the school and return a result
    const result = await this.mongomodels.school.deleteOne({ _id: schoolId });
    if (result.deletedCount === 0) {
      return {
        ok: false,
        code: 404,
        errors: 'School not found or already deleted.',
      };
    }

    // delete related school_admins to that school
    await this.mongomodels.user.deleteMany({
      school: schoolId,
      role: 'school_admin',
    });
    return {
      ok: true,
      message: 'School successfully deleted.',
    };
  }
  async listSchoolAdmins({ __longToken, schoolId }) {
    const requestingUser = await this.mongomodels.user.findById(
      __longToken.userId
    );
    if (!requestingUser || requestingUser.role !== 'super_admin') {
      return {
        ok: false,
        code: 403,
        errors: 'Only a super_admin can get the school',
      };
    }
    if (!schoolId) {
      return {
        ok: false,
        code: 400,
        errors: 'Enter a Valid schoolId',
      };
    }

    // Fetch and return all the admins for the specified school
    const admins = await this.mongomodels.user.find({
      school: schoolId,
      role: 'school_admin',
    });
    return {
      ok: true,
      admins,
    };
  }
  async updateSchool({ __longToken, schoolId, name, address, administrator }) {
    const requestingUser = await this.mongomodels.user.findById(
      __longToken.userId
    );
    if (!requestingUser || requestingUser.role !== 'super_admin') {
      return {
        ok: false,
        code: 403,
        errors: 'Only a super_admin can update the school',
      };
    }
    if (!schoolId) {
      return {
        ok: false,
        code: 400,
        errors: 'Enter a Valid schoolId',
      };
    }
    if (!mongoose.Types.ObjectId.isValid(schoolId)) {
      return {
        ok: false,
        code: 400,
        errors: 'The School ID provided is not a valid ObjectId.',
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

    if (!name && !address && !administrator) {
      return {
        ok: false,
        code: 400,
        errors: 'You did not provide any data to update!',
      };
    }
    const schoolInfo = { name, address, administrator };

    let result = await this.validators.school.updateSchool(schoolInfo);
    if (result) return result;

    const existingSchool = await this.mongomodels.school.findOne({
      name: name,
    });
    if (existingSchool) {
      return {
        ok: false,
        code: 409,
        errors: 'School with this name or address already exists.',
      };
    }

    let school = await this.mongomodels.school.findOneAndUpdate(
      { _id: schoolId },
      schoolInfo,
      { new: true }
    );

    return {
      ok: true,
      message: 'School Updated Successfully',
      school,
    };
  }
};
