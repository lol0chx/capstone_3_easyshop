

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
    const mainEl = document.querySelector('main');
    if (mainEl) mainEl.classList.remove('no-sidebar');
    
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
    const company = document.getElementById("company") ? document.getElementById("company").value : "";
    const dob = document.getElementById("dob") ? document.getElementById("dob").value : "";
    const gender = document.getElementById("gender") ? document.getElementById("gender").value : "";
    const phone = document.getElementById("phone").value;
    const secondaryPhone = document.getElementById("secondaryPhone") ? document.getElementById("secondaryPhone").value : "";
    const email = document.getElementById("email").value;
    const preferredContact = document.getElementById("preferredContact") ? document.getElementById("preferredContact").value : "email";
    const newsletter = document.getElementById("newsletter") ? document.getElementById("newsletter").checked : false;
    const address = document.getElementById("address").value;
    const address2 = document.getElementById("address2") ? document.getElementById("address2").value : "";
    const city = document.getElementById("city").value;
    const state = document.getElementById("state").value;
    const zip = document.getElementById("zip").value;
    const country = document.getElementById("country") ? document.getElementById("country").value : "";
    const bio = document.getElementById("bio") ? document.getElementById("bio").value : "";
    const avatarInput = document.getElementById("avatar");
    let avatarDataUrl = "";
    // capture current preview if exists
    const previewEl = document.getElementById("avatarPreview");
    if (previewEl && previewEl.src && previewEl.style.display !== "none") {
        avatarDataUrl = previewEl.src;
    }
    const language = document.getElementById("language") ? document.getElementById("language").value : "en";
    const timezone = document.getElementById("timezone") ? document.getElementById("timezone").value : "UTC";
    const showEmail = document.getElementById("showEmail") ? document.getElementById("showEmail").checked : false;
    const website = document.getElementById("website") ? document.getElementById("website").value : "";
    const twitter = document.getElementById("twitter") ? document.getElementById("twitter").value : "";
    const instagram = document.getElementById("instagram") ? document.getElementById("instagram").value : "";
    const deliveryInstructions = document.getElementById("deliveryInstructions") ? document.getElementById("deliveryInstructions").value : "";

    if (!firstName || !lastName || !email) {
        alert('Please fill in required fields (First Name, Last Name, Email)');
        return;
    }

    const profile = {
        firstName,
        lastName,
        company,
        dob,
        phone,
        secondaryPhone,
        email,
        preferredContact,
        newsletter,
        address,
        address2,
        city,
        state,
        zip,
        country
    };

    const extras = {
        company,
        dob,
        gender,
        secondaryPhone,
        preferredContact,
        newsletter,
        address2,
        country,
        bio,
        avatarDataUrl,
        language,
        timezone,
        showEmail,
        website,
        twitter,
        instagram,
        deliveryInstructions
    };
    profileService.updateProfile(profile, extras);
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
