// Load footer on page initialization
function initializeFooter() {
    templateBuilder.build('footer', {}, 'footer-placeholder');
}

function showLoginForm()
{
    templateBuilder.build('login-form', {}, 'login');
    const passwordInput = document.getElementById("password");
    if (passwordInput) {
        passwordInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                login();
            }
        });
    }
}

function hideModalForm()
{
    templateBuilder.clear('login');
}

function login()
{
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    if (!username || !password) {
        alert('Please enter both username and password');
        return;
    }

    userService.login(username, password);
    hideModalForm()
}

function showImageDetailForm(product, imageUrl)
{
    const imageDetail = {
        name: product,
        imageUrl: imageUrl
    };

    templateBuilder.build('image-detail',imageDetail,'login')
}

const CATEGORY_ICONS = [
    { match: /electronic|tech|gadget|computer|phone|laptop/i, icon: 'fa-laptop',   color: '#2563eb', bg: '#eff6ff' },
    { match: /cloth|fashion|apparel|shirt|wear|style/i,       icon: 'fa-tshirt',   color: '#10b981', bg: '#ecfdf5' },
    { match: /sport|outdoor|fitness|gym|exercise/i,           icon: 'fa-running',  color: '#f59e0b', bg: '#fffbeb' },
    { match: /home|kitchen|living|office|furniture|decor/i,   icon: 'fa-home',     color: '#ef4444', bg: '#fef2f2' },
    { match: /book|education|learn|school/i,                  icon: 'fa-book',     color: '#8b5cf6', bg: '#f5f3ff' },
    { match: /toy|game|kids|children|baby/i,                  icon: 'fa-gamepad',  color: '#ec4899', bg: '#fdf2f8' },
];
const FALLBACK_ICONS = [
    { icon: 'fa-box-open', color: '#2563eb', bg: '#eff6ff' },
    { icon: 'fa-tag',      color: '#10b981', bg: '#ecfdf5' },
    { icon: 'fa-star',     color: '#f59e0b', bg: '#fffbeb' },
    { icon: 'fa-gift',     color: '#ef4444', bg: '#fef2f2' },
    { icon: 'fa-cube',     color: '#8b5cf6', bg: '#f5f3ff' },
    { icon: 'fa-th-large', color: '#0d9488', bg: '#f0fdfa' },
];

function loadHome()
{
    const mainEl = document.querySelector('main');
    if (mainEl) mainEl.classList.add('no-sidebar');

    const catPromise  = axios.get(`${config.baseUrl}/categories`).then(r => r.data).catch(() => []);
    const prodPromise = axios.get(`${config.baseUrl}/products?page=1&size=8`).then(r => r.data).catch(() => []);

    Promise.all([catPromise, prodPromise]).then(([categories, products]) => {
        const cats = (categories || []).map((cat, i) => {
            const match    = CATEGORY_ICONS.find(ci => ci.match.test(cat.name));
            const fallback = FALLBACK_ICONS[i % FALLBACK_ICONS.length];
            return {
                categoryId:  cat.categoryId,
                name:        cat.name,
                description: cat.description || '',
                icon:        match ? match.icon  : fallback.icon,
                iconColor:   match ? match.color : fallback.color,
                bgColor:     match ? match.bg    : fallback.bg,
            };
        });

        const prods = (products || []).map(p => ({
            productId:      p.productId,
            name:           p.name,
            description:    p.description || '',
            imageUrl:       (productService && productService.hasPhoto(p.imageUrl)) ? p.imageUrl : 'no-image.jpg',
            formattedPrice: p.price != null ? `$${parseFloat(p.price).toFixed(2)}` : '',
        }));

        templateBuilder.build('landing', { categories: cats, featuredProducts: prods }, 'main');
    });
}

function loadShop(catId)
{
    templateBuilder.build('home', {}, 'main');
    const mainEl = document.querySelector('main');
    if (mainEl) mainEl.classList.remove('no-sidebar');

    productService.clearCategoryFilter();
    productService.clearMinPriceFilter();
    productService.clearMaxPriceFilter();
    productService.clearSubcategoryFilter();
    productService.page = 1;

    if (catId) productService.addCategoryFilter(catId);

    setTimeout(() => {
        if (productService && productService.computePageSize) { productService.computePageSize(); }
        productService.search();
        categoryService.getAllCategories(categories => {
            loadCategories(categories);
            if (catId) {
                const select = document.getElementById('category-select');
                if (select) select.value = catId;
            }
        });
    }, 100);
}

// toggleFilters removed; filters remain visible in left sidebar

function editProfile()
{
    profileService.loadProfile();
}

function saveProfile()
{
    const firstName = document.getElementById("firstName").value;
    const lastName = document.getElementById("lastName").value;
    const phone = document.getElementById("phone").value;
    const email = document.getElementById("email").value;
    const address = document.getElementById("address").value;
    const city = document.getElementById("city").value;
    const state = document.getElementById("state").value;
    const zip = document.getElementById("zip").value;

    if (!firstName || !lastName || !email) {
        alert('Please fill in required fields (First Name, Last Name, Email)');
        return;
    }

    profileService.updateProfile({ firstName, lastName, phone, email, address, city, state, zip });
}

function showCart()
{
    cartService.loadCartPage();
}

function showWishlist()
{
    wishlistService.loadWishlistPage();
}

function clearCart()
{
    if (confirm('Are you sure you want to clear your entire cart?')) {
        cartService.clearCart();
    }
}

function setCategory(control)
{
    productService.addCategoryFilter(control.value);
    productService.search();
}

function setSubcategory(control)
{
    productService.addSubcategoryFilter(control.value);
    productService.search();
}

function setMinPrice(control)
{
    const label = document.getElementById("min-price-display")
    label.innerText = control.value;

    const value = control.value != 0 ? control.value : "";
    productService.addMinPriceFilter(value)
    productService.search();
}

function setMaxPrice(control)
{
    const label = document.getElementById("max-price-display")
    label.innerText = control.value;

    const value = control.value != 1500 ? control.value : "";
    productService.addMaxPriceFilter(value)
    productService.search();
}

function closeError(control)
{
    setTimeout(() => {
        control.click();
    }, 3000);
}

let appInitialized = false;

document.addEventListener('DOMContentLoaded', () => {
    if (appInitialized) return;
    appInitialized = true;
    
    // Initialize footer
    initializeFooter();
    
    setTimeout(() => {
        if (userService && userService.isLoggedIn()) {
            if (wishlistService) { wishlistService.load(); }
            loadHome();
            userService.setHeaderLogin();
        } else {
            showLoginForm();
        }
    }, 100);
});

// Quick filter helpers for the sidebar
function applyPricePreset(min, max)
{
    const minEl = document.getElementById('min-price');
    const maxEl = document.getElementById('max-price');
    if (minEl && maxEl) {
        minEl.value = min;
        maxEl.value = max;
        setMinPrice(minEl);
        setMaxPrice(maxEl);
    }
}

function quickColor(color)
{
    const subEl = document.getElementById('subcategory-select');
    if (subEl) {
        subEl.value = color;
        setSubcategory(subEl);
    }
}

function resetAllFilters()
{
    const catEl = document.getElementById('category-select');
    const minEl = document.getElementById('min-price');
    const maxEl = document.getElementById('max-price');
    const subEl = document.getElementById('subcategory-select');

    if (catEl) { catEl.value = 0; setCategory(catEl); }
    if (minEl) { minEl.value = 0; setMinPrice(minEl); }
    if (maxEl) { maxEl.value = 1500; setMaxPrice(maxEl); }
    if (subEl) { subEl.value = ''; setSubcategory(subEl); }
}
