// ═══════════════════════════════════════════════════
// analytics.js — Reads data from Employees, Inventory,
// and Finance LocalStorage and builds charts.
// Depends on: utils.js, Chart.js (load before this file)
// ═══════════════════════════════════════════════════

// ── READ DATA FROM ALL 3 MODULES ──────────────────────
// Same storage keys we used in their respective files.
function getEmployees()    { return JSON.parse(localStorage.getItem('amdox_employees')) || []; }
function getProducts()     { return JSON.parse(localStorage.getItem('amdox_products')) || []; }
function getTransactions() { return JSON.parse(localStorage.getItem('amdox_transactions')) || []; }


// ── HELPER: Get last 6 month labels ───────────────────
// Returns something like ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
// based on TODAY's date, going backwards.
function getLast6Months() {
  const months = ['Jan','Feb','Mar','Apr','May','Jun',
                   'Jul','Aug','Sep','Oct','Nov','Dec'];
  const result = [];
  const now = new Date();

  // Loop backwards from 5 months ago to this month
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    result.push({
      label: months[d.getMonth()],
      month: d.getMonth(),
      year:  d.getFullYear()
    });
  }
  return result;
}


// ── BUILD: Revenue vs Expense Trend (Line Chart) ──────
function buildTrendChart() {
  const transactions = getTransactions();
  const months = getLast6Months();

  // For each of the 6 months, calculate total income and expense
  const incomeData  = [];
  const expenseData = [];

  months.forEach(m => {
    // Filter transactions that match this month and year
    const monthTxns = transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === m.month && d.getFullYear() === m.year;
    });

    const income = monthTxns
      .filter(t => t.type === 'Income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = monthTxns
      .filter(t => t.type === 'Expense')
      .reduce((sum, t) => sum + t.amount, 0);

    incomeData.push(income);
    expenseData.push(expense);
  });

  // Used later for the "Best Month" and "Avg Revenue" stat cards
  updateQuickStats(months, incomeData, expenseData);

  const ctx = document.getElementById('trendChart').getContext('2d');

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: months.map(m => m.label),
      datasets: [
        {
          label: 'Revenue (₹)',
          data: incomeData,
          borderColor: '#2563eb',
          backgroundColor: 'rgba(37,99,235,0.08)',
          fill: true,
          tension: 0.4,      // makes the line curved, not sharp angles
          pointBackgroundColor: '#2563eb',
          pointRadius: 4
        },
        {
          label: 'Expense (₹)',
          data: expenseData,
          borderColor: '#dc2626',
          backgroundColor: 'rgba(220,38,38,0.05)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#dc2626',
          pointRadius: 4
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'top', labels: { font: { family: 'Inter', size: 12 } } }
      },
      scales: {
        y: {
          ticks: {
            callback: function(value) {
              if (value >= 100000) return '₹' + (value/100000).toFixed(1) + 'L';
              if (value >= 1000)   return '₹' + (value/1000).toFixed(0) + 'K';
              return '₹' + value;
            },
            font: { family: 'Inter', size: 11 }
          },
          grid: { color: '#f1f5f9' }
        },
        x: { grid: { display: false }, ticks: { font: { family: 'Inter', size: 11 } } }
      }
    }
  });
}


// ── UPDATE QUICK STATS (Best/Worst Month, Avg Revenue) ─
function updateQuickStats(months, incomeData, expenseData) {

  // Find index of highest income value
  const maxIncome = Math.max(...incomeData);
  const bestIndex = incomeData.indexOf(maxIncome);

  // Find index of highest expense value
  const maxExpense = Math.max(...expenseData);
  const worstIndex = expenseData.indexOf(maxExpense);

  document.getElementById('bestMonth').textContent = months[bestIndex].label;
  document.getElementById('bestMonthValue').textContent =
    formatCurrency(maxIncome) + ' revenue';

  document.getElementById('worstMonth').textContent = months[worstIndex].label;
  document.getElementById('worstMonthValue').textContent =
    formatCurrency(maxExpense) + ' spent';

  // Average revenue across the 6 months
  const avg = incomeData.reduce((sum, v) => sum + v, 0) / incomeData.length;
  document.getElementById('avgRevenue').textContent = formatCurrency(Math.round(avg));
}


// ── BUILD: Inventory by Category (Pie Chart) ──────────
function buildInventoryPie() {
  const products = getProducts();

  // Group products by category and count how many in each
  // reduce() builds an object like { Electronics: 4, Furniture: 2, ... }
  const categoryCount = products.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {});

  const labels = Object.keys(categoryCount);
  const data   = Object.values(categoryCount);

  const ctx = document.getElementById('inventoryPie').getContext('2d');

  new Chart(ctx, {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: ['#2563eb','#7c3aed','#16a34a','#ea580c','#64748b','#0891b2'],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom', labels: { font: { family: 'Inter', size: 11 }, boxWidth: 10 } }
      }
    }
  });
}


// ── BUILD: Employees by Department (Doughnut Chart) ───
function buildEmployeeChart() {
  const employees = getEmployees();

  const deptCount = employees.reduce((acc, e) => {
    acc[e.dept] = (acc[e.dept] || 0) + 1;
    return acc;
  }, {});

  const labels = Object.keys(deptCount);
  const data   = Object.values(deptCount);

  const ctx = document.getElementById('empChart').getContext('2d');

  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: ['#2563eb','#7c3aed','#16a34a','#ea580c','#64748b','#0891b2'],
        borderWidth: 0,
        hoverOffset: 6
      }]
    },
    options: {
      responsive: true,
      cutout: '65%',
      plugins: {
        legend: { position: 'bottom', labels: { font: { family: 'Inter', size: 10 }, boxWidth: 10 } }
      }
    }
  });

  // Also calculate "Team Growth" stat — employees joined in last 6 months
  const months = getLast6Months();
  const earliestMonth = new Date(months[0].year, months[0].month, 1);

  const recentHires = employees.filter(e => {
    if (!e.joinDate) return false;
    return new Date(e.joinDate) >= earliestMonth;
  }).length;

  document.getElementById('teamGrowth').textContent = '+' + recentHires;
}


// ── BUILD: Top 5 Expense Categories (Horizontal Bar) ──
function buildExpenseChart() {
  const transactions = getTransactions();

  // Only expense transactions
  const expenses = transactions.filter(t => t.type === 'Expense');

  // Group by category and sum the amounts
  const categoryTotals = expenses.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {});

  // Convert object into an array of [category, total] pairs,
  // sort by total descending, then take the top 5
  const sorted = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const labels = sorted.map(item => item[0]);
  const data   = sorted.map(item => item[1]);

  const ctx = document.getElementById('expenseChart').getContext('2d');

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Amount Spent (₹)',
        data: data,
        backgroundColor: '#ea580c',
        borderRadius: 6,
        borderSkipped: false
      }]
    },
    options: {
      indexAxis: 'y',   // this flips the bar chart horizontal
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        x: {
          ticks: {
            callback: function(value) {
              if (value >= 100000) return '₹' + (value/100000).toFixed(1) + 'L';
              if (value >= 1000)   return '₹' + (value/1000).toFixed(0) + 'K';
              return '₹' + value;
            },
            font: { family: 'Inter', size: 11 }
          },
          grid: { color: '#f1f5f9' }
        },
        y: { grid: { display: false }, ticks: { font: { family: 'Inter', size: 11 } } }
      }
    }
  });
}


// ── SIDEBAR TOGGLE (mobile) ───────────────────────────
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('sidebarOverlay').classList.toggle('show');
}


// ── INITIALIZE PAGE ────────────────────────────────────
// Build all 4 charts when the page loads
function init() {
  buildTrendChart();
  buildInventoryPie();
  buildEmployeeChart();
  buildExpenseChart();
}

window.onload = init;