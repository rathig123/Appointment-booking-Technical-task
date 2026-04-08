let currentDate = new Date();
let appointments = JSON.parse(localStorage.getItem('appointments')) || [];

// Function to format time to 12-hour format with AM/PM
function formatTime(time24) {
    const [hours, minutes] = time24.split(':');
    let hours12 = parseInt(hours);
    const ampm = hours12 >= 12 ? 'PM' : 'AM';
    hours12 = hours12 % 12 || 12;
    return `${hours12}:${minutes} ${ampm}`;
}

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
    renderCalendar(currentDate);
});

function renderCalendar(date) {
    const month = date.getMonth();
    const year = date.getFullYear();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = firstDay.getDay();
    const totalDays = lastDay.getDate();

    // Update current date label
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    document.getElementById('current-date').textContent = `${monthNames[month]} ${date.getDate()}, ${year}`;

    // Clear calendar
    const calendar = document.getElementById('calendar');
    calendar.innerHTML = '';

    // Add empty divs for days before first day
    for (let i = 0; i < startDay; i++) {
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'day empty';
        calendar.appendChild(emptyDiv);
    }

    // Add days
    for (let day = 1; day <= totalDays; day++) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'day';
        
        const dateStr = formatDate(year, month, day);
        
        // Check if this date has any appointments
        const dayAppointments = appointments.filter(apt => apt.date === dateStr);
        
        if (dayAppointments.length > 0) {
            dayDiv.classList.add('has-appointment');
            // Show appointments in the calendar cell
            let aptContent = `<div class="day-number">${day}</div>`;
            dayAppointments.forEach((apt, index) => {
                if (index < 2) { // Show max 2 appointments
                    aptContent += `<div class="appointment-box" style="background-color: #70C979; border-top: 2px solid #138808; border-right: 1px solid #138808; padding: 8px 10px; margin-top: 4px; border-radius: 0px 4px 0px 0px; display: flex; align-items: center; justify-content: space-between; gap: 8px;">
                        <div style="flex: 1; min-width: 0;">
                            <div style="font-weight: 400; font-size: 13px; color: #000000; margin: 0;">${apt.patientName}</div>
                            <div style="font-size: 12px; color: #000000; margin: 2px 0 0 0;">${formatTime(apt.time)}</div>
                        </div>
                        <div style="display: flex; gap: 4px; flex-shrink: 0;">
                            <button onclick="editAppointmentFromCalendar(${apt.id})" style="background: none; border: none; cursor: pointer; color: #000000; font-size: 18px; padding: 2px; display: flex; align-items: center; justify-content: center; width: 24px; height: 24px;" title="Edit"><i class="material-symbols-outlined">edit</i></button>
                            <button onclick="deleteAppointmentFromCalendar(${apt.id})" style="background: none; border: none; cursor: pointer; color: #000000; font-size: 18px; padding: 2px; display: flex; align-items: center; justify-content: center; width: 24px; height: 24px;" title="Delete"><i class="material-symbols-outlined">delete</i></button>
                        </div>
                    </div>`;
                }
            });
            dayDiv.innerHTML = aptContent;
        } else {
            dayDiv.textContent = day;
        }
        
        dayDiv.addEventListener('click', (e) => {
            // Only show details if clicking on the day number, not on edit/delete buttons
            if (!e.target.closest('button')) {
                showDayAppointments(dateStr);
            }
        });
        calendar.appendChild(dayDiv);
    }
}

function formatDate(year, month, day) {
    const m = String(month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${year}-${m}-${d}`;
}

function showDayAppointments(dateStr) {
    const dayAppointments = appointments.filter(apt => apt.date === dateStr);
    
    if (dayAppointments.length === 0) {
        alert('No appointments on this date.');
        return;
    }

    let appointmentList = `Appointments on ${dateStr}:\n\n`;
    dayAppointments.forEach(apt => {
        appointmentList += `Patient: ${apt.patientName}\nDoctor: ${apt.doctorName}\nTime: ${formatTime(apt.time)}\n\n`;
    });
    alert(appointmentList);
}

function editAppointmentFromCalendar(aptId) {
    const apt = appointments.find(a => a.id === aptId);
    if (apt) {
        document.getElementById('patientName').value = apt.patientName;
        document.getElementById('doctorName').value = apt.doctorName;
        document.getElementById('hospitalName').value = apt.hospitalName;
        document.getElementById('specialty').value = apt.specialty;
        document.getElementById('appointmentDate').value = apt.date;
        document.getElementById('appointmentTime').value = apt.time;
        document.getElementById('reason').value = apt.reason;
        
        appointments = appointments.filter(a => a.id !== aptId);
        localStorage.setItem('appointments', JSON.stringify(appointments));
        
        document.getElementById('appointmentModal').classList.add('active');
        renderCalendar(currentDate);
    }
}

function deleteAppointmentFromCalendar(aptId) {
    if (confirm('Are you sure you want to delete this appointment?')) {
        appointments = appointments.filter(a => a.id !== aptId);
        localStorage.setItem('appointments', JSON.stringify(appointments));
        renderCalendar(currentDate);
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

// Calendar view (current page)
calendarBtn.addEventListener('click', () => {
    window.location.href = 'main.html';
});

// Dashboard view
dashboardBtn.addEventListener('click', () => {
    window.location.href = 'dashboard.html';
});

// Event listeners for navigation buttons
const prevBtn = document.getElementById('prevMonth');
const nextBtn = document.getElementById('nextMonth');
const todayBtn = document.getElementById('todayBtn');
const viewSelector = document.getElementById('viewSelector');
const viewOptions = document.getElementById('viewOptions');
const viewLabel = document.getElementById('viewLabel');
let currentView = 'Month';

prevBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar(currentDate);
});

nextBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar(currentDate);
});

todayBtn.addEventListener('click', () => {
    currentDate = new Date();
    renderCalendar(currentDate);
});

viewSelector.addEventListener('click', () => {
    const isHidden = viewOptions.hasAttribute('hidden');
    if (isHidden) {
        viewOptions.removeAttribute('hidden');
    } else {
        viewOptions.setAttribute('hidden', '');
    }
});

viewOptions.querySelectorAll('.view-option').forEach(option => {
    option.addEventListener('click', (event) => {
        const selectedView = event.currentTarget.dataset.view;
        currentView = selectedView;
        viewLabel.textContent = selectedView;
        viewOptions.setAttribute('hidden', '');
        // For now, we only support month view in the calendar.
        if (selectedView === 'Week') {
            alert('Week view is not available right now. Month view will remain active.');
            currentView = 'Month';
            viewLabel.textContent = 'Month';
        }
    });
});

window.addEventListener('click', (event) => {
    if (!viewSelector.contains(event.target)) {
        viewOptions.setAttribute('hidden', '');
    }
});

// Initial render
renderCalendar(currentDate);