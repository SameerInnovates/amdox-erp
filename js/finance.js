// ═══════════════════════════════════════════════════
// finance.js — Finance Module Logic
// Depends on: utils.js (must load first in HTML)
// ═══════════════════════════════════════════════════

const FINANCE_KEY    = 'amdox_transactions';
const TXN_PER_PAGE    = 8;

let txnCurrentPage     = 1;
let filteredTxns       = [];

// Different category options depending on Income vs Expense.
// This is the kind of detail that makes an app feel "real."
const incomeCategories  = ['Sales Revenue', 'Client Payment', 'Investment', 'Other Income'];
const expenseCategories = ['Salaries', 'Office Supplies', 'Software License', 'Rent', 'Utilities', 'Marketing', 'Other Expense'];


// ── SAMPLE DATA ───────────────────────────────────────
const sampleTransactions = [
  { id: generateId(), description: 'Client Invoice - TechCorp', category: 'Client Payment',
    type: 'Income', date: '2026-06-25', amount: 180000 },
  { id: generateId(), description: 'Product Sale - Batch #47', category: 'Sales Revenue',
    type: 'Income', date: '2026-06-22', amount: 320000 },
  { id: generateId(), description: 'Employee Salaries - June', category: 'Salaries',
    type: 'Expense', date: '2026-06-24', amount: 240000 },
  { id: generateId(), description: 'Office Supplies Purchase', category: 'Office Supplies',
    type: 'Expense', date: '2026-06-26', amount: 12500 },
  { id: generateId(), description: 'Software License Renewal', category: 'Software License',
    type: 'Expense', date: '2026-06-23', amount: 18000 },
  { id: generateId(), description: 'Office Rent - June', category: 'Rent',
    type: 'Expense', date: '2026-06-01', amount: 65000 },
  { id: generateId(), description: 'Client Invoice - GreenLeaf Co', category: 'Client Payment',
    type: 'Income', date: '2026-06-18', amount: 95000 },
  { id: generateId(), description: 'Marketing Campaign - June', category: 'Marketing',
    type: 'Expense', date: '2026-06-15', amount: 22000 },
  { id: generateId(), description: 'Electricity Bill', category: 'Utilities',
    type: 'Expense', date: '2026-06-10', amount: 8500 },
  { id: generateId(), description: 'Product Sale - Batch #48', category: 'Sales Revenue',
    type: 'Income', date: '2026-06-12', amount: 275000 }
];


// ── LOCALSTORAGE HELPERS ──────────────────────────────
function getTransactions() {
  const stored = localStorage.getItem(FINANCE_KEY);
  return stored ? JSON.parse(stored) : [];
}

function saveTransactions(transactions) {
  localStorage.setItem(FINANCE_KEY, JSON.stringify(transactions));
}


// ── INITIALIZE ────────────────────────────────────────
function init() {
  showSkeletonRows('transactionTableBody', 7, 5);

  if (getTransactions().length === 0) {
    saveTransactions(sampleTransactions);
  }
  handleSearch();
  updateSummaryCards();
}


// ── UPDATE SUMMARY CARDS ──────────────────────────────
function updateSummaryCards() {
  const transactions = getTransactions();

  // Sum all Income transactions
  const totalIncome = transactions
    .filter(t => t.type === 'Income')
    .reduce((sum, t) => sum + t.amount, 0);

  // Sum all Expense transactions
  const totalExpense = transactions
    .filter(t => t.type === 'Expense')
    .reduce((sum, t) => sum + t.amount, 0);

  // Net balance = income minus expense
  const netBalance = totalIncome - totalExpense;

  document.getElementById('totalIncome').textContent = formatCurrency(totalIncome);
  document.getElementById('totalExpense').textContent = formatCurrency(totalExpense);

  // Show the balance card in red if negative, otherwise default color
  const balanceEl = document.getElementById('netBalance');
  balanceEl.textContent = formatCurrency(netBalance);
  balanceEl.style.color = netBalance < 0 ? '#dc2626' : '#0f172a';
}


// ── SEARCH & FILTER ───────────────────────────────────
function handleSearch() {
  const query = document.getElementById('searchInput').value.toLowerCase();
  const type  = document.getElementById('typeFilter').value;
  const month = document.getElementById('monthFilter').value;
  const all   = getTransactions();

  filteredTxns = all.filter(t => {
    const matchesSearch = t.description.toLowerCase().includes(query);
    const matchesType    = type === '' || t.type === type;

    // Month filter: compare the month number of the transaction date
    const matchesMonth = month === '' ||
      new Date(t.date).getMonth() === Number(month);

    return matchesSearch && matchesType && matchesMonth;
  });

  // Sort newest first — most recent transactions show on top
  filteredTxns.sort((a, b) => new Date(b.date) - new Date(a.date));

  txnCurrentPage = 1;
  renderTable();
}


// ── RENDER TABLE ──────────────────────────────────────
function renderTable() {
  const tbody = document.getElementById('transactionTableBody');

  if (filteredTxns.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7">
          <div class="empty-state">
            <i class="bi bi-cash-stack"></i>
            <h6>No transactions found</h6>
            <p>Try a different search or add a new transaction.</p>
          </div>
        </td>
      </tr>
    `;
    document.getElementById('paginationInfo').textContent = '';
    document.getElementById('paginationBtns').innerHTML = '';
    document.getElementById('recordCount').textContent = '0 records';
    return;
  }

  const pageData = paginate(filteredTxns, txnCurrentPage, TXN_PER_PAGE);
  const startNum = (txnCurrentPage - 1) * TXN_PER_PAGE + 1;

  tbody.innerHTML = pageData.map((t, index) => {
    // Income shows green with a + sign, expense shows red with a - sign
    const isIncome  = t.type === 'Income';
    const amountColor = isIncome ? '#16a34a' : '#dc2626';
    const amountSign  = isIncome ? '+ ' : '- ';

    return `
      <tr>
        <td style="color:#94a3b8; font-size:0.8rem;">
          ${startNum + index}
        </td>
        <td style="font-weight:600; color:#0f172a;">
          ${t.description}
        </td>
        <td>${t.category}</td>
        <td>
          <span class="badge-status ${isIncome ? 'badge-income' : 'badge-expense'}">
            ${t.type}
          </span>
        </td>
        <td>${formatDate(t.date)}</td>
        <td style="color:${amountColor}; font-weight:600;">
          ${amountSign}${formatCurrency(t.amount)}
        </td>
        <td>
          <button class="btn-delete"
            onclick="deleteTransaction('${t.id}')">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');

  document.getElementById('recordCount').textContent =
    `${filteredTxns.length} record${filteredTxns.length !== 1 ? 's' : ''}`;

  renderPagination();
}


// ── RENDER PAGINATION ─────────────────────────────────
function renderPagination() {
  const totalPages = Math.ceil(filteredTxns.length / TXN_PER_PAGE);
  const start = (txnCurrentPage - 1) * TXN_PER_PAGE + 1;
  const end   = Math.min(txnCurrentPage * TXN_PER_PAGE, filteredTxns.length);

  document.getElementById('paginationInfo').textContent =
    `Showing ${start}–${end} of ${filteredTxns.length}`;

  let btns = `
    <button class="page-btn"
      onclick="goToPage(${txnCurrentPage - 1})"
      ${txnCurrentPage === 1 ? 'disabled' : ''}>
      <i class="bi bi-chevron-left"></i>
    </button>
  `;

  for (let i = 1; i <= totalPages; i++) {
    btns += `
      <button class="page-btn ${i === txnCurrentPage ? 'active' : ''}"
        onclick="goToPage(${i})">${i}</button>
    `;
  }

  btns += `
    <button class="page-btn"
      onclick="goToPage(${txnCurrentPage + 1})"
      ${txnCurrentPage === totalPages ? 'disabled' : ''}>
      <i class="bi bi-chevron-right"></i>
    </button>
  `;

  document.getElementById('paginationBtns').innerHTML = btns;
}


function goToPage(page) {
  const totalPages = Math.ceil(filteredTxns.length / TXN_PER_PAGE);
  if (page < 1 || page > totalPages) return;
  txnCurrentPage = page;
  renderTable();
}


// ── OPEN ADD MODAL ────────────────────────────────────
// type is either 'Income' or 'Expense' — passed from the two buttons
function openAddModal(type) {
  document.getElementById('txnType').value        = type;
  document.getElementById('txnDescription').value = '';
  document.getElementById('txnAmount').value      = '';
  document.getElementById('txnDate').value        = '';
  document.getElementById('formError').classList.add('d-none');

  // Change modal title based on type
  document.getElementById('modalTitle').textContent = 'Add ' + type;

  // Fill category dropdown based on whether it's Income or Expense
  const categorySelect = document.getElementById('txnCategory');
  const categories = type === 'Income' ? incomeCategories : expenseCategories;

  categorySelect.innerHTML = '<option value="">Select Category</option>' +
    categories.map(c => `<option value="${c}">${c}</option>`).join('');

  const modal = new bootstrap.Modal(
    document.getElementById('transactionModal')
  );
  modal.show();
}


// ── SAVE TRANSACTION ──────────────────────────────────
function saveTransaction() {
  const type        = document.getElementById('txnType').value;
  const description = document.getElementById('txnDescription').value.trim();
  const category    = document.getElementById('txnCategory').value;
  const amount       = document.getElementById('txnAmount').value;
  const date         = document.getElementById('txnDate').value;

 const isValid = validateFields([
  { id: 'txnDescription', label: 'Description' },
  { id: 'txnCategory',    label: 'Category' },
  { id: 'txnAmount',      label: 'Amount' },
  { id: 'txnDate',        label: 'Date' }
]);

if (!isValid) return;

  const transactions = getTransactions();

  const newTransaction = {
    id: generateId(),
    description, category, type,
    date, amount: Number(amount)
  };

  transactions.push(newTransaction);
  saveTransactions(transactions);

  showToast(`${type} added successfully!`, 'success');

  bootstrap.Modal.getInstance(
    document.getElementById('transactionModal')
  ).hide();

  handleSearch();
  updateSummaryCards();
}


// ── DELETE TRANSACTION ────────────────────────────────
function deleteTransaction(id) {
  showConfirm(
    'This transaction will be permanently removed.',
    function() {
      let transactions = getTransactions();
      transactions = transactions.filter(t => t.id !== id);
      saveTransactions(transactions);

      showToast('Transaction deleted.', 'error');
      handleSearch();
      updateSummaryCards();
    }
  );
}


// ── SIDEBAR TOGGLE (mobile) ───────────────────────────
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('sidebarOverlay').classList.toggle('show');
}


// ── START THE PAGE ────────────────────────────────────
window.onload = init;