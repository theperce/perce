// Base URL for API calls
const BASE_URL = '';

// Show/hide sections
function showSection(sectionName) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(`${sectionName}-section`).classList.add('active');
    
    // Load data when switching sections
    if (sectionName === 'employees') loadEmployees();
    if (sectionName === 'positions') loadPositions();
    if (sectionName === 'schedules') loadSchedules();
    if (sectionName === 'rates') loadEmployeesForSelect();
}

// Load positions for dropdowns
async function loadPositions() {
    try {
        const response = await fetch(`${BASE_URL}/api/positions`);
        const result = await response.json();
        
        if (result.success) {
            const tbody = document.querySelector('#positionsTable tbody');
            const select = document.getElementById('employeePosition');
            
            tbody.innerHTML = '';
            select.innerHTML = '<option value="">Выберите должность</option>';
            
            result.data.forEach(position => {
                // Add to table
                const row = tbody.insertRow();
                row.innerHTML = `
                    <td>${position.id}</td>
                    <td>${escapeHtml(position.name)}</td>
                    <td>${escapeHtml(position.description || '-')}</td>
                `;
                
                // Add to select
                const option = document.createElement('option');
                option.value = position.id;
                option.textContent = position.name;
                select.appendChild(option);
            });
            
            loadEmployeesForSelect();
            loadRatesEmployeeSelect();
        }
    } catch (error) {
        console.error('Error loading positions:', error);
        alert('Ошибка загрузки должностей');
    }
}

// Load employees
async function loadEmployees() {
    try {
        const response = await fetch(`${BASE_URL}/api/employees`);
        const result = await response.json();
        
        if (result.success) {
            const tbody = document.querySelector('#employeesTable tbody');
            tbody.innerHTML = '';
            
            result.data.forEach(employee => {
                const row = tbody.insertRow();
                row.innerHTML = `
                    <td>${employee.id}</td>
                    <td>${escapeHtml(employee.name)}</td>
                    <td>${escapeHtml(employee.position_name || '-')}</td>
                    <td>${employee.hourly_rate ? employee.hourly_rate.toFixed(2) : '0.00'} ₽</td>
                    <td>${employee.daily_rate ? employee.daily_rate.toFixed(2) : '0.00'} ₽</td>
                    <td>${employee.weekly_rate ? employee.weekly_rate.toFixed(2) : '0.00'} ₽</td>
                    <td>${employee.monthly_rate ? employee.monthly_rate.toFixed(2) : '0.00'} ₽</td>
                `;
            });
            
            loadEmployeesForSelect();
            loadRatesEmployeeSelect();
        }
    } catch (error) {
        console.error('Error loading employees:', error);
        alert('Ошибка загрузки сотрудников');
    }
}

// Load employees for schedule dropdown
async function loadEmployeesForSelect() {
    try {
        const response = await fetch(`${BASE_URL}/api/employees`);
        const result = await response.json();
        
        if (result.success) {
            const select = document.getElementById('scheduleEmployee');
            select.innerHTML = '<option value="">Выберите сотрудника</option>';
            
            result.data.forEach(employee => {
                const option = document.createElement('option');
                option.value = employee.id;
                option.textContent = employee.name;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading employees for select:', error);
    }
}

// Load employees for rates dropdown
async function loadRatesEmployeeSelect() {
    try {
        const response = await fetch(`${BASE_URL}/api/employees`);
        const result = await response.json();
        
        if (result.success) {
            const select = document.getElementById('ratesEmployee');
            select.innerHTML = '<option value="">Выберите сотрудника</option>';
            
            result.data.forEach(employee => {
                const option = document.createElement('option');
                option.value = employee.id;
                option.textContent = employee.name;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading employees for rates:', error);
    }
}

// Load schedules
async function loadSchedules() {
    try {
        const response = await fetch(`${BASE_URL}/api/schedules`);
        const result = await response.json();
        
        if (result.success) {
            const tbody = document.querySelector('#schedulesTable tbody');
            tbody.innerHTML = '';
            
            const shiftNames = {
                'morning': 'Утренняя',
                'day': 'Дневная',
                'evening': 'Вечерняя',
                'night': 'Ночная',
                'day_off': 'Выходной'
            };
            
            result.data.forEach(schedule => {
                const row = tbody.insertRow();
                row.innerHTML = `
                    <td>${schedule.id}</td>
                    <td>${escapeHtml(schedule.employee_name || '-')}</td>
                    <td>${formatDate(schedule.date)}</td>
                    <td>${shiftNames[schedule.shift_type] || schedule.shift_type}</td>
                    <td>${schedule.hours_worked}</td>
                    <td>${escapeHtml(schedule.notes || '-')}</td>
                `;
            });
        }
    } catch (error) {
        console.error('Error loading schedules:', error);
        alert('Ошибка загрузки графика');
    }
}

// Add employee
document.getElementById('addEmployeeForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const data = {
        name: document.getElementById('employeeName').value,
        position_id: parseInt(document.getElementById('employeePosition').value),
        hourly_rate: parseFloat(document.getElementById('hourlyRate').value) || 0,
        daily_rate: parseFloat(document.getElementById('dailyRate').value) || 0,
        weekly_rate: parseFloat(document.getElementById('weeklyRate').value) || 0,
        monthly_rate: parseFloat(document.getElementById('monthlyRate').value) || 0
    };
    
    try {
        const response = await fetch(`${BASE_URL}/api/employees`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('Сотрудник успешно добавлен!');
            document.getElementById('addEmployeeForm').reset();
            loadEmployees();
        } else {
            alert('Ошибка: ' + result.error);
        }
    } catch (error) {
        console.error('Error adding employee:', error);
        alert('Ошибка при добавлении сотрудника');
    }
});

// Add position
document.getElementById('addPositionForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const data = {
        name: document.getElementById('positionName').value,
        description: document.getElementById('positionDescription').value
    };
    
    try {
        const response = await fetch(`${BASE_URL}/api/positions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('Должность успешно добавлена!');
            document.getElementById('addPositionForm').reset();
            loadPositions();
        } else {
            alert('Ошибка: ' + result.error);
        }
    } catch (error) {
        console.error('Error adding position:', error);
        alert('Ошибка при добавлении должности');
    }
});

// Add schedule
document.getElementById('addScheduleForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const data = {
        employee_id: parseInt(document.getElementById('scheduleEmployee').value),
        date: document.getElementById('scheduleDate').value,
        shift_type: document.getElementById('shiftType').value,
        hours_worked: parseFloat(document.getElementById('hoursWorked').value) || 8,
        notes: document.getElementById('scheduleNotes').value
    };
    
    try {
        const response = await fetch(`${BASE_URL}/api/schedules`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('Запись в график успешно добавлена!');
            document.getElementById('addScheduleForm').reset();
            loadSchedules();
        } else {
            alert('Ошибка: ' + result.error);
        }
    } catch (error) {
        console.error('Error adding schedule:', error);
        alert('Ошибка при добавлении записи в график');
    }
});

// Update rates
document.getElementById('updateRatesForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const data = {
        employee_id: parseInt(document.getElementById('ratesEmployee').value)
    };
    
    const hourlyRate = document.getElementById('newHourlyRate').value;
    const dailyRate = document.getElementById('newDailyRate').value;
    const weeklyRate = document.getElementById('newWeeklyRate').value;
    const monthlyRate = document.getElementById('newMonthlyRate').value;
    
    if (hourlyRate) data.hourly_rate = parseFloat(hourlyRate);
    if (dailyRate) data.daily_rate = parseFloat(dailyRate);
    if (weeklyRate) data.weekly_rate = parseFloat(weeklyRate);
    if (monthlyRate) data.monthly_rate = parseFloat(monthlyRate);
    
    try {
        const response = await fetch(`${BASE_URL}/api/rates`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('Ставки успешно обновлены!');
            document.getElementById('updateRatesForm').reset();
            loadEmployees();
        } else {
            alert('Ошибка: ' + result.error);
        }
    } catch (error) {
        console.error('Error updating rates:', error);
        alert('Ошибка при обновлении ставок');
    }
});

// Helper functions
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadPositions();
    loadEmployees();
});
