const mongoose = require('mongoose');

module.exports = class Classroom {
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
    this.usersCollection = 'classroom';
    this.httpExposed = [
      'post=createClassroom',
      'get=listClassrooms',
      'get=getClassroomById',
      'delete=deleteClassroom',
      'patch=updateClassroom',
    ];
    this.cache = cache;
  }

  async createClassroom({ __longToken, classroomName, school, students }) {
    const requestingUser = await this.mongomodels.user.findById(
      __longToken.userId
    );
    if (!requestingUser || requestingUser.role !== 'school_admin') {
      return {
        ok: false,
        code: 403,
        errors: 'Unauthorized: Only a school_admin can create a classroom.',
      };
    }

    const existingSchool = await this.mongomodels.school.findById(school);
    if (!existingSchool) {
      return {
        ok: false,
        code: 404,
        errors: 'School not found.',
      };
    }

    if (requestingUser.school.toString() !== school.toString()) {
      return {
        ok: false,
        code: 403,
        errors: 'Unauthorized: You can only create classrooms for your school.',
      };
    }

    const classroomInfo = { classroomName, school, students };

    let validationResult = await this.validators.classroom.createClassroom(
      classroomInfo
    );
    if (validationResult) return validationResult;

    try {
      let createdClassroom = await this.mongomodels.classroom.create(
        classroomInfo
      );
      return {
        ok: true,
        classroom: createdClassroom,
      };
    } catch (error) {
      if (error.code === 11000) {
        return {
          ok: false,
          code: 409,
          errors: 'A classroom with this name already exists at this school.',
        };
      }
      return {
        ok: false,
        code: 500,
        errors: 'Internal server error.',
      };
    }
  }
  async listClassrooms({ __longToken }) {
    const requestingUser = await this.mongomodels.user.findById(
      __longToken.userId
    );

    if (!requestingUser || requestingUser.role !== 'school_admin') {
      return {
        ok: false,
        code: 403,
        errors: 'Unauthorized: Only a school_admin can list classrooms.',
      };
    }

    const classrooms = await this.mongomodels.classroom.find({
      school: requestingUser.school,
    });

    return {
      ok: true,
      classrooms,
    };
  }
  async getClassroomById({ __longToken, classroomId }) {
    const requestingUser = await this.mongomodels.user.findById(
      __longToken.userId
    );

    if (!requestingUser || requestingUser.role !== 'school_admin') {
      return {
        ok: false,
        code: 403,
        errors: 'Unauthorized: Only a school_admin can get classroom details.',
      };
    }
    if (!classroomId) {
      return {
        ok: false,
        code: 400,
        errors: 'provide a classroomId Please!.',
      };
    }
    if (!mongoose.Types.ObjectId.isValid(classroomId)) {
      return {
        ok: false,
        code: 400,
        errors: 'The classroom ID provided is not a valid ObjectId.',
      };
    }

    const classroom = await this.mongomodels.classroom.findOne({
      _id: classroomId,
      school: requestingUser.school,
    });

    if (!classroom) {
      return {
        ok: false,
        code: 404,
        errors: 'Classroom not found.',
      };
    }

    return {
      ok: true,
      classroom,
    };
  }
  async deleteClassroom({ __longToken, classroomId }) {
    const requestingUser = await this.mongomodels.user.findById(
      __longToken.userId
    );

    if (!requestingUser || requestingUser.role !== 'school_admin') {
      return {
        ok: false,
        code: 403,
        errors: 'Unauthorized: Only a school_admin can delete a classroom.',
      };
    }

    if (!classroomId) {
      return {
        ok: false,
        code: 400,
        errors: 'Please Provide classroomId.',
      };
    }
    if (!mongoose.Types.ObjectId.isValid(classroomId)) {
      return {
        ok: false,
        code: 400,
        errors: 'The classroom ID provided is not a valid ObjectId.',
      };
    }

    const classroom = await this.mongomodels.classroom.findOneAndDelete({
      _id: classroomId,
      school: requestingUser.school,
    });

    if (!classroom) {
      return {
        ok: false,
        code: 404,
        errors: 'Classroom not found or already deleted.',
      };
    }

    return {
      ok: true,
      message: 'Classroom deleted successfully.',
    };
  }
  async updateClassroom({ __longToken, classroomId, classroomName, students }) {
    const requestingUser = await this.mongomodels.user.findById(
      __longToken.userId
    );

    if (!requestingUser || requestingUser.role !== 'school_admin') {
      return {
        ok: false,
        code: 403,
        errors: 'Unauthorized: Only a school_admin can update a classroom.',
      };
    }

    if (!classroomId) {
      return {
        ok: false,
        code: 400,
        errors: 'Please Provide classroomId.',
      };
    }
    if (!mongoose.Types.ObjectId.isValid(classroomId)) {
      return {
        ok: false,
        code: 400,
        errors: 'The classroom ID provided is not a valid ObjectId.',
      };
    }

    if (!classroomName && !students) {
      return {
        ok: false,
        code: 400,
        errors: 'No Data Provided to update.',
      };
    }
    const updateData = {};
    if (classroomName) updateData.classroomName = classroomName;
    if (students) updateData.students = students;

    const updatedClassroom = await this.mongomodels.classroom.findOneAndUpdate(
      {
        _id: classroomId,
        school: requestingUser.school,
      },
      updateData,
      { new: true }
    );

    if (!updatedClassroom) {
      return {
        ok: false,
        code: 404,
        errors: 'Classroom not found.',
      };
    }

    return {
      ok: true,
      classroom: updatedClassroom,
    };
  }
};
