// ═══════════════════════════════════════════════════
// utils.js — Shared helper functions
// Used by: employees.js, inventory.js, finance.js
// ═══════════════════════════════════════════════════


// ── 1. GENERATE UNIQUE ID ────────────────────────────
// Every record needs a unique ID so we can find,
// edit, or delete it later.
// Date.now() gives milliseconds since 1970 — always unique.
function generateId() {
  return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}


// ── 2. FORMAT DATE ───────────────────────────────────
// Converts "2026-06-27" into "27 Jun 2026"
// Much more readable in tables.
function formatDate(dateString) {
  if (!dateString) return '—';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day:   '2-digit',
    month: 'short',
    year:  'numeric'
  });
}


// ── 3. FORMAT CURRENCY ───────────────────────────────
// Converts 842000 into "₹8,42,000"
// Indian number format with Rupee symbol.
function formatCurrency(amount) {
  if (amount === null || amount === undefined) return '₹0';
  return '₹' + Number(amount).toLocaleString('en-IN');
}


// ── 4. SHOW TOAST NOTIFICATION ───────────────────────
// Shows a small popup message at the bottom right.
// type can be: 'success', 'error', or 'warning'
//
// How it works:
// 1. Creates a div with the message
// 2. Adds it to the page
// 3. After 3 seconds, removes it automatically
function showToast(message, type = 'success') {

  // Pick an icon based on type
  const icons = {
    success: 'bi-check-circle-fill',
    error:   'bi-x-circle-fill',
    warning: 'bi-exclamation-triangle-fill'
  };

  // Pick a color based on type
  const colors = {
    success: '#16a34a',
    error:   '#dc2626',
    warning: '#ea580c'
  };

  // Create the toast div
  const toast = document.createElement('div');

  // Style it directly so it doesn't depend on any CSS file
  toast.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    background: #ffffff;
    color: #0f172a;
    padding: 12px 18px;
    border-radius: 10px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 0.875rem;
    font-weight: 500;
    font-family: Inter, sans-serif;
    z-index: 9999;
    border-left: 4px solid ${colors[type]};
    animation: slideIn 0.3s ease;
    max-width: 320px;
  `;

  // Add the icon and message inside the toast
  toast.innerHTML = `
    <i class="bi ${icons[type]}" style="color: ${colors[type]}; font-size: 1rem;"></i>
    <span>${message}</span>
  `;

  // Add animation style to the page (only once)
  if (!document.getElementById('toastStyle')) {
    const style = document.createElement('style');
    style.id = 'toastStyle';
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100px); opacity: 0; }
        to   { transform: translateX(0);    opacity: 1; }
      }
    `;
    document.head.appendChild(style);
  }

  // Add toast to the page
  document.body.appendChild(toast);

  // Remove it after 3 seconds
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}


// ── 5. SHOW CONFIRMATION DIALOG ──────────────────────
// Shows a "Are you sure?" popup before deleting.
// onConfirm is a function that runs if user clicks Yes.
//
// Usage:
// showConfirm('Delete this employee?', function() {
//   deleteEmployee(id);
// });
function showConfirm(message, onConfirm) {

  // Create overlay (dark background)
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed;
    top: 0; left: 0;
    width: 100%; height: 100%;
    background: rgba(0,0,0,0.5);
    z-index: 9998;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: Inter, sans-serif;
  `;

  // Create the dialog box
  overlay.innerHTML = `
    <div style="
      background: #fff;
      border-radius: 14px;
      padding: 2rem;
      max-width: 380px;
      width: 90%;
      box-shadow: 0 8px 32px rgba(0,0,0,0.2);
      text-align: center;
    ">
      <div style="
        width: 52px; height: 52px;
        background: #fef2f2;
        border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        margin: 0 auto 1rem;
        font-size: 1.4rem; color: #dc2626;
      ">
        <i class="bi bi-exclamation-triangle-fill"></i>
      </div>
      <h6 style="font-weight:700; color:#0f172a; margin-bottom:0.5rem;">
        Are you sure?
      </h6>
      <p style="color:#64748b; font-size:0.875rem; margin-bottom:1.5rem;">
        ${message}
      </p>
      <div style="display:flex; gap:10px; justify-content:center;">
        <button id="confirmNo" style="
          padding: 8px 24px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          background: #fff;
          color: #374151;
          font-weight: 600;
          cursor: pointer;
          font-size: 0.875rem;
        ">Cancel</button>
        <button id="confirmYes" style="
          padding: 8px 24px;
          border: none;
          border-radius: 8px;
          background: #dc2626;
          color: #fff;
          font-weight: 600;
          cursor: pointer;
          font-size: 0.875rem;
        ">Delete</button>
      </div>
    </div>
  `;

  // Add to page
  document.body.appendChild(overlay);

  // Cancel button — just remove the dialog
  overlay.querySelector('#confirmNo').onclick = function() {
    overlay.remove();
  };

  // Confirm button — run the action then remove
  overlay.querySelector('#confirmYes').onclick = function() {
    overlay.remove();
    onConfirm(); // run whatever was passed in
  };
}


// ── 6. PAGINATE DATA ─────────────────────────────────
// Takes a full array and returns just one page of it.
// Example: paginate(100 employees, page 2, 8 per page)
// Returns employees 9 through 16.
function paginate(data, page, perPage) {
  const start = (page - 1) * perPage;
  const end   = start + perPage;
  return data.slice(start, end);
}


// ── 7. GET INITIALS ──────────────────────────────────
// Converts "Sameer Khan" into "SK"
// Used for avatar circles in the employee table.
function getInitials(name) {
  if (!name) return '?';
  return name
    .split(' ')                  // split into words
    .map(word => word[0])        // take first letter of each
    .join('')                    // join them
    .toUpperCase()               // make uppercase
    .substring(0, 2);            // max 2 letters
}