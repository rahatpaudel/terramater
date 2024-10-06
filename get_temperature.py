import pandas as pd
import matplotlib.pyplot as plt
import numpy as np

data=400

data_set = pd.read_csv("data_cleaned")
data_set["value"] = data_set["value"].apply(np.log)
coeff = np.polyfit(data_set["value"], data_set["temp"], 1)
poly = np.poly1d(coeff)
data_set["best_fit_point"] = poly(data_set["value"])
data_set.plot(x="value", y="best_fit_point")

def new_temperature(co2):
    if co2<=200: 
        co2=200 
    return poly(np.log(co2))


def calculate_co2_change(mass_kg):
    global data
    # calculating co2 by putting initial at 400 and assuming the volume of hypothetical world as 4.41 10to power of 13
    inital_co2_volume = (data / 10 ** 6) * 4.41 * 10 ** 13
    current_co2 = inital_co2_volume + mass_kg*1000 / 1.98
    new_co2 = (current_co2 / (4.41 * 10 ** 7))
    if new_co2<=200: 
        new_co2=200 
    data=new_co2
    return new_co2



coal = 2
solar = 0
wind = 1
nuclear = 0
hydro = 0
trees = 5
house = 5
building = 1
ev = 0
car = 4
bus = 1
beef = 2
tofu = 0
wheat = 6




def co2_from_coal(energy):
    energy_from_coal = (coal / (coal+ solar + wind + nuclear + hydro)) * energy
    return energy_from_coal * 7.29 * (10 ** -5)



co2_values_for_option = {
    "trees": 600,
    "house": 20000,
    "building": 25000,
    "beef": 2000*10,
    "tofu": 80*10,
    "wheat": 40*10,
    "car": 25000,
}

def reset(): 
    global trees, house, building, beef, tofu, wheat, car, bus, ev, coal, solar, wind, nuclear, hydro,data 
    coal = 2
    solar = 0
    wind = 1
    nuclear = 0
    hydro = 0
    trees = 5
    house = 5
    building = 1
    ev = 0
    car = 4
    bus = 1
    beef = 2
    tofu = 0
    wheat = 6
    data=400 


def call(change, sign):
    global trees, house, building, beef, tofu, wheat, car, bus, ev, coal, solar, wind, nuclear, hydro,data
    if change == "trees":
        trees += sign * trees
        new_ppm = calculate_co2_change(co2_values_for_option[change] * -trees)
        return new_temperature(new_ppm), new_ppm
    if change == "house":
        house += sign * 1
        new_ppm = calculate_co2_change((co2_values_for_option[change] + co2_from_coal(38574000 * 25)) * house)
        return new_temperature(new_ppm), new_ppm
    if change == "building":
        building += sign * 1
        new_ppm = calculate_co2_change((co2_values_for_option[change] + co2_from_coal(38574000 * 25 * 2)) * building)
        return new_temperature(new_ppm), new_ppm
    if change == "beef":
        beef += sign * 1    
        new_ppm = calculate_co2_change(co2_values_for_option[change] * beef)
        return new_temperature(new_ppm), new_ppm
    if change == "tofu":
        tofu += sign * 1
        new_ppm = calculate_co2_change(co2_values_for_option[change] * tofu)
        return new_temperature(new_ppm), new_ppm
    if change == "wheat":
        wheat += sign * 1
        new_ppm = calculate_co2_change(co2_values_for_option[change] * wheat)
        return new_temperature(new_ppm), new_ppm
    if change == "car":
        car += sign * 1
        new_ppm = calculate_co2_change(co2_values_for_option[change] * car)
        return new_temperature(new_ppm), new_ppm
    if change == "bus":
        bus += sign * 1
        new_ppm = calculate_co2_change(co2_values_for_option[change] * 2 * bus)
        return new_temperature(new_ppm), new_ppm
    if change == "ev":
        ev += sign * 1
        new_ppm = calculate_co2_change(co2_from_coal(7714800 * 25) * 2 * ev)
        return new_temperature(new_ppm), new_ppm
    if change=="coal":
        coal+=sign*1
        return new_temperature(data),data
    if change=="solar":
        solar+=sign*1
        return new_temperature(data),data
    if change=="wind":
        wind+=sign*1
        if wind==0: 
            wind=1 
        return new_temperature(data),data 
    if change=="nuclear":
        nuclear+=sign*1*3
        return new_temperature(data),data 
    if change=="hydro":
        hydro+=sign*1
        return new_temperature(data),data
    return new_temperature(data),data


from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

app = Flask(__name__)


@app.route('/')
def index():
    return send_from_directory('.', 'index.html')  # Ensure 'index.html' is in the same directory as this script

# Serve files from the src directory
@app.route('/src/<path:filename>')
def serve_static(filename):
    return send_from_directory('src', filename)

CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}})


@app.route('/process', methods=['POST',"GET"])
def process():
    data = request.get_json()
    value=data.get("value")
    change=value["change"]
    sign=value['sign']
    if sign ==True: 
        sign=+1 
    if sign == False: 
        sign=-1 
    temperature,co2_value=call(change,sign)
    print(temperature,co2_value)
    return jsonify({'temperature': temperature, 
                     'co2_value':co2_value})


@app.route('/end', methods=['POST',"GET"])
def end():
    data = request.get_json()
    value=data.get("value")
    if value=="TERMINATE": 
        reset()  

    return jsonify({'value':'DONE'})



app.run(debug=True)










