# ═══════════════════════════════════════════════════
# app.py — AI Forecasting API
# Production-ready version for Render deployment
# ═══════════════════════════════════════════════════

from flask import Flask, request, jsonify
from flask_cors import CORS
from sklearn.linear_model import LinearRegression
import numpy as np
import os

app = Flask(__name__)

# Allow requests from ANY origin in production
# This is necessary because your GitHub Pages URL
# is different from your Render API URL
CORS(app, origins="*")


# ── HEALTH CHECK ──────────────────────────────────────
@app.route('/')
def home():
    return jsonify({
        "status": "running",
        "message": "Amdox ERP AI Forecasting API is live!",
        "version": "1.0"
    })


# ── PREDICTION ROUTE ──────────────────────────────────
@app.route('/predict', methods=['POST'])
def predict():

    data = request.get_json()

    if not data or 'sales' not in data:
        return jsonify({"error": "Missing sales data in request body."}), 400

    sales = data.get('sales', [])

    if len(sales) < 2:
        return jsonify({
            "error": "Please provide at least 2 months of sales data."
        }), 400

    # Prepare data for the model
    months = np.array(range(len(sales))).reshape(-1, 1)
    sales_values = np.array(sales, dtype=float)

    # Train the model
    model = LinearRegression()
    model.fit(months, sales_values)

    # Predict next month
    next_month_index = np.array([[len(sales)]])
    prediction = model.predict(next_month_index)
    predicted_value = int(round(prediction[0]))

    # Make sure prediction is never negative
    predicted_value = max(0, predicted_value)

    # Determine trend direction from slope
    slope = model.coef_[0]
    if slope > 1000:
        trend = "upward"
    elif slope < -1000:
        trend = "downward"
    else:
        trend = "stable"

    return jsonify({
        "predicted_next_month": predicted_value,
        "trend": trend,
        "slope": round(float(slope), 2),
        "months_analyzed": len(sales)
    })


# ── RUN ───────────────────────────────────────────────
# os.environ.get('PORT', 5000) reads the PORT that
# Render assigns automatically. Locally it falls back to 5000.
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)