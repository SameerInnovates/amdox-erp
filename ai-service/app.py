# ═══════════════════════════════════════════════════
# app.py — AI Forecasting API
# This Flask server has ONE job:
# Receive past sales numbers, predict next month's sales.
# ═══════════════════════════════════════════════════

from flask import Flask, request, jsonify
from flask_cors import CORS
from sklearn.linear_model import LinearRegression
import numpy as np

# Create the Flask application
app = Flask(__name__)

# Enable CORS — without this, your browser will BLOCK
# requests from dashboard.html to this API for security reasons.
# CORS = Cross-Origin Resource Sharing.
CORS(app)


# ── HEALTH CHECK ROUTE ────────────────────────────────
# A simple route to test if the server is running.
# Visit http://127.0.0.1:5000/ in your browser to test this.
@app.route('/')
def home():
    return jsonify({
        "status": "running",
        "message": "Amdox ERP AI Forecasting API is live!"
    })


# ── PREDICTION ROUTE ──────────────────────────────────
# This is the main feature. It accepts a POST request
# with past sales numbers and returns a prediction.
#
# Example request body:
# { "sales": [420000, 480000, 510000, 470000, 530000, 610000] }
#
# Example response:
# { "predicted_next_month": 645000, "trend": "upward" }
@app.route('/predict', methods=['POST'])
def predict():

    # Get the JSON data sent from the browser
    data = request.get_json()

    # Extract the "sales" array from the request
    sales = data.get('sales', [])

    # Validate: we need at least 2 data points to find a trend
    if len(sales) < 2:
        return jsonify({
            "error": "Please provide at least 2 months of sales data."
        }), 400

    # ── PREPARE THE DATA FOR THE MODEL ───────────────
    # Linear Regression needs X (months: 0,1,2,3...) and Y (sales values)
    # X must be shaped as a 2D array — that's what reshape(-1, 1) does
    months = np.array(range(len(sales))).reshape(-1, 1)
    sales_values = np.array(sales)

    # ── CREATE AND TRAIN THE MODEL ───────────────────
    # LinearRegression() creates an empty model
    # .fit() trains it — it looks at the months vs sales
    # and finds the best-fit straight line through them
    model = LinearRegression()
    model.fit(months, sales_values)

    # ── PREDICT THE NEXT MONTH ───────────────────────
    # If we had 6 months (indexes 0-5), next month is index 6
    next_month_index = np.array([[len(sales)]])
    prediction = model.predict(next_month_index)

    # Round to nearest whole number (rupees don't need decimals)
    predicted_value = int(round(prediction[0]))

    # ── DETERMINE THE TREND DIRECTION ────────────────
    # model.coef_ is the "slope" of the line.
    # Positive slope = sales going up. Negative = going down.
    slope = model.coef_[0]
    trend = "upward" if slope > 0 else "downward" if slope < 0 else "stable"

    # ── SEND THE RESPONSE BACK ───────────────────────
    return jsonify({
        "predicted_next_month": predicted_value,
        "trend": trend,
        "slope": round(float(slope), 2)
    })


# ── RUN THE SERVER ────────────────────────────────────
# This starts the Flask server on http://127.0.0.1:5000
# debug=True means it auto-restarts when you save changes
if __name__ == '__main__':
    app.run(debug=True, port=5000)