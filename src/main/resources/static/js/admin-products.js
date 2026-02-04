let adminProducts = {};
let adminModalOpen = false;

function attachAdminEventListeners() {
    const addBtn = document.getElementById('add-product-btn');
    if (addBtn) {
        addBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Add Product button clicked');
            showProductForm();
        });
    }
}

function loadAdminProducts()
{
    const mainEl = document.querySelector('main');
    if (mainEl) mainEl.classList.add('no-sidebar');

    // Render shell immediately so user sees navigation change
    templateBuilder.build('admin-products', { products: [], loading: true, noProducts: false }, 'main', attachAdminEventListeners);

    // Then fetch products and re-render with data
    console.log('Loading admin products from', `${config.baseUrl}/products`);
    axios.get(`${config.baseUrl}/products`, { timeout: 8000 })
        .then(response => {
            const list = Array.isArray(response.data) ? response.data : [];
            // normalize fields so Mustache 0.1 doesn't error on missing keys
            const normalized = list.map(p => ({
                productId: p.productId !== undefined ? p.productId : (p.id !== undefined ? p.id : 0),
                name: p.name !== undefined ? p.name : '',
                price: p.price !== undefined ? p.price : 0,
                categoryId: p.categoryId !== undefined ? p.categoryId : (p.category !== undefined ? p.category : 0),
                stock: p.stock !== undefined ? p.stock : 0,
                isFeatured: p.isFeatured !== undefined ? p.isFeatured : (p.featured !== undefined ? p.featured : false)
            }));
            const data = { products: normalized, loading: false, noProducts: normalized.length === 0 };
            if (!adminModalOpen) {
                templateBuilder.build('admin-products', data, 'main', attachAdminEventListeners);
            }
        })
        .catch((err) => {
            console.error('Admin products load failed:', err);
            const status = err && err.response ? err.response.status : 'N/A';
            const msg = err && err.message ? err.message : 'Unknown error';
            const inlineError = { error: `Failed to load products (status ${status}). ${msg}` };
            templateBuilder.append('error', inlineError, 'errors');
            // Keep shell visible; show a simple message inline
            const main = document.getElementById('main');
            if (main) {
                const msg = document.createElement('div');
                msg.style.padding = '1rem';
                msg.style.color = 'crimson';
                msg.textContent = `Admin: could not load products. Check API (port 8080). Status: ${status}.`;
                main.appendChild(msg);
            }
            if (!adminModalOpen) {
                templateBuilder.build('admin-products', { products: [], loading: false, noProducts: true }, 'main', attachAdminEventListeners);
            }
        });
}

function showProductForm(product)
{
    const modalEl = document.getElementById('admin-modal');
    if (!modalEl) {
        console.error('admin-modal div not found!');
        return;
    }
    
    adminModalOpen = true;
    const p = product || {};
    const formModel = {
        productId: p.productId || 0,
        name: p.name || '',
        price: p.price || 0,
        categoryId: p.categoryId || 0,
        subCategory: p.subCategory || '',
        stock: p.stock || 0,
        isFeatured: (p.isFeatured !== undefined ? p.isFeatured : (p.featured !== undefined ? p.featured : false)),
        imageUrl: p.imageUrl || '',
        description: p.description || '',
      isNew: !(p && p.productId && p.productId > 0)
    };

    // Directly inject modal HTML instead of using template builder
    const modalHtml = `
    <div class="modal" onclick="hideAdminModal()">
      <div class="modal-dialog" role="document" onclick="event.stopPropagation()">
        <div class="modal-content">
          <div class="modal-header">
            <h3>${formModel.isNew ? 'Add New Product' : 'Edit Product'}</h3>
            <button type="button" class="btn-close" onclick="hideAdminModal()">&times;</button>
          </div>
          <div class="modal-body">
            <div id="admin-form-errors"></div>
            <form id="productForm" onsubmit="submitProductForm(event)">
              <input type="hidden" id="productId" value="${formModel.productId}" />
              
              <div class="form-group">
                <label for="name">Product Name *</label>
                <input type="text" id="name" class="form-control" value="${formModel.name}" required placeholder="Enter product name" />
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label for="price">Price *</label>
                  <input type="number" id="price" class="form-control" step="0.01" min="0" value="${formModel.price}" required placeholder="0.00" />
                </div>
                <div class="form-group">
                  <label for="stock">Stock</label>
                  <input type="number" id="stock" class="form-control" min="0" value="${formModel.stock}" placeholder="0" />
                </div>
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label for="categoryId">Category *</label>
                  <select id="categoryId" class="form-control" required>
                    <option value="">Loading categories...</option>
                  </select>
                </div>
                <div class="form-group">
                  <label for="subCategory">Subcategory</label>
                  <input type="text" id="subCategory" class="form-control" value="${formModel.subCategory}" placeholder="e.g., Red, Blue, Large" />
                </div>
              </div>
              
              <div class="form-group">
                <label for="imageUrl">Image URL</label>
                <input type="text" id="imageUrl" class="form-control" value="${formModel.imageUrl}" placeholder="product-image.jpg" />
              </div>
              
              <div class="form-group">
                <label for="description">Description</label>
                <textarea id="description" class="form-control" rows="3" placeholder="Enter product description">${formModel.description}</textarea>
              </div>
              
              <div class="form-group form-check">
                <input type="checkbox" id="isFeatured" class="form-check-input" ${formModel.isFeatured ? 'checked' : ''} />
                <label for="isFeatured" class="form-check-label">Featured Product</label>
              </div>
              
              <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="hideAdminModal()">Cancel</button>
                <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> ${formModel.isNew ? 'Add Product' : 'Save Changes'}</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>`;
    
    modalEl.innerHTML = modalHtml;
    
    // Load categories into dropdown
    axios.get(config.baseUrl + '/categories', { timeout: 8000 })
        .then(resp => {
            const select = document.getElementById('categoryId');
            if (select && Array.isArray(resp.data)) {
          select.innerHTML = resp.data.map(c => {
            const id = (c.categoryId !== undefined ? c.categoryId : c.id);
            const selected = id === formModel.categoryId ? ' selected' : '';
            return '<option value="' + id + '"' + selected + '>' + c.name + '</option>';
          }).join('');
          // If no match, ensure a valid default
          if (!select.value || select.value === '') {
            const first = select.querySelector('option');
            if (first) first.selected = true;
          }
            }
        })
        .catch(err => console.error('Failed to load categories:', err));
}

function hideAdminModal()
{
    const modalEl = document.getElementById('admin-modal');
    if (modalEl) modalEl.innerHTML = '';
    adminModalOpen = false;
}

function editProduct(id)
{
    console.log('Admin: editProduct clicked for id', id);
    const url = `${config.baseUrl}/products/${id}`;
    axios.get(url, { timeout: 8000 })
        .then(response => {
            console.log('Admin: loaded product', response.data);
            showProductForm(response.data);
        })
        .catch((err) => {
            const status = err && err.response ? err.response.status : 'N/A';
            console.error('Admin: load product failed', status, err);
            templateBuilder.append('error', { error: `Failed to load product (status ${status}).` }, 'errors');
        });
}

function deleteProduct(id)
{
    console.log('Admin: deleteProduct clicked for id', id);
    if (!confirm('Delete this product?')) return;
    const url = `${config.baseUrl}/products/${id}`;
    axios.delete(url, { headers: userService.getHeaders(), timeout: 8000 })
        .then(() => {
            console.log('Admin: product deleted', id);
            loadAdminProducts();
        })
        .catch((err) => {
            const status = err && err.response ? err.response.status : 'N/A';
            const msg = err && err.message ? err.message : 'Unknown error';
            console.error('Admin: delete failed', status, msg);
            templateBuilder.append('error', { error: `Failed to delete product (status ${status}). ${msg}` }, 'errors');
        });
}

function submitProductForm(event)
{
    event.preventDefault();
    const productId = parseInt(document.getElementById('productId').value || '0', 10);
    const categoryVal = parseInt(document.getElementById('categoryId').value, 10);
    const product = {
        name: document.getElementById('name').value,
        price: parseFloat(document.getElementById('price').value),
        categoryId: isNaN(categoryVal) ? 1 : categoryVal,
        subCategory: document.getElementById('subCategory').value || '',
        stock: parseInt(document.getElementById('stock').value || '0', 10),
        isFeatured: document.getElementById('isFeatured').checked,
        imageUrl: document.getElementById('imageUrl').value || '',
        description: document.getElementById('description').value || ''
    };

    const isUpdate = productId && productId > 0;
    const url = `${config.baseUrl}/products${isUpdate ? '/' + productId : ''}`;
    const method = isUpdate ? 'put' : 'post';

    axios({
        url,
        method,
        headers: userService.getHeaders(),
        data: product
    })
    .then(() => {
        hideAdminModal();
        loadAdminProducts();
    })
    .catch(() => {
        templateBuilder.append('error', { error: 'Failed to save product.' }, 'admin-form-errors');
    });
}

// ensure functions are available globally for template onclicks
window.loadAdminProducts = loadAdminProducts;
window.showProductForm = showProductForm;
window.hideAdminModal = hideAdminModal;
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.submitProductForm = submitProductForm;
