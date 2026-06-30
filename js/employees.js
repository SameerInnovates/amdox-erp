// ═══════════════════════════════════════════════════
// employees.js — Employee Management Logic
// Depends on: utils.js (must load first in HTML)
// ═══════════════════════════════════════════════════

// ── CONSTANTS ────────────────────────────────────────
const STORAGE_KEY = 'amdox_employees'; // LocalStorage key
const PER_PAGE    = 8;                 // employees per page

// ── STATE ────────────────────────────────────────────
// These variables track the current state of the page.
// Think of "state" as the app's memory.
let currentPage    = 1;   // which page we're on
let filteredData   = [];  // employees after search/filter


// ── SAMPLE DATA ───────────────────────────────────────
// If LocalStorage is empty (first visit),
// we pre-fill with sample employees so the page
// doesn't look empty on first load.
const sampleEmployees = [
  {
    id: generateId(), name: 'Arjun Sharma',
    email: 'arjun@amdox.com', phone: '+91 98765 43210',
    dept: 'Engineering', role: 'Senior Developer',
    joinDate: '2024-01-15', status: 'Active', salary: 85000
  },
  {
    id: generateId(), name: 'Priya Patel',
    email: 'priya@amdox.com', phone: '+91 87654 32109',
    dept: 'HR', role: 'HR Manager',
    joinDate: '2023-06-01', status: 'Active', salary: 65000
  },
  {
    id: generateId(), name: 'Ravi Kumar',
    email: 'ravi@amdox.com', phone: '+91 76543 21098',
    dept: 'Sales', role: 'Sales Executive',
    joinDate: '2024-03-10', status: 'Active', salary: 45000
  },
  {
    id: generateId(), name: 'Sneha Reddy',
    email: 'sneha@amdox.com', phone: '+91 65432 10987',
    dept: 'Finance', role: 'Finance Analyst',
    joinDate: '2023-11-20', status: 'Active', salary: 70000
  },
  {
    id: generateId(), name: 'Mohammed Ali',
    email: 'mali@amdox.com', phone: '+91 54321 09876',
    dept: 'Engineering', role: 'DevOps Engineer',
    joinDate: '2024-02-05', status: 'Active', salary: 90000
  },
  {
    id: generateId(), name: 'Kavya Nair',
    email: 'kavya@amdox.com', phone: '+91 43210 98765',
    dept: 'Marketing', role: 'Marketing Lead',
    joinDate: '2023-08-14', status: 'Active', salary: 60000
  },
  {
    id: generateId(), name: 'Vikram Singh',
    email: 'vikram@amdox.com', phone: '+91 32109 87654',
    dept: 'Operations', role: 'Operations Manager',
    joinDate: '2022-12-01', status: 'Active', salary: 75000
  },
  {
    id: generateId(), name: 'Ananya Das',
    email: 'ananya@amdox.com', phone: '+91 21098 76543',
    dept: 'Engineering', role: 'UI/UX Designer',
    joinDate: '2024-05-20', status: 'Active', salary: 55000
  },
  {
    id: generateId(), name: 'Rajesh Verma',
    email: 'rajesh@amdox.com', phone: '+91 11987 65432',
    dept: 'Sales', role: 'Sales Manager',
    joinDate: '2023-04-01', status: 'Inactive', salary: 80000
  },
  {
    id: generateId(), name: 'Deepika Joshi',
    email: 'deepika@amdox.com', phone: '+91 99876 54321',
    dept: 'Finance', role: 'Accountant',
    joinDate: '2026-06-01', status: 'Active', salary: 50000
  }
];


// ── LOCALSTORAGE HELPERS ──────────────────────────────

// Get all employees from LocalStorage
// If nothing stored yet, return empty array
function getEmployees() {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

// Save the full employees array to LocalStorage
function saveEmployees(employees) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(employees));
}


// ── INITIALIZE ────────────────────────────────────────
// This runs when the page first loads.

function init() {
  // Show skeleton rows immediately while we check LocalStorage
  showSkeletonRows('employeeTableBody', 8, 5);

  if (getEmployees().length === 0) {
    saveEmployees(sampleEmployees);
  }
  handleSearch();
  updateSummaryCards();
}


// ── UPDATE SUMMARY CARDS ──────────────────────────────
// Updates the 4 number cards at the top of the page.
function updateSummaryCards() {
  const employees = getEmployees();

  // Total count
  document.getElementById('totalEmp').textContent = employees.length;

  // Active count — filter where status is 'Active'
  const active = employees.filter(e => e.status === 'Active').length;
  document.getElementById('activeEmp').textContent = active;

  // Unique departments count
  // new Set() removes duplicates automatically
  const depts = new Set(employees.map(e => e.dept)).size;
  document.getElementById('totalDepts').textContent = depts;

  // New this month — joined in current month and year
  const now = new Date();
  const newThisMonth = employees.filter(e => {
    if (!e.joinDate) return false;
    const d = new Date(e.joinDate);
    return d.getMonth() === now.getMonth() &&
           d.getFullYear() === now.getFullYear();
  }).length;
  document.getElementById('newEmp').textContent = newThisMonth;
}


// ── SEARCH & FILTER ───────────────────────────────────
// Runs every time the user types in search or changes filter.
function handleSearch() {
  const query  = document.getElementById('searchInput').value.toLowerCase();
  const dept   = document.getElementById('deptFilter').value;
  const all    = getEmployees();

  // Filter the array based on search query and department
  filteredData = all.filter(emp => {
    // Check if name or email contains the search query
    const matchesSearch =
      emp.name.toLowerCase().includes(query) ||
      emp.email.toLowerCase().includes(query);

    // Check if department matches (or no filter selected)
    const matchesDept = dept === '' || emp.dept === dept;

    // Both conditions must be true
    return matchesSearch && matchesDept;
  });

  // Reset to page 1 when filter changes
  currentPage = 1;

  // Re-render the table with filtered data
  renderTable();
}


// ── RENDER TABLE ──────────────────────────────────────
// Draws the employee rows in the table.
function renderTable() {
  const tbody = document.getElementById('employeeTableBody');

  // If no employees found, show empty state
  if (filteredData.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8">
          <div class="empty-state">
            <i class="bi bi-people"></i>
            <h6>No employees found</h6>
            <p>Try a different search or add a new employee.</p>
          </div>
        </td>
      </tr>
    `;
    document.getElementById('paginationInfo').textContent = '';
    document.getElementById('paginationBtns').innerHTML = '';
    document.getElementById('recordCount').textContent = '0 records';
    return;
  }

  // Get only the employees for the current page
  const pageData = paginate(filteredData, currentPage, PER_PAGE);

  // Calculate the starting row number for display
  const startNum = (currentPage - 1) * PER_PAGE + 1;

  // Build HTML for each employee row
  tbody.innerHTML = pageData.map((emp, index) => `
    <tr>
      <td style="color:#94a3b8; font-size:0.8rem;">
        ${startNum + index}
      </td>
      <td>
        <div style="display:flex; align-items:center; gap:10px;">
          <div class="avatar">${getInitials(emp.name)}</div>
          <div>
            <div style="font-weight:600; color:#0f172a;">
              ${emp.name}
            </div>
            <div style="font-size:0.75rem; color:#94a3b8;">
              ${emp.email}
            </div>
          </div>
        </div>
      </td>
      <td>${emp.dept || '—'}</td>
      <td>${emp.role || '—'}</td>
      <td>${emp.phone || '—'}</td>
      <td>${formatDate(emp.joinDate)}</td>
      <td>
        <span class="badge-status ${
          emp.status === 'Active' ? 'badge-active' : 'badge-inactive'
        }">
          ${emp.status}
        </span>
      </td>
      <td>
        <button class="btn-edit me-1"
          onclick="openEditModal('${emp.id}')">
          <i class="bi bi-pencil"></i>
        </button>
        <button class="btn-delete"
          onclick="deleteEmployee('${emp.id}')">
          <i class="bi bi-trash"></i>
        </button>
      </td>
    </tr>
  `).join('');

  // Update record count
  document.getElementById('recordCount').textContent =
    `${filteredData.length} record${filteredData.length !== 1 ? 's' : ''}`;

  // Render pagination controls
  renderPagination();
}


// ── RENDER PAGINATION ─────────────────────────────────
function renderPagination() {
  const totalPages = Math.ceil(filteredData.length / PER_PAGE);
  const start = (currentPage - 1) * PER_PAGE + 1;
  const end   = Math.min(currentPage * PER_PAGE, filteredData.length);

  // Info text: "Showing 1–8 of 10"
  document.getElementById('paginationInfo').textContent =
    `Showing ${start}–${end} of ${filteredData.length}`;

  // Build page buttons
  let btns = '';

  // Previous button
  btns += `
    <button class="page-btn"
      onclick="goToPage(${currentPage - 1})"
      ${currentPage === 1 ? 'disabled' : ''}>
      <i class="bi bi-chevron-left"></i>
    </button>
  `;

  // Page number buttons
  for (let i = 1; i <= totalPages; i++) {
    btns += `
      <button class="page-btn ${i === currentPage ? 'active' : ''}"
        onclick="goToPage(${i})">
        ${i}
      </button>
    `;
  }

  // Next button
  btns += `
    <button class="page-btn"
      onclick="goToPage(${currentPage + 1})"
      ${currentPage === totalPages ? 'disabled' : ''}>
      <i class="bi bi-chevron-right"></i>
    </button>
  `;

  document.getElementById('paginationBtns').innerHTML = btns;
}


// ── GO TO PAGE ────────────────────────────────────────
function goToPage(page) {
  const totalPages = Math.ceil(filteredData.length / PER_PAGE);
  if (page < 1 || page > totalPages) return;
  currentPage = page;
  renderTable();
}


// ── OPEN ADD MODAL ────────────────────────────────────
function openAddModal() {
  // Clear all form fields
  document.getElementById('empId').value       = '';
  document.getElementById('empName').value     = '';
  document.getElementById('empEmail').value    = '';
  document.getElementById('empPhone').value    = '';
  document.getElementById('empDept').value     = '';
  document.getElementById('empRole').value     = '';
  document.getElementById('empJoinDate').value = '';
  document.getElementById('empStatus').value   = 'Active';
  document.getElementById('empSalary').value   = '';
  document.getElementById('formError').classList.add('d-none');

  // Change modal title
  document.getElementById('modalTitle').textContent = 'Add Employee';

  // Show the modal (Bootstrap handles this)
  const modal = new bootstrap.Modal(
    document.getElementById('employeeModal')
  );
  modal.show();
}


// ── OPEN EDIT MODAL ───────────────────────────────────
// Find the employee by ID and fill the form with their data.
function openEditModal(id) {
  const employees = getEmployees();

  // Find the employee whose id matches
  const emp = employees.find(e => e.id === id);
  if (!emp) return;

  // Fill the form with their current data
  document.getElementById('empId').value       = emp.id;
  document.getElementById('empName').value     = emp.name;
  document.getElementById('empEmail').value    = emp.email;
  document.getElementById('empPhone').value    = emp.phone;
  document.getElementById('empDept').value     = emp.dept;
  document.getElementById('empRole').value     = emp.role;
  document.getElementById('empJoinDate').value = emp.joinDate;
  document.getElementById('empStatus').value   = emp.status;
  document.getElementById('empSalary').value   = emp.salary;
  document.getElementById('formError').classList.add('d-none');

  // Change modal title to Edit
  document.getElementById('modalTitle').textContent = 'Edit Employee';

  const modal = new bootstrap.Modal(
    document.getElementById('employeeModal')
  );
  modal.show();
}


// ── SAVE EMPLOYEE (Add or Edit) ───────────────────────
function saveEmployee() {
  // Read values from the form
  const id       = document.getElementById('empId').value;
  const name     = document.getElementById('empName').value.trim();
  const email    = document.getElementById('empEmail').value.trim();
  const phone    = document.getElementById('empPhone').value.trim();
  const dept     = document.getElementById('empDept').value;
  const role     = document.getElementById('empRole').value.trim();
  const joinDate = document.getElementById('empJoinDate').value;
  const status   = document.getElementById('empStatus').value;
  const salary   = document.getElementById('empSalary').value;

  // Validate required fields
// NEW CODE
const isValid = validateFields([
  { id: 'empName',  label: 'Name' },
  { id: 'empEmail', label: 'Email' },
  { id: 'empDept',  label: 'Department' },
  { id: 'empRole',  label: 'Role' }
]);

if (!isValid) return;

  const employees = getEmployees();

  if (id) {
    // ── EDIT MODE: find and update existing employee
    const index = employees.findIndex(e => e.id === id);
    if (index !== -1) {
      employees[index] = {
        ...employees[index], // keep existing fields
        name, email, phone, dept, role,
        joinDate, status, salary: Number(salary)
      };
    }
    showToast('Employee updated successfully!', 'success');
  } else {
    // ── ADD MODE: create new employee object
    const newEmployee = {
      id: generateId(), // from utils.js
      name, email, phone, dept, role,
      joinDate, status, salary: Number(salary)
    };
    employees.push(newEmployee);
    showToast('Employee added successfully!', 'success');
  }

  // Save back to LocalStorage
  saveEmployees(employees);

  // Close the modal
  bootstrap.Modal.getInstance(
    document.getElementById('employeeModal')
  ).hide();

  // Refresh table and cards
  handleSearch();
  updateSummaryCards();
}


// ── DELETE EMPLOYEE ───────────────────────────────────
function deleteEmployee(id) {
  // Show confirmation dialog before deleting
  showConfirm(
    'This employee will be permanently removed.',
    function() {
      // This runs only if user clicks "Delete"
      let employees = getEmployees();

      // Remove the employee with matching id
      employees = employees.filter(e => e.id !== id);

      // Save updated array
      saveEmployees(employees);

      showToast('Employee deleted.', 'error');
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
// Runs init() when the page fully loads
window.onload = init;