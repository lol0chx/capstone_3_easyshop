let adminProducts = {};

function loadAdminProducts()
{
    const mainEl = document.querySelector('main');
    if (mainEl) mainEl.classList.add('no-sidebar');

    // Render shell immediately so user sees navigation change
    templateBuilder.build('admin-products', { products: [] }, 'main');

    // Then fetch products and re-render with data
    console.log('Loading admin products from', `${config.baseUrl}/products`);
    axios.get(`${config.baseUrl}/products`)
        .then(response => {
            const data = { products: response.data };
            templateBuilder.build('admin-products', data, 'main');
        })
        .catch((err) => {
            console.error('Admin products load failed:', err);
            const inlineError = { error: 'Failed to load products from server.' };
            templateBuilder.append('error', inlineError, 'errors');
            // Keep shell visible; show a simple message inline
            const main = document.getElementById('main');
            if (main) {
                const msg = document.createElement('div');
                msg.style.padding = '1rem';
                msg.style.color = 'crimson';
                msg.textContent = 'Admin: could not load products. Check API (port 8080).';
                main.appendChild(msg);
            }
        });
}

function showProductForm(product)
{
    // get categories for dropdown
    const categoriesUrl = `${config.baseUrl}/categories`;
    axios.get(categoriesUrl, { headers: userService.getHeaders() })
        .then(resp => {
            const categories = resp.data.map(c => ({
                categoryId: c.categoryId,
                name: c.name,
                isSelected: product && product.categoryId === c.categoryId
            }));
            const data = { product: product || {}, categories };
            templateBuilder.build('admin-product-form', data, 'admin-modal');
        })
        .catch(() => {
            templateBuilder.append('error', { error: 'Failed to load categories.' }, 'errors');
        });
}

function hideAdminModal()
{
    templateBuilder.clear('admin-modal');
}

function editProduct(id)
{
    const url = `${config.baseUrl}/products/${id}`;
    axios.get(url, { headers: userService.getHeaders() })
        .then(response => {
            showProductForm(response.data);
        })
        .catch(() => {
            templateBuilder.append('error', { error: 'Failed to load product.' }, 'errors');
        });
}

function deleteProduct(id)
{
    if (!confirm('Delete this product?')) return;
    const url = `${config.baseUrl}/products/${id}`;
    axios.delete(url, { headers: userService.getHeaders() })
        .then(() => loadAdminProducts())
        .catch(() => {
            templateBuilder.append('error', { error: 'Failed to delete product.' }, 'errors');
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
