// Dashboard JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Navigation functionality
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.dashboard-section');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links and sections
            navLinks.forEach(l => l.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Show corresponding section
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.classList.add('active');
            }
        });
    });
    
    // Student approval functionality
    const approveButtons = document.querySelectorAll('.btn-success');
    const rejectButtons = document.querySelectorAll('.btn-danger');
    
    approveButtons.forEach(button => {
        if (button.textContent === 'Approve') {
            button.addEventListener('click', function() {
                const studentCard = this.closest('.student-card');
                if (studentCard) {
                    if (confirm('Are you sure you want to approve this student?')) {
                        studentCard.style.opacity = '0.5';
                        this.textContent = 'Approved';
                        this.disabled = true;
                        this.nextElementSibling.disabled = true;
                        
                        // Show success message
                        showMessage('Student approved successfully!', 'success');
                    }
                }
            });
        }
    });
    
    rejectButtons.forEach(button => {
        if (button.textContent === 'Reject') {
            button.addEventListener('click', function() {
                const studentCard = this.closest('.student-card');
                if (studentCard) {
                    if (confirm('Are you sure you want to reject this student?')) {
                        studentCard.style.display = 'none';
                        showMessage('Student rejected!', 'error');
                    }
                }
            });
        }
    });
    
    // Notice posting functionality
    const noticeForm = document.querySelector('#post-notice form');
    if (noticeForm) {
        noticeForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const title = document.getElementById('notice-title').value;
            const content = document.getElementById('notice-content').value;
            
            if (title && content) {
                showMessage('Notice posted successfully!', 'success');
                this.reset();
            } else {
                showMessage('Please fill in all fields!', 'error');
            }
        });
    }
    
    // Request sending functionality
    const requestForm = document.querySelector('#requests form');
    if (requestForm) {
        requestForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const content = document.getElementById('request-content').value;
            
            if (content) {
                showMessage('Request sent to admin successfully!', 'success');
                this.reset();
            } else {
                showMessage('Please enter your request details!', 'error');
            }
        });
    }
    
    // Availability form functionality
    const availabilityForm = document.querySelector('#availability form');
    if (availabilityForm) {
        availabilityForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const day = document.getElementById('day').value;
            const timeSlot = document.getElementById('time-slot').value;
            const subject = document.getElementById('subject').value;
            const roomType = document.getElementById('room-type').value;
            const division = document.getElementById('division').value;
            const maxStudents = document.getElementById('max-students').value;
            
            if (day && timeSlot && subject && roomType && division && maxStudents) {
                addAvailabilityItem(day, timeSlot, subject, roomType, division, maxStudents);
                showMessage('Availability added successfully!', 'success');
                this.reset();
            } else {
                showMessage('Please fill in all fields!', 'error');
            }
        });
    }
    
    // Remove availability items
    const removeButtons = document.querySelectorAll('.availability-item .btn-danger');
    removeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const availabilityItem = this.closest('.availability-item');
            if (availabilityItem) {
                availabilityItem.remove();
                showMessage('Availability removed!', 'success');
            }
        });
    });
});

// Function to add availability item
function addAvailabilityItem(day, timeSlot, subject, roomType, division, maxStudents) {
    const availabilityList = document.querySelector('.availability-list');
    if (availabilityList) {
        const newItem = document.createElement('div');
        newItem.className = 'availability-item';
        newItem.innerHTML = `
            <span>${day.charAt(0).toUpperCase() + day.slice(1)} - ${timeSlot} - ${subject} - ${roomType.charAt(0).toUpperCase() + roomType.slice(1)} ${division} - ${maxStudents} students</span>
            <button class="btn btn-small btn-danger" onclick="this.parentElement.remove()">Remove</button>
        `;
        availabilityList.appendChild(newItem);
    }
}

// Function to show messages
function showMessage(message, type) {
    // Remove any existing alerts
    const existingAlerts = document.querySelectorAll('.alert');
    existingAlerts.forEach(alert => alert.remove());
    
    // Create new alert
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    
    // Insert at the top of the main content
    const main = document.querySelector('.dashboard-main');
    if (main) {
        main.insertBefore(alert, main.firstChild);
        
        // Remove after 5 seconds
        setTimeout(() => {
            alert.remove();
        }, 5000);
    }
}

// Export timetable functionality
function exportTimetable() {
    const table = document.querySelector('.timetable-table');
    if (table) {
        let csv = '';
        const rows = table.querySelectorAll('tr');
        
        rows.forEach(row => {
            const cols = row.querySelectorAll('th, td');
            const rowData = [];
            cols.forEach(col => {
                rowData.push(col.textContent.trim());
            });
            csv += rowData.join(',') + '\n';
        });
        
        // Create download link
        const link = document.createElement('a');
        link.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
        link.download = 'timetable.csv';
        link.click();
        
        showMessage('Timetable exported successfully!', 'success');
    }
}

// Print timetable functionality
function printTimetable() {
    window.print();
}

// Function to filter notices
function filterNotices(filter) {
    const notices = document.querySelectorAll('.notice-card');
    notices.forEach(notice => {
        if (filter === 'all') {
            notice.style.display = 'block';
        } else {
            // Add filtering logic based on filter type
            notice.style.display = 'block';
        }
    });
}

// Function to search students
function searchStudents(query) {
    const studentCards = document.querySelectorAll('.student-card');
    studentCards.forEach(card => {
        const text = card.textContent.toLowerCase();
        if (text.includes(query.toLowerCase())) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
}

// Function to validate forms
function validateForm(form) {
    const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!input.value.trim()) {
            isValid = false;
            input.style.borderColor = '#dc3545';
        } else {
            input.style.borderColor = '#e1e5e9';
        }
    });
    
    return isValid;
}

// Function to format date
function formatDate(date) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString(undefined, options);
}

// Function to handle file uploads
function handleFileUpload(input, callback) {
    input.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                callback(e.target.result);
            };
            reader.readAsText(file);
        }
    });
}

// Function to create a modal
function createModal(title, content, actions = []) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                ${content}
            </div>
            <div class="modal-footer">
                ${actions.map(action => `<button class="btn ${action.class}" onclick="${action.onclick}">${action.text}</button>`).join('')}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close modal functionality
    modal.querySelector('.modal-close').addEventListener('click', () => {
        modal.remove();
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
    
    return modal;
}
