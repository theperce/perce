// Система учета персонала - JavaScript

// Хранилище данных (используем localStorage для сохранения данных)
const DataStore = {
    employees: [],
    schedule: [],
    
    // Загрузка данных из localStorage
    load() {
        const empData = localStorage.getItem('employees');
        const schedData = localStorage.getItem('schedule');
        
        if (empData) {
            this.employees = JSON.parse(empData);
        }
        if (schedData) {
            this.schedule = JSON.parse(schedData);
        }
    },
    
    // Сохранение данных в localStorage
    save() {
        localStorage.setItem('employees', JSON.stringify(this.employees));
        localStorage.setItem('schedule', JSON.stringify(this.schedule));
    },
    
    // Добавить сотрудника
    addEmployee(employee) {
        employee.id = Date.now();
        this.employees.push(employee);
        this.save();
    },
    
    // Удалить сотрудника
    deleteEmployee(id) {
        this.employees = this.employees.filter(e => e.id !== id);
        // Также удаляем записи графика этого сотрудника
        this.schedule = this.schedule.filter(s => s.employeeId !== id);
        this.save();
    },
    
    // Получить сотрудника по ID
    getEmployee(id) {
        return this.employees.find(e => e.id == id);
    },
    
    // Добавить запись в график
    addScheduleEntry(entry) {
        entry.id = Date.now();
        this.schedule.push(entry);
        this.save();
    },
    
    // Удалить запись из графика
    deleteScheduleEntry(id) {
        this.schedule = this.schedule.filter(s => s.id !== id);
        this.save();
    },
    
    // Получить записи графика с фильтрами
    getScheduleEntries(employeeId = 'all', month = null) {
        let entries = [...this.schedule];
        
        if (employeeId !== 'all') {
            entries = entries.filter(e => e.employeeId == employeeId);
        }
        
        if (month) {
            entries = entries.filter(e => e.date.startsWith(month));
        }
        
        return entries.sort((a, b) => new Date(a.date) - new Date(b.date));
    }
};

// Типы дней и их коэффициенты оплаты
const DayTypes = {
    workday: { name: 'Рабочий день', coefficient: 1 },
    weekend: { name: 'Выходной', coefficient: 1.5 },
    holiday: { name: 'Праздничный', coefficient: 2 },
    vacation: { name: 'Отпуск', coefficient: 1 },
    sick: { name: 'Больничный', coefficient: 0.7 }
};

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    DataStore.load();
    initTabs();
    initForms();
    initFilters();
    renderAll();
});

// Переключение вкладок
function initTabs() {
    const navBtns = document.querySelectorAll('.nav-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.dataset.tab;
            
            navBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === tabId) {
                    content.classList.add('active');
                }
            });
            
            renderAll();
        });
    });
}

// Инициализация форм
function initForms() {
    // Форма добавления сотрудника
    document.getElementById('addEmployeeForm').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const employee = {
            name: document.getElementById('empName').value.trim(),
            position: document.getElementById('empPosition').value.trim(),
            hourlyRate: parseFloat(document.getElementById('empHourlyRate').value),
            dailyRate: parseFloat(document.getElementById('empDailyRate').value),
            weeklyRate: parseFloat(document.getElementById('empWeeklyRate').value),
            monthlyRate: parseFloat(document.getElementById('empMonthlyRate').value)
        };
        
        DataStore.addEmployee(employee);
        e.target.reset();
        renderAll();
        showNotification('Сотрудник успешно добавлен!', 'success');
    });
    
    // Форма добавления записи в график
    document.getElementById('addScheduleForm').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const entry = {
            employeeId: parseInt(document.getElementById('scheduleEmployee').value),
            date: document.getElementById('scheduleDate').value,
            hours: parseFloat(document.getElementById('scheduleHours').value),
            type: document.getElementById('scheduleType').value
        };
        
        // Проверка на дубликат даты для сотрудника
        const exists = DataStore.schedule.some(
            s => s.employeeId === entry.employeeId && s.date === entry.date
        );
        
        if (exists) {
            showNotification('Запись на эту дату уже существует!', 'error');
            return;
        }
        
        DataStore.addScheduleEntry(entry);
        e.target.reset();
        renderAll();
        showNotification('Запись в график успешно добавлена!', 'success');
    });
    
    // Кнопка применения фильтра
    document.getElementById('applyFilter').addEventListener('click', () => {
        renderScheduleTable();
    });
    
    // Кнопка формирования отчета
    document.getElementById('generateReport').addEventListener('click', () => {
        generateReport();
    });
}

// Инициализация фильтров
function initFilters() {
    // Установка текущего месяца для фильтра
    const currentMonth = new Date().toISOString().slice(0, 7);
    document.getElementById('filterMonth').value = currentMonth;
    document.getElementById('reportDate').valueAsDate = new Date();
}

// Рендеринг всех таблиц
function renderAll() {
    renderEmployeesTable();
    renderScheduleTable();
    updateEmployeeSelects();
    generateReport();
}

// Рендеринг таблицы сотрудников
function renderEmployeesTable() {
    const tbody = document.querySelector('#employeesTable tbody');
    tbody.innerHTML = '';
    
    if (DataStore.employees.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center;">Нет сотрудников</td></tr>';
        return;
    }
    
    DataStore.employees.forEach(emp => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${emp.id}</td>
            <td>${escapeHtml(emp.name)}</td>
            <td>${escapeHtml(emp.position)}</td>
            <td>${formatCurrency(emp.hourlyRate)}</td>
            <td>${formatCurrency(emp.dailyRate)}</td>
            <td>${formatCurrency(emp.weeklyRate)}</td>
            <td>${formatCurrency(emp.monthlyRate)}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-danger" onclick="deleteEmployee(${emp.id})">Удалить</button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Рендеринг таблицы графика
function renderScheduleTable() {
    const tbody = document.querySelector('#scheduleTable tbody');
    tbody.innerHTML = '';
    
    const employeeId = document.getElementById('filterEmployee').value;
    const month = document.getElementById('filterMonth').value;
    
    const entries = DataStore.getScheduleEntries(employeeId, month);
    
    if (entries.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Нет записей</td></tr>';
        return;
    }
    
    entries.forEach(entry => {
        const emp = DataStore.getEmployee(entry.employeeId);
        if (!emp) return;
        
        const payment = calculatePayment(emp, entry);
        const dayTypeInfo = DayTypes[entry.type];
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${formatDate(entry.date)}</td>
            <td>${escapeHtml(emp.name)}</td>
            <td>${escapeHtml(emp.position)}</td>
            <td>${entry.hours}</td>
            <td>${dayTypeInfo.name}</td>
            <td>${formatCurrency(payment)}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-danger" onclick="deleteScheduleEntry(${entry.id})">Удалить</button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Обновление списков сотрудников в селектах
function updateEmployeeSelects() {
    const selects = [
        document.getElementById('scheduleEmployee'),
        document.getElementById('filterEmployee'),
        document.getElementById('reportEmployee')
    ];
    
    selects.forEach(select => {
        if (!select) return;
        
        const currentValue = select.value;
        const isFilter = select.id.includes('filter') || select.id.includes('report');
        
        select.innerHTML = isFilter ? '<option value="all">Все сотрудники</option>' : '<option value="">Выберите сотрудника</option>';
        
        DataStore.employees.forEach(emp => {
            const option = document.createElement('option');
            option.value = emp.id;
            option.textContent = `${emp.name} (${emp.position})`;
            select.appendChild(option);
        });
        
        // Восстанавливаем значение если возможно
        if (currentValue && currentValue !== '') {
            select.value = currentValue;
        }
    });
}

// Расчет оплаты за запись
function calculatePayment(employee, entry) {
    const dayType = DayTypes[entry.type];
    const hours = entry.hours;
    
    // Базовая оплата за час
    let basePayment = employee.hourlyRate * hours;
    
    // Если это полный рабочий день (8 часов), используем дневную ставку
    if (hours >= 8 && entry.type === 'workday') {
        basePayment = employee.dailyRate;
    }
    
    // Применяем коэффициент типа дня
    return basePayment * dayType.coefficient;
}

// Генерация отчета
function generateReport() {
    const employeeId = document.getElementById('reportEmployee').value;
    const period = document.getElementById('reportPeriod').value;
    const dateInput = document.getElementById('reportDate').value;
    
    if (!dateInput) return;
    
    const reportDate = new Date(dateInput);
    const tbody = document.querySelector('#reportTable tbody');
    tbody.innerHTML = '';
    
    // Определяем диапазон дат
    let startDate, endDate;
    
    if (period === 'day') {
        startDate = new Date(reportDate);
        endDate = new Date(reportDate);
    } else if (period === 'week') {
        // Начало недели (понедельник)
        startDate = new Date(reportDate);
        startDate.setDate(startDate.getDate() - startDate.getDay() + 1);
        if (startDate.getDay() === 0) startDate.setDate(startDate.getDate() - 6);
        endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 6);
    } else { // month
        startDate = new Date(reportDate.getFullYear(), reportDate.getMonth(), 1);
        endDate = new Date(reportDate.getFullYear(), reportDate.getMonth() + 1, 0);
    }
    
    // Фильтруем сотрудников
    let employees = DataStore.employees;
    if (employeeId !== 'all') {
        employees = employees.filter(e => e.id == employeeId);
    }
    
    let totalDays = 0;
    let totalHours = 0;
    let totalPayment = 0;
    
    employees.forEach(emp => {
        // Получаем записи для этого сотрудника в диапазоне дат
        const entries = DataStore.schedule.filter(s => {
            if (s.employeeId !== emp.id) return false;
            const entryDate = new Date(s.date);
            return entryDate >= startDate && entryDate <= endDate;
        });
        
        if (entries.length === 0) return;
        
        let days = 0;
        let hours = 0;
        let payment = 0;
        
        entries.forEach(entry => {
            days++;
            hours += entry.hours;
            payment += calculatePayment(emp, entry);
        });
        
        totalDays += days;
        totalHours += hours;
        totalPayment += payment;
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${escapeHtml(emp.name)}</td>
            <td>${escapeHtml(emp.position)}</td>
            <td>${days}</td>
            <td>${hours.toFixed(1)}</td>
            <td>${formatCurrency(payment)}</td>
        `;
        tbody.appendChild(tr);
    });
    
    // Добавляем итоговую строку
    if (tbody.children.length > 0) {
        const tfoot = document.createElement('tr');
        tfoot.style.fontWeight = 'bold';
        tfoot.style.background = '#f0f0f0';
        tfoot.innerHTML = `
            <td colspan="2">ИТОГО:</td>
            <td>${totalDays}</td>
            <td>${totalHours.toFixed(1)}</td>
            <td>${formatCurrency(totalPayment)}</td>
        `;
        tbody.appendChild(tfoot);
    }
    
    // Обновляем статистику
    renderStats(employeeId, period, startDate, endDate);
}

// Рендеринг статистики
function renderStats(employeeId, period, startDate, endDate) {
    const container = document.getElementById('statsContainer');
    
    // Получаем данные для статистики
    let employees = DataStore.employees;
    if (employeeId !== 'all') {
        employees = employees.filter(e => e.id == employeeId);
    }
    
    const entries = DataStore.schedule.filter(s => {
        if (employeeId !== 'all' && s.employeeId != employeeId) return false;
        const entryDate = new Date(s.date);
        return entryDate >= startDate && entryDate <= endDate;
    });
    
    const uniqueEmployees = new Set(entries.map(e => e.employeeId)).size;
    const totalHours = entries.reduce((sum, e) => sum + e.hours, 0);
    const totalPayment = entries.reduce((sum, e) => {
        const emp = DataStore.getEmployee(e.employeeId);
        return emp ? sum + calculatePayment(emp, e) : sum;
    }, 0);
    const workDays = entries.filter(e => e.type === 'workday').length;
    
    container.innerHTML = `
        <div class="stat-card">
            <h3>Сотрудников работало</h3>
            <div class="value">${uniqueEmployees}</div>
        </div>
        <div class="stat-card secondary">
            <h3>Отработано часов</h3>
            <div class="value">${totalHours.toFixed(1)}</div>
        </div>
        <div class="stat-card tertiary">
            <h3>Рабочих дней</h3>
            <div class="value">${workDays}</div>
        </div>
        <div class="stat-card quaternary">
            <h3>Начислено всего</h3>
            <div class="value">${formatCurrency(totalPayment)}</div>
        </div>
    `;
}

// Удаление сотрудника
window.deleteEmployee = function(id) {
    if (confirm('Вы уверены, что хотите удалить этого сотрудника? Все связанные записи будут удалены.')) {
        DataStore.deleteEmployee(id);
        renderAll();
        showNotification('Сотрудник удален', 'success');
    }
};

// Удаление записи графика
window.deleteScheduleEntry = function(id) {
    if (confirm('Вы уверены, что хотите удалить эту запись?')) {
        DataStore.deleteScheduleEntry(id);
        renderScheduleTable();
        generateReport();
        showNotification('Запись удалена', 'success');
    }
};

// Вспомогательные функции
function formatCurrency(amount) {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    }).format(amount);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showNotification(message, type = 'info') {
    // Создаем уведомление
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        background: ${type === 'success' ? '#43e97b' : type === 'error' ? '#f5576c' : '#667eea'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Удаляем через 3 секунды
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Добавляем стили для анимации уведомлений
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
