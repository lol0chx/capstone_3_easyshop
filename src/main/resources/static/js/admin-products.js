let adminProducts = {};
let adminModalOpen = false;

function loadAdminProducts()
{
    const mainEl = document.querySelector('main');
    if (mainEl) mainEl.classList.add('no-sidebar');

    // Render shell immediately so user sees navigation change
    templateBuilder.build('admin-products', { products: [], loading: true, noProducts: false }, 'main');

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
                templateBuilder.build('admin-products', data, 'main');
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
                templateBuilder.build('admin-products', { products: [], loading: false, noProducts: true }, 'main');
            }
        });
}

function showProductForm(product)
{
    adminModalOpen = true;
    // Flatten product fields for Mustache 0.1 (no dotted paths)
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
        isNew: !p.productId
    };

    // Render modal immediately with empty categories; will update after fetch
    templateBuilder.build('admin-product-form', { ...formModel, categories: [] }, 'admin-modal');

    const categoriesUrl = `${config.baseUrl}/categories`;
    axios.get(categoriesUrl, { timeout: 8000 })
        .then(resp => {
            const categories = Array.isArray(resp.data) ? resp.data.map(c => ({
                categoryId: c.categoryId,
                name: c.name,
                isSelected: product && product.categoryId === c.categoryId
            })) : [];
            templateBuilder.build('admin-product-form', { ...formModel, categories }, 'admin-modal');
        })
        .catch((err) => {
            const status = err && err.response ? err.response.status : 'N/A';
            templateBuilder.append('error', { error: `Failed to load categories (status ${status}).` }, 'errors');
        });
}

function hideAdminModal()
{
    templateBuilder.clear('admin-modal');
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
    const product = {
        name: document.getElementById('name').value,
        price: parseFloat(document.getElementById('price').value),
        categoryId: parseInt(document.getElementById('categoryId').value, 10),
        subCategory: document.getElementById('subCategory').value,
        stock: parseInt(document.getElementById('stock').value || '0', 10),
        featured: document.getElementById('isFeatured').checked,
        imageUrl: document.getElementById('imageUrl').value,
        description: document.getElementById('description').value
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
