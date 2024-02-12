const bcrypt = require('bcrypt');
const User = require('../user/user.mongoModel');

module.exports = class DefaultAdmin {
  constructor() {
    this.mongomodels = {
      user: User,
    };
  }

  async signupAdmin({ username, email, password }) {
    let userInfo = {
      username,
      email,
      password,
      role: 'super_admin',
    };

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

  async createDefaultAdmin() {
    const adminExists = await this.mongomodels.user.findOne({
      role: 'super_admin',
    });

    if (!adminExists) {
      try {
        const defaultAdmin = await this.signupAdmin({
          username: 'defaultadmin',
          email: 'admin@example.com',
          password: 'securepassword',
        });
        console.log('Default admin created successfully', defaultAdmin);
      } catch (error) {
        console.error('Error creating default admin:', error.message);
      }
    } else {
      console.log('Default admin already exists');
    }
  }
};
