# Automated Timetable Generator

A comprehensive web application for automatically generating academic timetables for schools and colleges. The system reduces manual effort and minimizes scheduling conflicts by considering teacher availability, classroom capacity, course requirements, and student group constraints.

## Features

### 🎓 Student Portal
- View personalized weekly timetable
- Access notices and announcements from teachers and admin
- Secure login system
- Account approval system by class teachers

### 👨‍🏫 Teacher Portal
- Approve/reject student registrations
- Set availability preferences (days, time slots, subjects)
- View personal teaching timetable
- Post notices for students and staff
- Send timetable change requests to admin
- Manage classroom/lab preferences

### ⚙️ Admin Portal
- **Intelligent Timetable Generation**: Automated algorithm with conflict resolution
- **Timetable Management**: Edit, update, and manage schedules
- **Request Management**: Review and handle teacher requests
- **Notice System**: Post institution-wide announcements
- **User Management**: Oversee all student and teacher accounts
- **Export Functionality**: Export timetables in multiple formats

### 🤖 Core Algorithm Features
- **Conflict Resolution**: Prevents double-booking of teachers and classrooms
- **Workload Balancing**: Distributes teaching load evenly across days
- **Constraint Satisfaction**: Considers teacher availability, room capacity, and student divisions
- **Optimization**: Minimizes gaps and maximizes efficiency
- **Scalability**: Works for institutions of various sizes

## Technology Stack

- **Backend**: Flask (Python)
- **Database**: SQLite (with SQLAlchemy ORM)
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla JS)
- **Authentication**: Flask-Login with bcrypt password hashing
- **Styling**: Custom CSS with responsive design
- **API**: RESTful API endpoints

## Installation & Setup

### Prerequisites
- Python 3.8 or higher
- pip (Python package manager)

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd automated-timetable-generator
```

### Step 2: Create Virtual Environment
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

### Step 3: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 4: Environment Configuration
Create a `.env` file in the root directory:
```env
SECRET_KEY=your-secret-key-change-this-in-production
DATABASE_URL=sqlite:///timetable.db
FLASK_ENV=development
FLASK_DEBUG=True
```

### Step 5: Run the Application
```bash
python app.py
```

The application will be available at `http://localhost:5000`

## Usage Guide

### 1. Initial Setup
1. Start by creating an admin account through the signup process
2. Log in as admin to access the admin dashboard

### 2. Adding Teachers
1. Teachers can sign up through the main signup page
2. They select "Teacher" role and fill in their details
3. Teachers set their subjects and availability preferences

### 3. Student Registration
1. Students sign up and select "Student" role
2. They fill in academic details (class, division, stream, etc.)
3. Registration requires approval from their class teacher
4. Teachers approve students through their dashboard

### 4. Timetable Generation
1. Admin configures timetable parameters (working days, time slots, room availability)
2. Click "Generate Timetable" to run the automated algorithm
3. Review the generated timetable and make manual adjustments if needed
4. Upload the final timetable to make it visible to all users

### 5. Daily Operations
- **Students**: View their timetable and check notices
- **Teachers**: Manage availability, post notices, send change requests
- **Admin**: Handle requests, post announcements, manage system

## API Endpoints

### Authentication
- `POST /login` - User login
- `POST /logout` - User logout

### Student Management
- `GET /api/get-pending-students` - Get pending student approvals
- `POST /api/approve-student/<id>` - Approve student
- `POST /api/reject-student/<id>` - Reject student

### Teacher Availability
- `POST /api/add-availability` - Add teacher availability
- `GET /api/get-availability` - Get teacher availability

### Notices
- `POST /api/post-notice` - Post new notice
- `GET /api/get-notices` - Get all notices

### Requests
- `POST /api/send-request` - Send request to admin
- `GET /api/get-requests` - Get all requests (admin only)
- `POST /api/handle-request/<id>/<action>` - Approve/reject request

### Timetable
- `POST /api/generate-timetable` - Generate new timetable
- `GET /api/get-timetable` - Get timetable data
- `PUT /api/update-timetable/<id>` - Update timetable entry

## Database Schema

### Users Table
- Authentication and role management
- Role-specific fields for students, teachers, and admins

### Timetable Table
- Generated schedule data
- Links classes, teachers, subjects, and rooms

### Notices Table
- Announcement system
- Supports role-based posting and viewing

### Requests Table
- Teacher-to-admin communication
- Tracks request status and history

### TeacherAvailability Table
- Teacher preferences and constraints
- Used by timetable generation algorithm

## Algorithm Overview

The timetable generation algorithm follows these steps:

1. **Input Collection**: Gather teacher availability, room constraints, and course requirements
2. **Constraint Analysis**: Identify hard constraints (must satisfy) and soft constraints (prefer to satisfy)
3. **Initial Assignment**: Create initial schedule using greedy approach
4. **Conflict Resolution**: Detect and resolve double-bookings and violations
5. **Optimization**: Apply heuristics to balance workload and minimize gaps
6. **Validation**: Ensure all constraints are satisfied
7. **Output Generation**: Produce final timetable in required format

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Security Considerations

- Password hashing with bcrypt
- Role-based access control
- Session management with Flask-Login
- Input validation and sanitization
- SQL injection prevention with SQLAlchemy ORM

## Future Enhancements

- **Advanced Algorithm**: Implement genetic algorithm or constraint satisfaction solver
- **Elective Courses**: Handle student elective selections
- **Lab Scheduling**: Specialized lab equipment and time slot management
- **Extra-curricular Activities**: Integrate sports and club activities
- **Mobile App**: React Native or Flutter mobile application
- **Email Notifications**: Automated email alerts for timetable changes
- **Calendar Integration**: Export to Google Calendar, Outlook, etc.
- **Analytics**: Timetable efficiency analysis and reporting
- **Multi-institution Support**: Scale to multiple schools/colleges

## Troubleshooting

### Common Issues

1. **Database Error**: Ensure SQLite is properly installed
2. **Import Errors**: Check all dependencies are installed correctly
3. **Permission Issues**: Run with appropriate file permissions
4. **Port Conflicts**: Change port if 5000 is already in use

### Debug Mode
Enable debug mode by setting `FLASK_DEBUG=True` in `.env` file for detailed error messages.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the GitHub repository
- Email: support@timetable-generator.com
- Documentation: [Link to documentation]

## Acknowledgments

- Flask framework and community
- SQLAlchemy for database management
- Bootstrap inspiration for UI components
- Educational institutions that provided requirements and feedback
