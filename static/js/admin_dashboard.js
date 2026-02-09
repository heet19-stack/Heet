// Admin Dashboard JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Navigation functionality (inherited from dashboard.js)
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.dashboard-section');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            navLinks.forEach(l => l.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));
            
            this.classList.add('active');
            
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.classList.add('active');
            }
        });
    });
    
    // Notice posting functionality
    const noticeForm = document.querySelector('#post-notice form');
    if (noticeForm) {
        noticeForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const title = document.getElementById('notice-title').value;
            const content = document.getElementById('notice-content').value;
            const audience = document.getElementById('notice-audience').value;
            
            if (title && content) {
                addNoticeToView(title, content, audience);
                showMessage('Notice posted successfully!', 'success');
                this.reset();
            } else {
                showMessage('Please fill in all required fields!', 'error');
            }
        });
    }
    
    // Request handling functionality
    const requestCards = document.querySelectorAll('.request-card');
    requestCards.forEach(card => {
        const approveBtn = card.querySelector('.btn-success');
        const rejectBtn = card.querySelector('.btn-danger');
        
        if (approveBtn) {
            approveBtn.addEventListener('click', function() {
                handleRequest(card, 'approved');
            });
        }
        
        if (rejectBtn) {
            rejectBtn.addEventListener('click', function() {
                handleRequest(card, 'rejected');
            });
        }
    });
    
    // Timetable editing functionality
    const editableCells = document.querySelectorAll('.editable td[contenteditable="true"]');
    editableCells.forEach(cell => {
        cell.addEventListener('blur', function() {
            // Auto-save functionality can be implemented here
            console.log('Cell content changed:', this.textContent);
        });
        
        cell.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.blur();
            }
        });
    });
    
    // Save timetable changes
    const saveBtn = document.querySelector('.editor-toolbar .btn-primary');
    if (saveBtn) {
        saveBtn.addEventListener('click', function() {
            showMessage('Timetable changes saved successfully!', 'success');
        });
    }
});

// Timetable generation algorithm
function generateTimetable() {
    const progressSection = document.getElementById('generation-progress');
    const progressFill = document.getElementById('progress-fill');
    const progressStatus = document.getElementById('progress-status');
    const generatedSection = document.getElementById('generated-timetable');
    
    // Show progress section
    progressSection.style.display = 'block';
    
    // Simulate timetable generation process
    const steps = [
        { progress: 20, message: 'Analyzing teacher availability...' },
        { progress: 40, message: 'Checking classroom capacities...' },
        { progress: 60, message: 'Resolving scheduling conflicts...' },
        { progress: 80, message: 'Optimizing workload distribution...' },
        { progress: 100, message: 'Generating final timetable...' }
    ];
    
    let currentStep = 0;
    
    const processStep = () => {
        if (currentStep < steps.length) {
            const step = steps[currentStep];
            progressFill.style.width = step.progress + '%';
            progressStatus.textContent = step.message;
            currentStep++;
            
            setTimeout(processStep, 1000);
        } else {
            // Hide progress and show generated timetable
            setTimeout(() => {
                progressSection.style.display = 'none';
                generatedSection.style.display = 'block';
                populateGeneratedTimetable();
                showMessage('Timetable generated successfully!', 'success');
            }, 500);
        }
    };
    
    processStep();
}

// Function to populate generated timetable
function populateGeneratedTimetable() {
    const timetableBody = document.getElementById('timetable-body');
    if (!timetableBody) return;
    
    // Sample timetable data (in real implementation, this would come from the algorithm)
    const timetableData = [
        {
            time: '9:00 - 10:00',
            monday: '2A - Mathematics<br><small>Room: A101</small>',
            tuesday: '2B - Physics<br><small>Room: Lab 1</small>',
            wednesday: '2C - Chemistry<br><small>Room: Lab 2</small>',
            thursday: '2D - English<br><small>Room: A102</small>',
            friday: '2A - Computer Science<br><small>Room: Lab 3</small>'
        },
        {
            time: '10:00 - 11:00',
            monday: '2B - Physics<br><small>Room: Lab 1</small>',
            tuesday: '2A - Mathematics<br><small>Room: A101</small>',
            wednesday: '2D - Biology<br><small>Room: Lab 2</small>',
            thursday: '2C - History<br><small>Room: A103</small>',
            friday: '2B - Chemistry<br><small>Room: Lab 2</small>'
        },
        {
            time: '11:30 - 12:30',
            monday: '2C - English<br><small>Room: A102</small>',
            tuesday: '2D - Computer Science<br><small>Room: Lab 3</small>',
            wednesday: '2A - Mathematics<br><small>Room: A101</small>',
            thursday: '2B - Physics<br><small>Room: Lab 1</small>',
            friday: '2C - Biology<br><small>Room: Lab 2</small>'
        },
        {
            time: '1:30 - 2:30',
            monday: '2D - History<br><small>Room: A103</small>',
            tuesday: '2C - Chemistry<br><small>Room: Lab 2</small>',
            wednesday: '2B - English<br><small>Room: A102</small>',
            thursday: '2A - Computer Science<br><small>Room: Lab 3</small>',
            friday: '2D - Mathematics<br><small>Room: A101</small>'
        }
    ];
    
    // Clear existing content
    timetableBody.innerHTML = '';
    
    // Populate timetable
    timetableData.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${row.time}</td>
            <td class="subject-cell">${row.monday}</td>
            <td class="subject-cell">${row.tuesday}</td>
            <td class="subject-cell">${row.wednesday}</td>
            <td class="subject-cell">${row.thursday}</td>
            <td class="subject-cell">${row.friday}</td>
        `;
        timetableBody.appendChild(tr);
    });
}

// Function to upload timetable
function uploadTimetable() {
    if (confirm('Are you sure you want to upload this timetable? This will make it visible to all students and teachers.')) {
        // Simulate upload process
        showMessage('Timetable uploaded successfully! Students and teachers can now view it.', 'success');
        
        // In a real implementation, this would send data to the server
        console.log('Uploading timetable to server...');
    }
}

// Function to edit timetable
function editTimetable() {
    // Switch to edit timetable section
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.dashboard-section');
    
    navLinks.forEach(l => l.classList.remove('active'));
    sections.forEach(s => s.classList.remove('active'));
    
    const editLink = document.querySelector('a[href="#edit-timetable"]');
    const editSection = document.getElementById('edit-timetable');
    
    if (editLink && editSection) {
        editLink.classList.add('active');
        editSection.classList.add('active');
    }
}

// Function to export timetable
function exportTimetable() {
    const table = document.querySelector('.timetable-table');
    if (table) {
        let csv = '';
        const rows = table.querySelectorAll('tr');
        
        rows.forEach(row => {
            const cols = row.querySelectorAll('th, td');
            const rowData = [];
            cols.forEach(col => {
                // Clean up HTML tags for CSV
                const text = col.textContent.trim().replace(/\n/g, ' ').replace(/\s+/g, ' ');
                rowData.push('"' + text + '"');
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

// Function to handle requests
function handleRequest(card, status) {
    const statusElement = card.querySelector('.request-status');
    const actionsDiv = card.querySelector('.request-actions');
    
    // Update status
    statusElement.className = `request-status ${status}`;
    statusElement.textContent = status.charAt(0).toUpperCase() + status.slice(1);
    
    // Remove action buttons and add approved/rejected info
    if (status === 'approved') {
        actionsDiv.innerHTML = '<span class="approved-badge">Approved on ' + new Date().toLocaleDateString() + '</span>';
        showMessage('Request approved!', 'success');
    } else if (status === 'rejected') {
        actionsDiv.innerHTML = '<span class="rejected-badge">Rejected on ' + new Date().toLocaleDateString() + '</span>';
        showMessage('Request rejected!', 'error');
    }
}

// Function to add notice to view
function addNoticeToView(title, content, audience) {
    const noticesContainer = document.querySelector('#view-notices .notices-container');
    if (noticesContainer) {
        const noticeCard = document.createElement('div');
        noticeCard.className = 'notice-card';
        noticeCard.innerHTML = `
            <div class="notice-header">
                <h3>${title}</h3>
                <span class="notice-date">Posted: ${new Date().toLocaleDateString()}</span>
            </div>
            <div class="notice-content">
                <p>${content}</p>
            </div>
            <div class="notice-footer">
                <span class="notice-author">Posted by: Admin</span>
                <span class="notice-audience">Audience: ${audience}</span>
                <button class="btn btn-small btn-danger" onclick="this.closest('.notice-card').remove()">Delete</button>
            </div>
        `;
        
        // Add to the top of the container
        noticesContainer.insertBefore(noticeCard, noticesContainer.firstChild);
    }
}

// Function to validate timetable configuration
function validateTimetableConfig() {
    const workingDays = document.querySelectorAll('input[name="working-days"]:checked');
    const classAvailability = document.getElementById('class-availability').value;
    
    if (workingDays.length === 0) {
        showMessage('Please select at least one working day!', 'error');
        return false;
    }
    
    if (!classAvailability.trim()) {
        showMessage('Please enter classroom and lab availability!', 'error');
        return false;
    }
    
    return true;
}

// Function to show messages (reused from dashboard.js)
function showMessage(message, type) {
    const existingAlerts = document.querySelectorAll('.alert');
    existingAlerts.forEach(alert => alert.remove());
    
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    
    const main = document.querySelector('.dashboard-main');
    if (main) {
        main.insertBefore(alert, main.firstChild);
        
        setTimeout(() => {
            alert.remove();
        }, 5000);
    }
}

// Function to reset timetable generator form
function resetTimetableForm() {
    const form = document.querySelector('.generator-form form');
    if (form) {
        form.reset();
        
        // Reset working days to default (Monday-Friday)
        const weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
        weekdays.forEach(day => {
            const checkbox = document.getElementById(day);
            if (checkbox) checkbox.checked = true;
        });
        
        const saturdayCheckbox = document.getElementById('saturday');
        if (saturdayCheckbox) saturdayCheckbox.checked = false;
    }
}

// Function to preview timetable before generation
function previewTimetableConfig() {
    const academicYear = document.getElementById('academic-year').value;
    const semester = document.getElementById('semester').value;
    const workingDays = Array.from(document.querySelectorAll('input[name="working-days"]:checked'))
        .map(cb => cb.value);
    const classAvailability = document.getElementById('class-availability').value;
    
    const content = `
        <h4>Timetable Configuration Summary</h4>
        <p><strong>Academic Year:</strong> ${academicYear}</p>
        <p><strong>Semester:</strong> ${semester}</p>
        <p><strong>Working Days:</strong> ${workingDays.join(', ')}</p>
        <p><strong>Classroom & Lab Availability:</strong></p>
        <pre>${classAvailability}</pre>
    `;
    
    const actions = [
        { text: 'Generate Timetable', class: 'btn-primary', onclick: 'generateTimetable(); this.closest(".modal").remove();' },
        { text: 'Cancel', class: 'btn-secondary', onclick: 'this.closest(".modal").remove();' }
    ];
    
    createModal('Preview Configuration', content, actions);
}

// Function to create modal (reused from dashboard.js)
function createModal(title, content, actions = []) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    `;
    
    modal.innerHTML = `
        <div style="background: white; padding: 30px; border-radius: 15px; max-width: 600px; width: 90%; max-height: 80vh; overflow-y: auto;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid #e1e5e9; padding-bottom: 10px;">
                <h3>${title}</h3>
                <button style="background: none; border: none; font-size: 24px; cursor: pointer;" onclick="this.closest('.modal').remove()">&times;</button>
            </div>
            <div>
                ${content}
            </div>
            <div style="margin-top: 20px; display: flex; gap: 10px; justify-content: flex-end;">
                ${actions.map(action => `<button class="btn ${action.class}" onclick="${action.onclick}">${action.text}</button>`).join('')}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
    
    return modal;
}
