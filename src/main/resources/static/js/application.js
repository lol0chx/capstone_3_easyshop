

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

function loadHome()
{
    templateBuilder.build('home',{},'main');
    
    setTimeout(() => {
        productService.search();
        categoryService.getAllCategories(loadCategories);
    }, 100);
}

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

    const profile = {
        firstName,
        lastName,
        phone,
        email,
        address,
        city,
        state,
        zip
    };

    profileService.updateProfile(profile);
}

function showCart()
{
    cartService.loadCartPage();
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
    
    setTimeout(() => {
        if (userService && userService.isLoggedIn()) {
            loadHome();
            userService.setHeaderLogin();
        } else {
            showLoginForm();
        }
    }, 100);
});
