#!/usr/bin/env python3
"""
Personnel Management System - Flask Backend
A complete personnel tracking system with rates, positions, and schedules
"""

import os
import json
from datetime import datetime
from flask import Flask, request, jsonify, send_from_directory, render_template_string

app = Flask(__name__, 
            template_folder='templates',
            static_folder='public')

DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data')

# Ensure data directory exists
os.makedirs(DATA_DIR, exist_ok=True)

def read_json(filename):
    """Read data from JSON file"""
    filepath = os.path.join(DATA_DIR, filename)
    if not os.path.exists(filepath):
        return []
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return json.load(f)
    except:
        return []

def write_json(filename, data):
    """Write data to JSON file"""
    filepath = os.path.join(DATA_DIR, filename)
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def get_next_id(filename):
    """Get next available ID"""
    data = read_json(filename)
    if not data:
        return 1
    return max(item['id'] for item in data) + 1

# Routes
@app.route('/')
def index():
    """Main page"""
    return send_from_directory('templates', 'index.html')

@app.route('/api/employees', methods=['GET', 'POST'])
def employees():
    """Handle employees"""
    if request.method == 'GET':
        employees_data = read_json('employees.json')
        positions = read_json('positions.json')
        
        # Add position names
        for emp in employees_data:
            pos_id = emp.get('position_id')
            emp['position_name'] = next((p['name'] for p in positions if p['id'] == pos_id), None)
        
        return jsonify({'success': True, 'data': employees_data})
    
    elif request.method == 'POST':
        data = request.get_json()
        
        if not data.get('name') or not data.get('position_id'):
            return jsonify({'success': False, 'error': 'Name and position are required'}), 400
        
        employees_data = read_json('employees.json')
        new_employee = {
            'id': get_next_id('employees.json'),
            'name': data['name'],
            'position_id': int(data['position_id']),
            'hourly_rate': float(data.get('hourly_rate', 0)),
            'daily_rate': float(data.get('daily_rate', 0)),
            'weekly_rate': float(data.get('weekly_rate', 0)),
            'monthly_rate': float(data.get('monthly_rate', 0)),
            'created_at': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        }
        
        employees_data.append(new_employee)
        write_json('employees.json', employees_data)
        
        return jsonify({'success': True, 'data': new_employee})

@app.route('/api/positions', methods=['GET', 'POST'])
def positions():
    """Handle positions"""
    if request.method == 'GET':
        positions_data = read_json('positions.json')
        return jsonify({'success': True, 'data': positions_data})
    
    elif request.method == 'POST':
        data = request.get_json()
        
        if not data.get('name'):
            return jsonify({'success': False, 'error': 'Position name is required'}), 400
        
        positions_data = read_json('positions.json')
        new_position = {
            'id': get_next_id('positions.json'),
            'name': data['name'],
            'description': data.get('description', ''),
            'created_at': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        }
        
        positions_data.append(new_position)
        write_json('positions.json', positions_data)
        
        return jsonify({'success': True, 'data': new_position})

@app.route('/api/schedules', methods=['GET', 'POST'])
def schedules():
    """Handle schedules"""
    if request.method == 'GET':
        schedules_data = read_json('schedules.json')
        employees_data = read_json('employees.json')
        
        # Add employee names
        for schedule in schedules_data:
            emp_id = schedule.get('employee_id')
            schedule['employee_name'] = next((e['name'] for e in employees_data if e['id'] == emp_id), None)
        
        return jsonify({'success': True, 'data': schedules_data})
    
    elif request.method == 'POST':
        data = request.get_json()
        
        if not all([data.get('employee_id'), data.get('date'), data.get('shift_type')]):
            return jsonify({'success': False, 'error': 'Employee ID, date, and shift type are required'}), 400
        
        schedules_data = read_json('schedules.json')
        new_schedule = {
            'id': get_next_id('schedules.json'),
            'employee_id': int(data['employee_id']),
            'date': data['date'],
            'shift_type': data['shift_type'],
            'hours_worked': float(data.get('hours_worked', 8)),
            'notes': data.get('notes', ''),
            'created_at': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        }
        
        schedules_data.append(new_schedule)
        write_json('schedules.json', schedules_data)
        
        return jsonify({'success': True, 'data': new_schedule})

@app.route('/api/rates', methods=['GET', 'POST'])
def rates():
    """Handle rates"""
    if request.method == 'GET':
        employees_data = read_json('employees.json')
        rates_data = [{
            'employee_id': e['id'],
            'name': e['name'],
            'hourly_rate': e.get('hourly_rate', 0),
            'daily_rate': e.get('daily_rate', 0),
            'weekly_rate': e.get('weekly_rate', 0),
            'monthly_rate': e.get('monthly_rate', 0)
        } for e in employees_data]
        return jsonify({'success': True, 'data': rates_data})
    
    elif request.method == 'POST':
        data = request.get_json()
        
        if not data.get('employee_id'):
            return jsonify({'success': False, 'error': 'Employee ID is required'}), 400
        
        employees_data = read_json('employees.json')
        found = False
        
        for emp in employees_data:
            if emp['id'] == int(data['employee_id']):
                if 'hourly_rate' in data:
                    emp['hourly_rate'] = float(data['hourly_rate'])
                if 'daily_rate' in data:
                    emp['daily_rate'] = float(data['daily_rate'])
                if 'weekly_rate' in data:
                    emp['weekly_rate'] = float(data['weekly_rate'])
                if 'monthly_rate' in data:
                    emp['monthly_rate'] = float(data['monthly_rate'])
                emp['updated_at'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                found = True
                break
        
        if not found:
            return jsonify({'success': False, 'error': 'Employee not found'}), 404
        
        write_json('employees.json', employees_data)
        return jsonify({'success': True, 'message': 'Rates updated successfully'})

if __name__ == '__main__':
    print("🚀 Personnel Management System starting...")
    print("📍 Open http://localhost:5000 in your browser")
    app.run(debug=True, host='0.0.0.0', port=5000)
