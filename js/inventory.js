// ═══════════════════════════════════════════════════
// inventory.js — Inventory Management Logic
// Depends on: utils.js (must load first in HTML)
// ═══════════════════════════════════════════════════

const PRODUCT_KEY = 'amdox_products'; // LocalStorage key
const PROD_PER_PAGE = 8;

let prodCurrentPage  = 1;
let filteredProducts = [];


// ── SAMPLE DATA ───────────────────────────────────────
// Pre-fills inventory on first visit so the page
// doesn't look empty.
const sampleProducts = [
  { id: generateId(), name: 'Wireless Mouse', category: 'Electronics',
    sku: 'ELEC-001', qty: 45, price: 499, threshold: 10,
    supplier: 'TechSource Pvt Ltd' },
  { id: generateId(), name: 'Office Chair', category: 'Furniture',
    sku: 'FURN-002', qty: 8, price: 4999, threshold: 10,
    supplier: 'Comfort Interiors' },
  { id: generateId(), name: 'A4 Paper Ream', category: 'Stationery',
    sku: 'STAT-003', qty: 0, price: 250, threshold: 20,
    supplier: 'PaperWorld' },
  { id: generateId(), name: 'Mechanical Keyboard', category: 'Electronics',
    sku: 'ELEC-004', qty: 32, price: 2499, threshold: 10,
    supplier: 'TechSource Pvt Ltd' },
  { id: generateId(), name: 'Screwdriver Set', category: 'Hardware',
    sku: 'HARD-005', qty: 60, price: 350, threshold: 15,
    supplier: 'ToolMart' },
  { id: generateId(), name: 'Windows License', category: 'Software',
    sku: 'SOFT-006', qty: 5, price: 6999, threshold: 10,
    supplier: 'Microsoft Authorized Dealer' },
  { id: generateId(), name: 'Laptop Stand', category: 'Accessories',
    sku: 'ACC-007', qty: 25, price: 899, threshold: 10,
    supplier: 'DeskGear' },
  { id: generateId(), name: 'Monitor 24"', category: 'Electronics',
    sku: 'ELEC-008', qty: 12, price: 9999, threshold: 5,
    supplier: 'TechSource Pvt Ltd' },
  { id: generateId(), name: 'Standing Desk', category: 'Furniture',
    sku: 'FURN-009', qty: 3, price: 14999, threshold: 5,
    supplier: 'Comfort Interiors' },
  { id: generateId(), name: 'USB-C Hub', category: 'Accessories',
    sku: 'ACC-010', qty: 0, price: 1299, threshold: 10,
    supplier: 'DeskGear' }
];


// ── LOCALSTORAGE HELPERS ──────────────────────────────
function getProducts() {
  const stored = localStorage.getItem(PRODUCT_KEY);
  return stored ? JSON.parse(stored) : [];
}

function saveProducts(products) {
  localStorage.setItem(PRODUCT_KEY, JSON.stringify(products));
}


// ── STOCK STATUS CALCULATOR ───────────────────────────
// Decides the status badge based on quantity vs threshold.
// This is the core "smart" logic of the inventory module.
function getStockStatus(qty, threshold) {
  if (qty <= 0) {
    return { label: 'Out of Stock', class: 'badge-outstock' };
  }
  if (qty <= threshold) {
    return { label: 'Low Stock', class: 'badge-lowstock' };
  }
  return { label: 'In Stock', class: 'badge-instock' };
}


// ── INITIALIZE ────────────────────────────────────────

function init() {
  showSkeletonRows('productTableBody', 8, 5);

  if (getProducts().length === 0) {
    saveProducts(sampleProducts);
  }
  handleSearch();
  updateSummaryCards();
}

// ── UPDATE SUMMARY CARDS ──────────────────────────────
function updateSummaryCards() {
  const products = getProducts();

  // Total products
  document.getElementById('totalProducts').textContent = products.length;

  // Total inventory value = sum of (qty × price) for every product
  const totalValue = products.reduce(
    (sum, p) => sum + (p.qty * p.price), 0
  );
  document.getElementById('totalValue').textContent =
    formatCurrency(totalValue);

  // Low stock count — qty is above 0 but at/below threshold
  const lowStock = products.filter(
    p => p.qty > 0 && p.qty <= p.threshold
  ).length;
  document.getElementById('lowStockCount').textContent = lowStock;

  // Out of stock count — qty is 0 or less
  const outStock = products.filter(p => p.qty <= 0).length;
  document.getElementById('outStockCount').textContent = outStock;
}


// ── SEARCH & FILTER ───────────────────────────────────
function handleSearch() {
  const query    = document.getElementById('searchInput').value.toLowerCase();
  const category = document.getElementById('categoryFilter').value;
  const all      = getProducts();

  filteredProducts = all.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(query) ||
      (p.sku && p.sku.toLowerCase().includes(query));

    const matchesCategory = category === '' || p.category === category;

    return matchesSearch && matchesCategory;
  });

  prodCurrentPage = 1;
  renderTable();
}


// ── RENDER TABLE ──────────────────────────────────────
function renderTable() {
  const tbody = document.getElementById('productTableBody');

  if (filteredProducts.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8">
          <div class="empty-state">
            <i class="bi bi-box-seam"></i>
            <h6>No products found</h6>
            <p>Try a different search or add a new product.</p>
          </div>
        </td>
      </tr>
    `;
    document.getElementById('paginationInfo').textContent = '';
    document.getElementById('paginationBtns').innerHTML = '';
    document.getElementById('recordCount').textContent = '0 records';
    return;
  }

  const pageData = paginate(filteredProducts, prodCurrentPage, PROD_PER_PAGE);
  const startNum = (prodCurrentPage - 1) * PROD_PER_PAGE + 1;

  tbody.innerHTML = pageData.map((p, index) => {
    // Calculate this product's stock status fresh every render
    const status = getStockStatus(p.qty, p.threshold);
    const totalValue = p.qty * p.price;

    return `
      <tr>
        <td style="color:#94a3b8; font-size:0.8rem;">
          ${startNum + index}
        </td>
        <td>
          <div style="font-weight:600; color:#0f172a;">
            ${p.name}
          </div>
          <div style="font-size:0.75rem; color:#94a3b8;">
            ${p.sku || '—'}
          </div>
        </td>
        <td>${p.category}</td>
        <td>${p.qty}</td>
        <td>${formatCurrency(p.price)}</td>
        <td>${formatCurrency(totalValue)}</td>
        <td>
          <span class="badge-status ${status.class}">
            ${status.label}
          </span>
        </td>
        <td>
          <button class="btn-edit me-1"
            onclick="openEditModal('${p.id}')">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn-delete"
            onclick="deleteProduct('${p.id}')">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');

  document.getElementById('recordCount').textContent =
    `${filteredProducts.length} record${filteredProducts.length !== 1 ? 's' : ''}`;

  renderPagination();
}


// ── RENDER PAGINATION ─────────────────────────────────
function renderPagination() {
  const totalPages = Math.ceil(filteredProducts.length / PROD_PER_PAGE);
  const start = (prodCurrentPage - 1) * PROD_PER_PAGE + 1;
  const end   = Math.min(prodCurrentPage * PROD_PER_PAGE, filteredProducts.length);

  document.getElementById('paginationInfo').textContent =
    `Showing ${start}–${end} of ${filteredProducts.length}`;

  let btns = `
    <button class="page-btn"
      onclick="goToPage(${prodCurrentPage - 1})"
      ${prodCurrentPage === 1 ? 'disabled' : ''}>
      <i class="bi bi-chevron-left"></i>
    </button>
  `;

  for (let i = 1; i <= totalPages; i++) {
    btns += `
      <button class="page-btn ${i === prodCurrentPage ? 'active' : ''}"
        onclick="goToPage(${i})">${i}</button>
    `;
  }

  btns += `
    <button class="page-btn"
      onclick="goToPage(${prodCurrentPage + 1})"
      ${prodCurrentPage === totalPages ? 'disabled' : ''}>
      <i class="bi bi-chevron-right"></i>
    </button>
  `;

  document.getElementById('paginationBtns').innerHTML = btns;
}


function goToPage(page) {
  const totalPages = Math.ceil(filteredProducts.length / PROD_PER_PAGE);
  if (page < 1 || page > totalPages) return;
  prodCurrentPage = page;
  renderTable();
}


// ── OPEN ADD MODAL ────────────────────────────────────
function openAddModal() {
  document.getElementById('prodId').value        = '';
  document.getElementById('prodName').value      = '';
  document.getElementById('prodCategory').value  = '';
  document.getElementById('prodSku').value       = '';
  document.getElementById('prodQty').value       = '';
  document.getElementById('prodPrice').value     = '';
  document.getElementById('prodThreshold').value = '10';
  document.getElementById('prodSupplier').value  = '';
  document.getElementById('formError').classList.add('d-none');

  document.getElementById('modalTitle').textContent = 'Add Product';

  const modal = new bootstrap.Modal(document.getElementById('productModal'));
  modal.show();
}


// ── OPEN EDIT MODAL ───────────────────────────────────
function openEditModal(id) {
  const products = getProducts();
  const p = products.find(item => item.id === id);
  if (!p) return;

  document.getElementById('prodId').value        = p.id;
  document.getElementById('prodName').value      = p.name;
  document.getElementById('prodCategory').value  = p.category;
  document.getElementById('prodSku').value       = p.sku;
  document.getElementById('prodQty').value       = p.qty;
  document.getElementById('prodPrice').value     = p.price;
  document.getElementById('prodThreshold').value = p.threshold;
  document.getElementById('prodSupplier').value  = p.supplier;
  document.getElementById('formError').classList.add('d-none');

  document.getElementById('modalTitle').textContent = 'Edit Product';

  const modal = new bootstrap.Modal(document.getElementById('productModal'));
  modal.show();
}


// ── SAVE PRODUCT (Add or Edit) ────────────────────────
function saveProduct() {
  const id        = document.getElementById('prodId').value;
  const name      = document.getElementById('prodName').value.trim();
  const category  = document.getElementById('prodCategory').value;
  const sku       = document.getElementById('prodSku').value.trim();
  const qty       = document.getElementById('prodQty').value;
  const price     = document.getElementById('prodPrice').value;
  const threshold = document.getElementById('prodThreshold').value || 10;
  const supplier  = document.getElementById('prodSupplier').value.trim();

  // Validate required fields
const isValid = validateFields([
  { id: 'prodName',     label: 'Name' },
  { id: 'prodCategory', label: 'Category' },
  { id: 'prodQty',      label: 'Quantity' },
  { id: 'prodPrice',    label: 'Price' }
]);

if (!isValid) return;

  const products = getProducts();

  if (id) {
    // EDIT MODE
    const index = products.findIndex(p => p.id === id);
    if (index !== -1) {
      products[index] = {
        ...products[index],
        name, category, sku,
        qty: Number(qty),
        price: Number(price),
        threshold: Number(threshold),
        supplier
      };
    }
    showToast('Product updated successfully!', 'success');
  } else {
    // ADD MODE
    const newProduct = {
      id: generateId(),
      name, category, sku,
      qty: Number(qty),
      price: Number(price),
      threshold: Number(threshold),
      supplier
    };
    products.push(newProduct);
    showToast('Product added successfully!', 'success');
  }

  saveProducts(products);

  bootstrap.Modal.getInstance(
    document.getElementById('productModal')
  ).hide();

  handleSearch();
  updateSummaryCards();
}


// ── DELETE PRODUCT ────────────────────────────────────
function deleteProduct(id) {
  showConfirm(
    'This product will be permanently removed from inventory.',
    function() {
      let products = getProducts();
      products = products.filter(p => p.id !== id);
      saveProducts(products);

      showToast('Product deleted.', 'error');
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