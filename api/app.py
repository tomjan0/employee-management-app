"""
Simple api to generate schedule using or-tools
"""
import os
import requests
import json

from flask import Flask, render_template, request
from flask_cors import CORS
from ortools.sat.python import cp_model

# pylint: disable=C0103
app = Flask(__name__)
CORS(app)


def get_metadata(item_name):
    metadata_url = 'http://metadata.google.internal/computeMetadata/v1/'
    headers = {'Metadata-Flavor': 'Google'}

    try:
        r = requests.get(metadata_url + item_name, headers=headers)
        return r.text
    except:
        return 'Unavailable'

@app.route('/api/schedule')
def generate_schedule():
    """ Generate Schedule from given data """
    data = request.args.get('data')
    parsed = json.loads(data)

    # Data taken from request
    shifts_per_day = parsed['shiftsPerDay']
    availabilities = parsed['availabilities']
    preferences = parsed['preferences']
    min_employees = parsed['minEmployees']
    max_employees = parsed['maxEmployees']
    force_minimum = parsed['forceMinimum']

    # Setting basic parameters
    num_of_employees = len(availabilities)
    num_of_days = len(shifts_per_day)
    num_of_shifts_per_day = shifts_per_day

    # Creating ranges for simplicity
    range_of_employees = range(num_of_employees)
    range_of_days = range(num_of_days)

    # For now just allow any number of shifts
    min_shifts_per_employee = [0 for e in range_of_employees]
    max_shifts_per_employee = [999 for e in range_of_employees]

    # Build avb and pref matrices with extra row for mock employee
    avb = availabilities
    pref = preferences

    # Calculating sums and factors required to calculate weights
    avb_sums = [sum([sum(day) for day in days]) for days in avb]
    pref_sums = [sum([sum(day) for day in days]) for days in pref]

    alphas = [(avb_sums[e] - pref_sums[e]) / (avb_sums[e] or 1)
              for e in range_of_employees]
    betas = [pref_sums[e] / (avb_sums[e] or 1) for e in range_of_employees]

    # Creating matrix with weighted preference
    weighted_pref = []
    for e in range_of_employees:
        weighted_pref.append([])
        for d in range_of_days:
            weighted_pref[e].append([])
            for s in range(num_of_shifts_per_day[d]):
                if avb[e][d][s] == 0:
                    weighted_pref[e][d].append(0)
                elif pref[e][d][s] == 1:
                    weighted_pref[e][d].append(1 + alphas[e])
                else:
                    weighted_pref[e][d].append(1 - betas[e])

    # Scale up and round weights to make them integers with 10^-3 precision here
    for e in range_of_employees:
        for d in range_of_days:
            for s in range(num_of_shifts_per_day[d]):
                weighted_pref[e][d][s] = int(
                    round(weighted_pref[e][d][s] * 1000))

    # Creating model
    model = cp_model.CpModel()

    # Creating decision variables
    # shifts[(e, d, s)]: employee 'e' works shift 's' on day 'd'
    shifts = {}
    for e in range_of_employees:
        for d in range_of_days:
            for s in range(num_of_shifts_per_day[d]):
                shifts[(e, d,
                        s)] = model.NewBoolVar('shift_n%id%is%i' % (e, d, s))

    # Constraint giving that number of employees on shifts are correct
    for d in range_of_days:
        for s in range(num_of_shifts_per_day[d]):
            if force_minimum:
                model.Add(sum(shifts[(e, d, s)]
                            for e in range_of_employees) >= min_employees[d][s])
            model.Add(sum(shifts[(e, d, s)]
                          for e in range_of_employees) <= max_employees[d][s])

    # Constraint giving that each employee is assigned to at most one shift per day
    for e in range_of_employees:
        for d in range_of_days:
            model.Add(sum(shifts[(e, d, s)]
                          for s in range(num_of_shifts_per_day[d])) <= 1)

    # Constraint giving that employee has been assigned correct number of shifts
    for e in range_of_employees:
        num_shifts_worked = 0
        for d in range_of_days:
            for s in range(num_of_shifts_per_day[d]):
                num_shifts_worked += shifts[(e, d, s)]
        model.Add(num_shifts_worked >= min_shifts_per_employee[e])
        model.Add(num_shifts_worked <= max_shifts_per_employee[e])

    # Setting objective function
    model.Maximize(
        sum(weighted_pref[e][d][s] * shifts[(e, d, s)] for e in range_of_employees
            for d in range_of_days for s in range(num_of_shifts_per_day[d])))

    # Solving model
    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = 5
    solver.Solve(model)

    # Creating result matrix which holds solved values
    res = []
    for employee in range_of_employees:
        res.append([])
        for day in range_of_days:
            res[employee].append([])
            for shift in range(num_of_shifts_per_day[day]):
                res[employee][day].append(
                    solver.Value(shifts[(employee, day, shift)]))

    # Send back results
    return {'results': res, 'objValue': solver.ObjectiveValue(), 'time': solver.WallTime()}


if __name__ == '__main__':
    server_port = os.environ.get('PORT', '8080')
    app.run(debug=False, port=server_port, host='0.0.0.0')
