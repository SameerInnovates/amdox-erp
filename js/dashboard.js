// ═══════════════════════════════════════════════════
// AMDOX ERP – Dashboard JavaScript
// ═══════════════════════════════════════════════════


// ── 1. SHOW TODAY'S DATE ─────────────────────────────
// This runs as soon as the page loads
function showTodayDate() {
  // new Date() gets the current date and time
  const today = new Date();

  // toLocaleDateString formats it nicely
  // 'en-IN' = Indian English format
  const formatted = today.toLocaleDateString('en-IN', {
    weekday: 'long',   // e.g. "Saturday"
    year:    'numeric',
    month:   'long',   // e.g. "June"
    day:     'numeric'
  });

  // Find the element with id="todayDate" and set its text
  document.getElementById('todayDate').textContent = formatted;
}

// Call the function immediately
showTodayDate();


// ── 2. SIDEBAR TOGGLE (for mobile) ───────────────────
function toggleSidebar() {
  // Get the sidebar and overlay elements
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');

  // toggle() adds the class if missing, removes it if present
  sidebar.classList.toggle('open');
  overlay.classList.toggle('show');
}


// ── 3. BAR CHART ─────────────────────────────────────
// Find the canvas element with id="barChart"
const barCtx = document.getElementById('barChart').getContext('2d');

// Create a new Chart.js bar chart
new Chart(barCtx, {
  type: 'bar',   // bar chart type

  data: {
    // X-axis labels (months)
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
             'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],

    datasets: [
      {
        // First bar group: Revenue
        label: 'Revenue (₹)',
        data: [420000, 380000, 510000, 470000, 620000, 842000,
               590000, 710000, 680000, 750000, 820000, 910000],
        backgroundColor: '#2563eb',  // blue bars
        borderRadius: 6,             // rounded corners on bars
        borderSkipped: false,
      },
      {
        // Second bar group: Expenses
        label: 'Expenses (₹)',
        data: [210000, 195000, 240000, 220000, 280000, 315000,
               270000, 310000, 295000, 320000, 340000, 380000],
        backgroundColor: '#e2e8f0',  // light grey bars
        borderRadius: 6,
        borderSkipped: false,
      }
    ]
  },

  options: {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',             // legend above chart
        labels: {
          font: { family: 'Inter', size: 12 },
          boxWidth: 12,
          boxHeight: 12,
          borderRadius: 4,
        }
      }
    },
    scales: {
      y: {
        // Format Y-axis numbers as ₹4.2L etc
        ticks: {
          callback: function(value) {
            if (value >= 100000) return '₹' + (value/100000).toFixed(1) + 'L';
            if (value >= 1000)   return '₹' + (value/1000).toFixed(0) + 'K';
            return '₹' + value;
          },
          font: { family: 'Inter', size: 11 }
        },
        grid: { color: '#f1f5f9' }   // very light grid lines
      },
      x: {
        grid: { display: false },    // hide vertical grid lines
        ticks: { font: { family: 'Inter', size: 11 } }
      }
    }
  }
});


// ── 4. DOUGHNUT CHART ────────────────────────────────
const doughnutCtx = document.getElementById('doughnutChart').getContext('2d');

new Chart(doughnutCtx, {
  type: 'doughnut',

  data: {
    labels: ['Engineering', 'Sales', 'HR', 'Finance', 'Operations'],

    datasets: [{
      data: [35, 25, 15, 12, 13],   // percentages
      backgroundColor: [
        '#2563eb',   // blue
        '#7c3aed',   // purple
        '#16a34a',   // green
        '#ea580c',   // orange
        '#64748b',   // grey
      ],
      borderWidth: 0,               // no border between slices
      hoverOffset: 6                // slice pops out on hover
    }]
  },

  options: {
    responsive: true,
    cutout: '70%',                  // makes the hole in the middle
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: { family: 'Inter', size: 11 },
          boxWidth: 10,
          boxHeight: 10,
          padding: 12
        }
      }
    }
  }
});