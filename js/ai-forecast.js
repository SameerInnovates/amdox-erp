// ═══════════════════════════════════════════════════
// ai-forecast.js — Calls the Flask AI API and displays
// the prediction on the dashboard.
// ═══════════════════════════════════════════════════

// The address where your Flask server is running
const AI_API_URL = 'http://127.0.0.1:5000/predict';


// ── GET LAST 6 MONTHS OF REVENUE FROM FINANCE DATA ────
// Same logic pattern as analytics.js — reads real LocalStorage data
function getLast6MonthsRevenue() {
  const transactions = JSON.parse(localStorage.getItem('amdox_transactions')) || [];

  const months = [];
  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ month: d.getMonth(), year: d.getFullYear() });
  }

  // For each month, sum the income transactions
  return months.map(m => {
    const total = transactions
      .filter(t => {
        const txnDate = new Date(t.date);
        return t.type === 'Income' &&
               txnDate.getMonth() === m.month &&
               txnDate.getFullYear() === m.year;
      })
      .reduce((sum, t) => sum + t.amount, 0);
    return total;
  });
}


// ── CALL THE AI API AND DISPLAY THE RESULT ────────────
async function loadAIForecast() {

  // Find the elements on the dashboard where we'll show the result
  const card = document.getElementById('aiForecastCard');
  if (!card) return; // Skip if this page doesn't have the AI card

  // Show a loading state first
  card.innerHTML = `
    <div class="d-flex align-items-center justify-content-center" style="height:80px;">
      <div class="spinner-border text-primary" style="width:24px; height:24px;"></div>
      <span class="ms-2" style="font-size:0.85rem; color:#64748b;">Predicting next month...</span>
    </div>
  `;

  // Get our actual sales history
  const salesData = getLast6MonthsRevenue();

  try {
    // Send a POST request to our Flask API
    // fetch() is JavaScript's built-in way to make network requests
    const response = await fetch(AI_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sales: salesData })
    });

    // Convert the response into a JavaScript object
    const result = await response.json();

    if (result.error) {
      throw new Error(result.error);
    }

    // Pick an icon and color based on trend direction
    const trendIcon  = result.trend === 'upward' ? 'bi-graph-up-arrow' : 'bi-graph-down-arrow';
    const trendColor = result.trend === 'upward' ? '#16a34a' : '#dc2626';

    // Build the result card HTML
    card.innerHTML = `
      <div style="display:flex; align-items:center; gap:14px;">
        <div style="
          width:52px; height:52px; border-radius:12px;
          background:#eff6ff; color:#2563eb;
          display:flex; align-items:center; justify-content:center;
          font-size:1.4rem; flex-shrink:0;">
          <i class="bi bi-robot"></i>
        </div>
        <div>
          <div style="font-size:0.78rem; color:#64748b; font-weight:500;">
            AI Predicted Next Month Revenue
          </div>
          <div style="font-size:1.4rem; font-weight:700; color:#0f172a;">
            ${formatCurrency(result.predicted_next_month)}
          </div>
          <div style="font-size:0.78rem; color:${trendColor}; font-weight:500;">
            <i class="bi ${trendIcon}"></i>
            Trend is ${result.trend} based on last 6 months
          </div>
        </div>
      </div>
    `;

  } catch (error) {
    // If the Flask server isn't running, show a helpful message
    // instead of breaking the whole dashboard
    card.innerHTML = `
      <div style="text-align:center; color:#94a3b8; padding:1rem;">
        <i class="bi bi-exclamation-circle" style="font-size:1.5rem;"></i>
        <p style="font-size:0.8rem; margin:8px 0 0;">
          AI service is offline. Run the Flask server to see predictions.
        </p>
      </div>
    `;
    console.error('AI Forecast Error:', error);
  }
}

// Run this when the page loads
window.addEventListener('load', loadAIForecast);