### School Management API

## Installation

```bash
Clone the github repository

create a .env file config/envs directory and add the fill the environment variables as in .example.env

connect to redis :
a. Run Locally :
    redis-server

b. Using Docker:
docker-compose up

To Run Application :

npm start
```

## Default Super Admin Account

```bash

Upon initial setup, if no Super Admin account is found, the system will automatically create a default super admin account with the following credentials:

- **Username: defaultadmin
- **Email: admin@example.com
- **Password: securepassword

To change the default admin data you can find them in the .example.env



```

### EndPoints

```bash

- `POST /login`: Authenticate a user and receive an access token.

### Super_Admin will perform these operations

- `POST /createUser`: Create a new School-admin.
# Schools
- `POST /createSchool`: Create a new school.
- `GET /listSchools`: Retrieve a list of all schools.
- `GET /getSchoolById`: Get details of a specific school by ID.
- `DELETE /deleteSchool`: Delete a school by ID.
- `GET /listSchoolAdmins`: Retrieve a list of all school administrators.
- `PATCH /updateSchool`: Update school details by ID.

### School_Admin will perform these operations

# Students
- `PATCH /updateStudent`: Update details of a student.
- `GET /listStudents`: Retrieve a list of all students.
- `GET /listStudentsForClassroom`: Retrieve a list of all students for a specific classroom.
- `GET /getStudentById`: Get details of a specific student by ID.
- `DELETE /deleteStudent`: Delete a student by ID.
# Classrooms
- `POST /createClassroom`: Create a new classroom.
- `GET /listClassrooms`: Retrieve a list of all classrooms.
- `GET /getClassroomById`: Get details of a specific classroom by its ID.
- `DELETE /deleteClassroom`: Delete a classroom by ID.
- `PATCH /updateClassroom`: Update classroom details by ID.

```
