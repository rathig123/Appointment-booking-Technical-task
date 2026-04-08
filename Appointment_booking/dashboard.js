let appointments = JSON.parse(localStorage.getItem('appointments')) || [];

// Modal functionality
const modal = document.getElementById('appointmentModal');
const bookBtn = document.getElementById('book-now');
const closeBtn = document.querySelector('.close-btn');
const cancelBtn = document.getElementById('cancelBtn');
const form = document.getElementById('appointmentForm');
const appointmentDate = document.getElementById('appointmentDate');
const appointmentTime = document.getElementById('appointmentTime');

function updatePlaceholderState(input) {
    if (input.value) {
        input.classList.add('has-value');
    } else {
        input.classList.remove('has-value');
    }
}

[appointmentDate, appointmentTime].forEach(input => {
    updatePlaceholderState(input);
    input.addEventListener('input', () => updatePlaceholderState(input));
    input.addEventListener('change', () => updatePlaceholderState(input));
    input.addEventListener('blur', () => updatePlaceholderState(input));
});

// Open modal
bookBtn.addEventListener('click', () => {
    modal.classList.add('active');
    form.reset();
    updatePlaceholderState(appointmentDate);
    updatePlaceholderState(appointmentTime);
});

// Close modal
closeBtn.addEventListener('click', () => {
    modal.classList.remove('active');
});

cancelBtn.addEventListener('click', () => {
    modal.classList.remove('active');
});

// Close modal when clicking outside
window.addEventListener('click', (event) => {
    if (event.target === modal) {
        modal.classList.remove('active');
    }
});

// Handle form submission
form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const selectedDate = document.getElementById('appointmentDate').value;
    const selectedTime = document.getElementById('appointmentTime').value;
    
    // Validate date and time
    if (!selectedDate || !selectedTime) {
        alert('Please select both date and time');
        return;
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const appointmentDateTime = new Date(selectedDate);
    const currentDateTime = new Date();
    
    // Check if date is in the past
    if (appointmentDateTime < today) {
        alert('Cannot book appointment for past dates. Please select today or a future date.');
        return;
    }
    
    // Check if time is in the past for today
    if (appointmentDateTime.getTime() === today.getTime()) {
        const [hours, minutes] = selectedTime.split(':');
        const selectedDateTime = new Date();
        selectedDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        
        if (selectedDateTime < currentDateTime) {
            alert('Cannot book appointment for past times. Please select a future time.');
            return;
        }
    }
    
    const appointment = {
        id: Date.now(),
        patientName: document.getElementById('patientName').value,
        doctorName: document.getElementById('doctorName').value,
        hospitalName: document.getElementById('hospitalName').value,
        specialty: document.getElementById('specialty').value,
        date: selectedDate,
        time: selectedTime,
        reason: document.getElementById('reason').value
    };

    appointments.push(appointment);
    localStorage.setItem('appointments', JSON.stringify(appointments));
    
    alert('Appointment scheduled successfully!');
    modal.classList.remove('active');
    displayAppointments();
});

// Filter buttons
function formatTime(time24) {
    const [hours, minutes] = time24.split(':');
    let hours12 = parseInt(hours);
    const ampm = hours12 >= 12 ? 'PM' : 'AM';
    hours12 = hours12 % 12 || 12;
    return `${hours12}:${minutes} ${ampm}`;
}

function filterAppointments() {
    const patientSearch = document.getElementById('patientSearch').value.toLowerCase();
    const doctorSearch = document.getElementById('doctorSearch').value.toLowerCase();
    const dateFrom = document.getElementById('dateFrom').value;
    const dateTo = document.getElementById('dateTo').value;

    const tbody = document.getElementById('appointmentsList');
    
    const filtered = appointments.filter(apt => {
        const patientMatch = apt.patientName.toLowerCase().includes(patientSearch);
        const doctorMatch = apt.doctorName.toLowerCase().includes(doctorSearch);
        
        let dateMatch = true;
        if (dateFrom && dateTo) {
            const aptDate = new Date(apt.date);
            dateMatch = aptDate >= new Date(dateFrom) && aptDate <= new Date(dateTo);
        }
        
        return patientMatch && doctorMatch && dateMatch;
    });

    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="no-appointments">No appointments found.</td></tr>';
        return;
    }

    tbody.innerHTML = filtered.map(apt => `
        <tr>
            <td>${apt.patientName}</td>
            <td>${apt.doctorName}</td>
            <td>${apt.hospitalName}</td>
            <td>${apt.specialty}</td>
            <td>${new Date(apt.date).toLocaleDateString()}</td>
            <td>${formatTime(apt.time)}</td>
            <td>
                <div class="action-icons">
                    <button onclick="editAppointment(${apt.id})" title="Edit"><i class="material-symbols-outlined">edit</i></button>
                    <button onclick="deleteAppointment(${apt.id})" title="Delete"><i class="material-symbols-outlined">delete</i></button>
                </div>
            </td>
        </tr>
    `).join('');
}

function displayAppointments() {
    const tbody = document.getElementById('appointmentsList');
    
    if (appointments.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="no-appointments">No appointments found.</td></tr>';
        return;
    }

    const sortedAppointments = appointments.slice().sort((a, b) => new Date(a.date) - new Date(b.date));

    tbody.innerHTML = sortedAppointments.map(apt => `
        <tr>
            <td>${apt.patientName}</td>
            <td>${apt.doctorName}</td>
            <td>${apt.hospitalName}</td>
            <td>${apt.specialty}</td>
            <td>${new Date(apt.date).toLocaleDateString()}</td>
            <td>${formatTime(apt.time)}</td>
            <td>
                <div class="action-icons">
                    <button onclick="editAppointment(${apt.id})" title="Edit"><i class="material-symbols-outlined">edit</i></button>
                    <button onclick="deleteAppointment(${apt.id})" title="Delete" id="action-icon1"><i class="material-symbols-outlined">delete</i></button>
                </div>
            </td>
        </tr>
    `).join('');
}

function deleteAppointment(id) {
    if (confirm('Are you sure you want to delete this appointment?')) {
        appointments = appointments.filter(apt => apt.id !== id);
        localStorage.setItem('appointments', JSON.stringify(appointments));
        displayAppointments();
    }
}

function editAppointment(id) {
    const apt = appointments.find(a => a.id === id);
    if (apt) {
        document.getElementById('patientName').value = apt.patientName;
        document.getElementById('doctorName').value = apt.doctorName;
        document.getElementById('hospitalName').value = apt.hospitalName;
        document.getElementById('specialty').value = apt.specialty;
        document.getElementById('appointmentDate').value = apt.date;
        document.getElementById('appointmentTime').value = apt.time;
        document.getElementById('reason').value = apt.reason;
        
        appointments = appointments.filter(a => a.id !== id);
        localStorage.setItem('appointments', JSON.stringify(appointments));
        
        modal.classList.add('active');
        displayAppointments();
    }
}

// Sidebar navigation
const toggleBtn = document.querySelector('.toggle-btn');
const calendarBtn = document.querySelector('.calendar-btn');
const dashboardBtn = document.querySelector('.dashboard-btn');
const sidebar = document.querySelector('.sidebar');

// Toggle sidebar
toggleBtn.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
});

// Calendar view
calendarBtn.addEventListener('click', () => {
    window.location.href = 'index.html';
});

// Dashboard view (current page)
dashboardBtn.addEventListener('click', () => {
    window.location.href = 'dashboard.html';
});

// Initial display
displayAppointments();
