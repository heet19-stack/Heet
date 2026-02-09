from flask import Flask, render_template, request, redirect, url_for, flash, session, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your-secret-key-here')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///timetable.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

# Models
class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # student, teacher, admin
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Role-specific fields
    name = db.Column(db.String(100), nullable=False)
    
    # Student specific
    roll_no = db.Column(db.String(20))
    class_name = db.Column(db.String(20))
    division = db.Column(db.String(10))
    stream = db.Column(db.String(50))
    class_teacher = db.Column(db.String(100))
    approved = db.Column(db.Boolean, default=False)
    
    # Teacher specific
    teacher_id = db.Column(db.String(20))
    subjects = db.Column(db.Text)  # JSON string of subjects
    
    # Admin specific
    admin_id = db.Column(db.String(20))

class Timetable(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    class_name = db.Column(db.String(20), nullable=False)
    division = db.Column(db.String(10), nullable=False)
    day = db.Column(db.String(20), nullable=False)
    time_slot = db.Column(db.String(20), nullable=False)
    subject = db.Column(db.String(100), nullable=False)
    teacher = db.Column(db.String(100), nullable=False)
    room = db.Column(db.String(20), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Notice(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    posted_by = db.Column(db.String(100), nullable=False)
    role = db.Column(db.String(20), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Request(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    teacher_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    request_content = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(20), default='pending')  # pending, approved, rejected
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    teacher = db.relationship('User', backref='requests')

class TeacherAvailability(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    teacher_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    day = db.Column(db.String(20), nullable=False)
    time_slot = db.Column(db.String(20), nullable=False)
    subject = db.Column(db.String(100), nullable=False)
    room_type = db.Column(db.String(20), nullable=False)  # class or lab
    division = db.Column(db.String(10), nullable=False)
    max_students = db.Column(db.Integer, nullable=False)
    
    teacher = db.relationship('User', backref='availability')

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Routes
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/signup')
def signup():
    return render_template('signup.html')

@app.route('/signup/student', methods=['GET', 'POST'])
def signup_student():
    if request.method == 'POST':
        name = request.form['name']
        roll_no = request.form['roll_no']
        class_name = request.form['class']
        division = request.form['division']
        stream = request.form['stream']
        phone = request.form['phone']
        email = request.form['email']
        class_teacher = request.form['class_teacher']
        
        # Store in session for credential setup
        session['signup_data'] = {
            'name': name,
            'roll_no': roll_no,
            'class': class_name,
            'division': division,
            'stream': stream,
            'phone': phone,
            'email': email,
            'class_teacher': class_teacher,
            'role': 'student'
        }
        
        return redirect(url_for('setup_credentials'))
    
    return render_template('signup_student.html')

@app.route('/signup/teacher', methods=['GET', 'POST'])
def signup_teacher():
    if request.method == 'POST':
        name = request.form['name']
        teacher_id = request.form['teacher_id']
        phone = request.form['phone']
        email = request.form['email']
        subjects = request.form.getlist('subjects')
        
        # Store in session for credential setup
        session['signup_data'] = {
            'name': name,
            'teacher_id': teacher_id,
            'phone': phone,
            'email': email,
            'subjects': ','.join(subjects),
            'role': 'teacher'
        }
        
        return redirect(url_for('setup_credentials'))
    
    return render_template('signup_teacher.html')

@app.route('/signup/admin', methods=['GET', 'POST'])
def signup_admin():
    if request.method == 'POST':
        name = request.form['name']
        admin_id = request.form['admin_id']
        phone = request.form['phone']
        email = request.form['email']
        
        # Store in session for credential setup
        session['signup_data'] = {
            'name': name,
            'admin_id': admin_id,
            'phone': phone,
            'email': email,
            'role': 'admin'
        }
        
        return redirect(url_for('setup_credentials'))
    
    return render_template('signup_admin.html')

@app.route('/setup-credentials', methods=['GET', 'POST'])
def setup_credentials():
    if 'signup_data' not in session:
        return redirect(url_for('signup'))
    
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        
        # Check if username already exists
        if User.query.filter_by(username=username).first():
            flash('Username already exists!', 'error')
            return render_template('setup_credentials.html')
        
        # Create user
        signup_data = session['signup_data']
        user = User(
            username=username,
            password=generate_password_hash(password),
            role=signup_data['role'],
            email=signup_data['email'],
            phone=signup_data['phone'],
            name=signup_data['name']
        )
        
        # Add role-specific data
        if signup_data['role'] == 'student':
            user.roll_no = signup_data['roll_no']
            user.class_name = signup_data['class']
            user.division = signup_data['division']
            user.stream = signup_data['stream']
            user.class_teacher = signup_data['class_teacher']
        elif signup_data['role'] == 'teacher':
            user.teacher_id = signup_data['teacher_id']
            user.subjects = signup_data['subjects']
        elif signup_data['role'] == 'admin':
            user.admin_id = signup_data['admin_id']
        
        db.session.add(user)
        db.session.commit()
        
        # Clear session
        session.pop('signup_data', None)
        
        flash('Account created successfully! Please login.', 'success')
        return redirect(url_for('login'))
    
    return render_template('setup_credentials.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        
        user = User.query.filter_by(username=username).first()
        
        # Debug information
        if user:
            print(f"User found: {user.username}, Role: {user.role}")
            print(f"Password hash in DB: {user.password}")
            print(f"Entered password: {password}")
            print(f"Password check result: {check_password_hash(user.password, password)}")
        else:
            print(f"No user found with username: {username}")
        
        if user and check_password_hash(user.password, password):
            login_user(user)
            
            # Redirect based on role
            if user.role == 'student':
                return redirect(url_for('student_dashboard'))
            elif user.role == 'teacher':
                return redirect(url_for('teacher_dashboard'))
            elif user.role == 'admin':
                return redirect(url_for('admin_dashboard'))
        else:
            flash('Invalid username or password!', 'error')
    
    return render_template('login.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('index'))

@app.route('/dashboard/student')
@login_required
def student_dashboard():
    if current_user.role != 'student':
        return redirect(url_for('index'))
    
    # Check if student is approved
    if not current_user.approved:
        flash('Your account is pending approval from your class teacher.', 'warning')
    
    return render_template('student_dashboard.html')

@app.route('/dashboard/teacher')
@login_required
def teacher_dashboard():
    if current_user.role != 'teacher':
        return redirect(url_for('index'))
    
    return render_template('teacher_dashboard.html')

@app.route('/dashboard/admin')
@login_required
def admin_dashboard():
    if current_user.role != 'admin':
        return redirect(url_for('index'))
    
    return render_template('admin_dashboard.html')

# API Routes
@app.route('/api/approve-student/<int:student_id>', methods=['POST'])
@login_required
def approve_student(student_id):
    if current_user.role != 'teacher':
        return jsonify({'error': 'Unauthorized'}), 403
    
    student = User.query.get_or_404(student_id)
    if student.role != 'student':
        return jsonify({'error': 'Invalid student'}), 400
    
    student.approved = True
    db.session.commit()
    
    return jsonify({'message': 'Student approved successfully'})

@app.route('/api/reject-student/<int:student_id>', methods=['POST'])
@login_required
def reject_student(student_id):
    if current_user.role != 'teacher':
        return jsonify({'error': 'Unauthorized'}), 403
    
    student = User.query.get_or_404(student_id)
    if student.role != 'student':
        return jsonify({'error': 'Invalid student'}), 400
    
    db.session.delete(student)
    db.session.commit()
    
    return jsonify({'message': 'Student rejected successfully'})

@app.route('/api/add-availability', methods=['POST'])
@login_required
def add_availability():
    if current_user.role != 'teacher':
        return jsonify({'error': 'Unauthorized'}), 403
    
    data = request.get_json()
    availability = TeacherAvailability(
        teacher_id=current_user.id,
        day=data['day'],
        time_slot=data['time_slot'],
        subject=data['subject'],
        room_type=data['room_type'],
        division=data['division'],
        max_students=data['max_students']
    )
    
    db.session.add(availability)
    db.session.commit()
    
    return jsonify({'message': 'Availability added successfully'})

@app.route('/api/get-availability')
@login_required
def get_availability():
    if current_user.role != 'teacher':
        return jsonify({'error': 'Unauthorized'}), 403
    
    availability = TeacherAvailability.query.filter_by(teacher_id=current_user.id).all()
    return jsonify([{
        'id': a.id,
        'day': a.day,
        'time_slot': a.time_slot,
        'subject': a.subject,
        'room_type': a.room_type,
        'division': a.division,
        'max_students': a.max_students
    } for a in availability])

@app.route('/api/post-notice', methods=['POST'])
@login_required
def post_notice():
    data = request.get_json()
    
    notice = Notice(
        title=data['title'],
        content=data['content'],
        posted_by=current_user.name,
        role=current_user.role
    )
    
    db.session.add(notice)
    db.session.commit()
    
    return jsonify({'message': 'Notice posted successfully'})

@app.route('/api/get-notices')
@login_required
def get_notices():
    notices = Notice.query.order_by(Notice.created_at.desc()).all()
    return jsonify([{
        'id': n.id,
        'title': n.title,
        'content': n.content,
        'posted_by': n.posted_by,
        'role': n.role,
        'created_at': n.created_at.strftime('%Y-%m-%d')
    } for n in notices])

@app.route('/api/send-request', methods=['POST'])
@login_required
def send_request():
    if current_user.role != 'teacher':
        return jsonify({'error': 'Unauthorized'}), 403
    
    data = request.get_json()
    
    request_obj = Request(
        teacher_id=current_user.id,
        request_content=data['request_content']
    )
    
    db.session.add(request_obj)
    db.session.commit()
    
    return jsonify({'message': 'Request sent successfully'})

@app.route('/api/get-requests')
@login_required
def get_requests():
    if current_user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    
    requests = Request.query.order_by(Request.created_at.desc()).all()
    return jsonify([{
        'id': r.id,
        'teacher_id': r.teacher_id,
        'teacher_name': r.teacher.name,
        'request_content': r.request_content,
        'status': r.status,
        'created_at': r.created_at.strftime('%Y-%m-%d')
    } for r in requests])

@app.route('/api/handle-request/<int:request_id>/<string:action>', methods=['POST'])
@login_required
def handle_request_api(request_id, action):
    if current_user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    
    request_obj = Request.query.get_or_404(request_id)
    
    if action == 'approve':
        request_obj.status = 'approved'
    elif action == 'reject':
        request_obj.status = 'rejected'
    else:
        return jsonify({'error': 'Invalid action'}), 400
    
    db.session.commit()
    
    return jsonify({'message': f'Request {action}d successfully'})

@app.route('/api/get-pending-students')
@login_required
def get_pending_students():
    if current_user.role != 'teacher':
        return jsonify({'error': 'Unauthorized'}), 403
    
    # Get students for this teacher's class
    students = User.query.filter_by(role='student', approved=False).all()
    return jsonify([{
        'id': s.id,
        'name': s.name,
        'roll_no': s.roll_no,
        'class_name': s.class_name,
        'division': s.division,
        'stream': s.stream,
        'email': s.email,
        'phone': s.phone,
        'class_teacher': s.class_teacher
    } for s in students])

@app.route('/api/generate-timetable', methods=['POST'])
@login_required
def generate_timetable_api():
    if current_user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    
    data = request.get_json()
    
    # Clear existing timetable
    Timetable.query.delete()
    
    # Simple timetable generation algorithm
    # In a real implementation, this would be much more sophisticated
    time_slots = ['9:00-10:00', '10:00-11:00', '11:30-12:30', '1:30-2:30']
    days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
    
    subjects = ['Mathematics', 'Physics', 'Chemistry', 'English', 'Computer Science']
    teachers = ['John Smith', 'Jane Doe', 'Bob Johnson', 'Alice Brown']
    rooms = ['A101', 'A102', 'Lab 1', 'Lab 2', 'Lab 3']
    
    import random
    
    for day in days:
        for time_slot in time_slots:
            timetable = Timetable(
                class_name='2',
                division='A',
                day=day.capitalize(),
                time_slot=time_slot.replace('-', ' - '),
                subject=random.choice(subjects),
                teacher=random.choice(teachers),
                room=random.choice(rooms)
            )
            db.session.add(timetable)
    
    db.session.commit()
    
    return jsonify({'message': 'Timetable generated successfully'})

@app.route('/api/get-timetable')
@login_required
def get_timetable():
    if current_user.role == 'student':
        # Get timetable for student's class
        timetable = Timetable.query.filter_by(
            class_name=current_user.class_name,
            division=current_user.division
        ).all()
    elif current_user.role == 'teacher':
        # Get timetable for teacher's subjects
        timetable = Timetable.query.filter(
            Timetable.teacher.contains(current_user.name)
        ).all()
    else:  # admin
        # Get all timetable
        timetable = Timetable.query.all()
    
    return jsonify([{
        'id': t.id,
        'class_name': t.class_name,
        'division': t.division,
        'day': t.day,
        'time_slot': t.time_slot,
        'subject': t.subject,
        'teacher': t.teacher,
        'room': t.room
    } for t in timetable])

@app.route('/api/update-timetable/<int:timetable_id>', methods=['PUT'])
@login_required
def update_timetable(timetable_id):
    if current_user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    
    timetable = Timetable.query.get_or_404(timetable_id)
    data = request.get_json()
    
    timetable.subject = data.get('subject', timetable.subject)
    timetable.teacher = data.get('teacher', timetable.teacher)
    timetable.room = data.get('room', timetable.room)
    
    db.session.commit()
    
    return jsonify({'message': 'Timetable updated successfully'})

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        
        # Create dummy users if they don't exist
        if not User.query.filter_by(username='student1').first():
            student = User(
                username='student1',
                password=generate_password_hash('student123'),
                role='student',
                email='student@example.com',
                phone='1234567890',
                name='John Student',
                roll_no='2024001',
                class_name='2',
                division='A',
                stream='Engineering',
                class_teacher='Teacher1',
                approved=True
            )
            db.session.add(student)
        
        if not User.query.filter_by(username='teacher1').first():
            teacher = User(
                username='teacher1',
                password=generate_password_hash('teacher123'),
                role='teacher',
                email='teacher@example.com',
                phone='1234567891',
                name='Jane Teacher',
                teacher_id='T001',
                subjects='Mathematics,Physics'
            )
            db.session.add(teacher)
        
        if not User.query.filter_by(username='admin1').first():
            admin = User(
                username='admin1',
                password=generate_password_hash('admin123'),
                role='admin',
                email='admin@example.com',
                phone='1234567892',
                name='Admin User',
                admin_id='A001'
            )
            db.session.add(admin)
        
        db.session.commit()
        print("Dummy users created!")
        print("Student: username=student1, password=student123")
        print("Teacher: username=teacher1, password=teacher123") 
        print("Admin: username=admin1, password=admin123")
    
    app.run(debug=True)
