// =========================================================================
// ملف JavaScript الشامل والمدمج للمشروع
// يحتوي على:
// 1. منطق المصادقة (التسجيل/الدخول) مع حفظ البيانات في LocalStorage.
// 2. منطق المتجر والفلاتر.
// 3. منطق السلة والمفضلة مع الحفظ الدائم في LocalStorage.
// =========================================================================

document.addEventListener('DOMContentLoaded', () => {

    // =========================================================================
    // 0. دوال مساعدة لـ LocalStorage (للتخزين الدائم)
    // =========================================================================

    /**
     * تحفظ البيانات في LocalStorage بعد تحويلها إلى نص JSON.
     * @param {string} key - المفتاح الذي سيتم التخزين تحته.
     * @param {any} value - القيمة (عادة مصفوفة أو كائن) المراد تخزينها.
     */
    function saveToLocalStorage(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.error(`Error saving ${key} to localStorage`, e);
        }
    }

    /**
     * تحمل البيانات من LocalStorage وتقوم بتحليل نص JSON.
     * @param {string} key - المفتاح المراد جلبه.
     * @returns {any | null} - البيانات المحللة أو null إذا لم توجد أو حدث خطأ.
     */
    function loadFromLocalStorage(key) {
        try {
            const serializedState = localStorage.getItem(key);
            if (serializedState === null) {
                return null;
            }
            return JSON.parse(serializedState);
        } catch (e) {
            console.error(`Error loading ${key} from localStorage`, e);
            return null;
        }
    }


    // =========================================================================
    // 1. الحالة العامة للتطبيق (Global State)
    // =========================================================================
    let allProducts = []; // المخزون الكامل للمنتجات
    let cart = loadFromLocalStorage('cart') || []; // محتويات سلة التسوق
    let wishlist = loadFromLocalStorage('wishlist') || []; // محتويات قائمة المفضلة
    let modalEventsAreBound = false; // لمنع ربط أحداث المودال أكثر من مرة

    // حالة الفلاتر (لصفحة المتجر)
    let availableCategories = []; // الفئات الفريدة المتاحة في المنتجات
    let selectedCategories = []; // الفئات التي اختارها المستخدم
    let minPrice = null; // الحد الأدنى للسعر المختار
    let maxPrice = null; // الحد الأقصى للسعر المختار


    // =========================================================================
    // 2. الدوال الرئيسية للتهيئة والتحميل
    // =========================================================================

    async function main() {
        // تحميل الناف بار أولاً
        if (document.getElementById('navbar-placeholder')) {
            await loadComponent('navbar-placeholder', '../component/nav.html', initializeNavbarLogic);
        }

        // إعداد منطق تبديل نماذج الدخول والتسجيل
        initializeFormSwitching();
        
        // تشغيل منطق المصادقة (التسجيل والدخول)
        initializeAuthLogic(); 

        // إعداد قسم المنتجات والفلاتر (إذا كان موجوداً في الصفحة)
        if (document.getElementById('products-section')) {
            await initializeProductSection();
        }
        
        // تحميل الفوتر في النهاية
        if (document.getElementById('footer-placeholder')) {
            await loadComponent('footer-placeholder', '../component/footer.html');
        }
    }

    async function loadComponent(elementId, filePath, callback) {
        try {
            const response = await fetch(filePath);
            if (!response.ok) {
                throw new Error(`Failed to load ${filePath}. Status: ${response.status}`);
            }
            const htmlContent = await response.text();
            const placeholder = document.getElementById(elementId);
            if (placeholder) {
                placeholder.innerHTML = htmlContent;
                if (callback && typeof callback === 'function') {
                    callback();
                }
            }
        } catch (error) {
            console.error(`Error loading component for #${elementId}:`, error);
        }
    }

    // =========================================================================
    // 3. منطق الناف بار المدمج (Navbar & Side Panel Logic)
    // =========================================================================

    function initializeNavbarLogic() {
        const mobileMenuButton = document.getElementById('mobile-menu-button');
        const mobileMenu = document.getElementById('mobile-menu');
        if (mobileMenuButton && mobileMenu) {
            mobileMenuButton.addEventListener('click', () => {
                mobileMenu.classList.toggle('hidden');
            });
        }
        document.querySelectorAll('.nav-cart-btn').forEach(icon => icon.addEventListener('click', () => openSidePanel('cart')));
        document.querySelectorAll('.nav-wishlist-btn').forEach(icon => icon.addEventListener('click', () => openSidePanel('wishlist')));
        const sidePanelOverlay = document.getElementById('side-panel-overlay');
        if (sidePanelOverlay) {
            sidePanelOverlay.addEventListener('click', closeSidePanel);
        }
        const desktopUserIcon = document.getElementById('desktop-user-icon');
        const mobileUserIcon = document.getElementById('mobile-user-icon');
        const isOnUserPage = !!document.getElementById('userLoginTab');
        const isOnSellerPage = !!document.getElementById('sellerLoginTab');
        const handleUserIconClick = (e) => {
            e.preventDefault();
            let formElementToScroll = null;
            if (isOnUserPage && typeof window.showUserForm === 'function') {
                window.showUserForm('userLoginForm');
                formElementToScroll = document.getElementById('userLoginForm');
            } else if (isOnSellerPage && typeof window.showSellerForm === 'function') {
                window.showSellerForm('sellerLoginForm');
                formElementToScroll = document.getElementById('sellerLoginForm');
            } else {
                 // إذا لم يكن في صفحة الدخول، نقله إليها
                window.location.href = '../pages/userEnter.html';
            }
            if (formElementToScroll) {
                formElementToScroll.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
                mobileMenu.classList.add('hidden');
            }
        };
        if (desktopUserIcon) {
            desktopUserIcon.addEventListener('click', handleUserIconClick);
        }
        if (mobileUserIcon) {
            mobileUserIcon.addEventListener('click', handleUserIconClick);
        }
        updateNavbarCounters();
    }


    // =========================================================================
    // 4. منطق تبديل نماذج الدخول والتسجيل
    // =========================================================================
    
    function initializeFormSwitching() {
        setupFormSwitching(
            'userLoginTab', 'userRegisterTab', 'userLoginForm', 'userRegisterForm',
            'userSwitchToLoginLink', 'userSwitchToRegisterLink', 'userRegisterForm', 'user-form-section'
        );
        setupFormSwitching(
            'sellerLoginTab', 'sellerRegisterTab', 'sellerLoginForm', 'sellerRegisterForm',
            'sellerSwitchToLoginLink', 'sellerSwitchToRegisterLink', 'sellerRegisterForm', 'seller-form-section'
        );
    }

    function setupFormSwitching(loginTabId, registerTabId, loginFormId, registerFormId, switchToLoginLinkId, switchToRegisterLinkId, defaultFormId, formSectionClass) {
        const loginTab = document.getElementById(loginTabId);
        const registerTab = document.getElementById(registerTabId);
        const loginForm = document.getElementById(loginFormId);
        const registerForm = document.getElementById(registerFormId);
        const switchToLoginLink = document.getElementById(switchToLoginLinkId);
        const switchToRegisterLink = document.getElementById(switchToRegisterLinkId);

        if (!loginTab || !registerTab || !loginForm || !registerForm || !switchToLoginLink || !switchToRegisterLink) {
            return;
        }

        function showSpecificForm(formIdToShow) {
            document.querySelectorAll(`.${formSectionClass}`).forEach(form => form.classList.add('hidden'));
            const formElement = document.getElementById(formIdToShow);
            if (formElement) {
                formElement.classList.remove('hidden');
            }
            const goldTextClass = 'user-gold-text';
            const activeLoginColorClass = 'text-gray-800';
            const inactiveColorClass = 'text-gray-400';
            if (formIdToShow === loginFormId) {
                loginTab.classList.remove(inactiveColorClass);
                loginTab.classList.add(activeLoginColorClass);
                loginTab.classList.remove(goldTextClass);
                registerTab.classList.remove(goldTextClass);
                registerTab.classList.add(inactiveColorClass);
            } else {
                registerTab.classList.remove(inactiveColorClass);
                registerTab.classList.add(goldTextClass);
                loginTab.classList.remove(activeLoginColorClass);
                loginTab.classList.add(inactiveColorClass);
            }
        }
        
        if (loginTabId.includes('user')) {
            window.showUserForm = showSpecificForm;
        } else if (loginTabId.includes('seller')) {
            window.showSellerForm = showSpecificForm;
        }
        
        const safeShowForm = window.showUserForm || showSpecificForm;

        loginTab.addEventListener('click', () => safeShowForm(loginFormId));
        registerTab.addEventListener('click', () => safeShowForm(registerFormId));
        switchToLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            safeShowForm(loginFormId);
        });
        switchToRegisterLink.addEventListener('click', (e) => {
            e.preventDefault();
            safeShowForm(registerFormId);
        });

        safeShowForm(defaultFormId);
    }


    // =========================================================================
    // 4.5. منطق المصادقة (التسجيل وحفظ البيانات وتسجيل الدخول)
    // =========================================================================

    function initializeAuthLogic() {
        const registrationForm = document.getElementById('registrationForm');
        const loginForm = document.getElementById('loginForm');

        if (registrationForm) {
            registrationForm.addEventListener('submit', handleRegistration);
        }

        if (loginForm) {
            loginForm.addEventListener('submit', handleLogin);
        }
    }

    /**
     * دالة لمعالجة عملية التسجيل الجديدة.
     * @param {Event} e - كائن الحدث الخاص بالـ submit.
     */
    function handleRegistration(e) {
        e.preventDefault(); // منع الإرسال التلقائي للنموذج

        const fullName = document.getElementById('userRegFullName').value.trim();
        const mobile = document.getElementById('userRegMobileNumber').value.trim();
        const email = document.getElementById('userRegEmail').value.trim().toLowerCase();
        const password = document.getElementById('userRegPassword').value;
        const gender = document.querySelector('input[name="userGender"]:checked').value;
        
        const users = loadFromLocalStorage('registeredUsers') || [];
        const emailExists = users.some(user => user.email === email);

        if (emailExists) {
            alert('An account with this email already exists. Please log in.');
            return;
        }

        const newUser = { fullName, mobile, email, password, gender };
        users.push(newUser);
        saveToLocalStorage('registeredUsers', users);

        alert('Registration successful! You can now log in.');
        e.target.reset();

        if (window.showUserForm) {
            window.showUserForm('userLoginForm');
        }
    }

    /**
     * دالة لمعالجة عملية تسجيل الدخول.
     * @param {Event} e - كائن الحدث الخاص بالـ submit.
     */
    function handleLogin(e) {
        e.preventDefault(); // منع الإرسال التلقائي للنموذج

        const email = document.getElementById('userLoginEmail').value.trim().toLowerCase();
        const password = document.getElementById('userLoginPassword').value;

        if (!email || !password) {
            alert('Please enter both email and password.');
            return;
        }

        const users = loadFromLocalStorage('registeredUsers') || [];
        const foundUser = users.find(user => user.email === email && user.password === password);

        if (foundUser) {
            alert(`Welcome back, ${foundUser.fullName}!`);
            // تخزين معلومات المستخدم الحالي في session/local storage للإشارة إلى أنه مسجل دخوله
            saveToLocalStorage('currentUser', foundUser);
            // إعادة توجيه المستخدم إلى الصفحة الرئيسية
            window.location.href = '../index.html'; 
        } else {
            alert('Invalid email or password. Please try again or register.');
        }
    }


    // =========================================================================
    // 5. منطق المتجر (Shop Logic: Side Panel, Cart, Wishlist, Products)
    // =========================================================================
    
    function openSidePanel(type) {
        const sidePanelContainer = document.getElementById('side-panel-container');
        const sidePanel = document.getElementById('side-panel');
        if (!sidePanelContainer || !sidePanel) return;
        renderSidePanel(type);
        sidePanelContainer.classList.remove('hidden');
        setTimeout(() => sidePanel.classList.remove('translate-x-full'), 10);
    }

    function closeSidePanel() {
        const sidePanelContainer = document.getElementById('side-panel-container');
        const sidePanel = document.getElementById('side-panel');
        if (!sidePanelContainer || !sidePanel) return;
        sidePanel.classList.add('translate-x-full');
        sidePanel.addEventListener('transitionend', function handler() {
            sidePanelContainer.classList.add('hidden');
            sidePanel.removeEventListener('transitionend', handler);
        });
    }

    function renderSidePanel(type) {
        const sidePanel = document.getElementById('side-panel');
        if (!sidePanel) return;
        const items = type === 'cart' ? cart : wishlist;
        const title = type === 'cart' ? 'Shopping Bag' : 'My Wishlist';

        let bodyHTML = items.length === 0 ? `<p class="text-center text-gray-500 mt-8">Your ${type} is empty.</p>` : items.map(item => {
            const actionButtonHTML = type === 'cart' ? `<div class="flex items-center border rounded-md"><button class="cart-quantity-btn px-2 py-1 text-sm" data-product-id="${item.id}" data-action="decrease">-</button><span class="px-3 py-1 text-sm">${item.quantity}</span><button class="cart-quantity-btn px-2 py-1 text-sm" data-product-id="${item.id}" data-action="increase">+</button></div>` : `<button class="add-to-cart-from-wishlist-btn bg-slate-100 text-xs font-semibold px-3 py-1 rounded-md hover:bg-slate-200" data-product-id="${item.id}">Add to Cart</button>`;
            const price = item.price ? `${item.price.toFixed(2)} KWD` : 'N/A';
            const imageUrl = item.imageUrl || 'https://via.placeholder.com/80x80?text=No+Image';
            return `<div class="flex items-start space-x-4 pb-4 border-b last:border-b-0"><img src="${imageUrl}" alt="${item.name || 'Product'}" class="w-16 h-16 object-cover rounded-md"><div class="flex-grow flex flex-col"><h4 class="font-semibold text-sm">${item.name || 'Unnamed Product'}</h4><p class="font-bold text-sm mt-1">${price}</p><div class="flex items-center justify-between mt-2">${actionButtonHTML}<button class="remove-item-btn text-gray-400 hover:text-red-500" data-product-id="${item.id}" data-type="${type}"><svg class="w-5 h-5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button></div></div></div>`;
        }).join('');
        
        let footerHTML = '';
        if (type === 'cart' && items.length > 0) {
            const subtotal = cart.reduce((sum, item) => sum + ((item.price || 0) * item.quantity), 0);
            footerHTML = `
  <div class="p-4 border-t space-y-2">
    <div class="flex justify-between font-bold text-md">
      <span>Subtotal:</span>
      <span>${subtotal.toFixed(2)} KWD</span>
    </div>
    <button id="checkout-btn" class="w-full user-gold-button text-white font-bold py-3 rounded-md hover:bg-gray-800 transition">
      Checkout
    </button>
    <div id="successModal" class="fixed inset-0 flex items-center justify-center  hidden z-50">
  <div class="bg-white p-6 rounded-md shadow-md text-center">
    <h2 class="text-xl font-bold mb-4">🎉 Your request has been successfully received</h2>
    <button id="closeModalBtn" class="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
      Close
    </button>
  </div>
</div>
  </div>
`;
document.addEventListener("click", function (e) {
  if (e.target.id === "checkout-btn") {
    document.getElementById("successModal").classList.remove("hidden");
  }

  if (e.target.id === "closeModalBtn") {
    document.getElementById("successModal").classList.add("hidden");
  }
});


        }
        sidePanel.innerHTML = `<div class="flex justify-between items-center p-4 border-b"><h2 class="text-xl font-semibold">${title}</h2><button id="side-panel-close-btn" class="text-gray-500 hover:text-gray-800"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button></div><div class="flex-grow p-4 overflow-y-auto space-y-4">${bodyHTML}</div>${footerHTML}`;
        document.getElementById('side-panel-close-btn')?.addEventListener('click', closeSidePanel);
        sidePanel.querySelectorAll('.remove-item-btn').forEach(btn => btn.addEventListener('click', handleRemoveItem));
        sidePanel.querySelectorAll('.add-to-cart-from-wishlist-btn').forEach(btn => btn.addEventListener('click', handleAddToCartFromWishlist));
        sidePanel.querySelectorAll('.cart-quantity-btn').forEach(btn => btn.addEventListener('click', handleCartQuantityChange));
    }
    
    function addToCart(productId, quantityToAdd = 1) {
        const productToAdd = allProducts.find(p => p.id == productId);
        if (!productToAdd) return;
        const productInCart = cart.find(item => item.id == productId);
        if (productInCart) {
            productInCart.quantity += quantityToAdd;
        } else {
            cart.push({ ...productToAdd, quantity: quantityToAdd });
        }
        saveToLocalStorage('cart', cart);
        updateNavbarCounters();
        if (!document.getElementById('side-panel-container').classList.contains('hidden') && document.querySelector('#side-panel h2')?.textContent === 'Shopping Bag') {
            renderSidePanel('cart');
        }
    }

    function toggleWishlist(productId) {
        const product = allProducts.find(p => p.id == productId);
        if (!product) return;
        const productIndex = wishlist.findIndex(item => item.id == productId);
        if (productIndex > -1) {
            wishlist.splice(productIndex, 1);
        } else {
            if (!wishlist.some(p => p.id == productId)) {
                wishlist.push(product);
            }
        }
        saveToLocalStorage('wishlist', wishlist);
        updateLikeUI(productId, productIndex === -1);
        updateNavbarCounters();
        if (!document.getElementById('side-panel-container').classList.contains('hidden') && document.querySelector('#side-panel h2')?.textContent === 'My Wishlist') {
            renderSidePanel('wishlist');
        }
    }

    function handleRemoveItem(e) {
        const { productId, type } = e.currentTarget.dataset;
        if (type === 'wishlist') {
            toggleWishlist(productId);
            renderSidePanel('wishlist');
        } else if (type === 'cart') {
            cart = cart.filter(item => item.id != productId);
            saveToLocalStorage('cart', cart);
            updateNavbarCounters();
            renderSidePanel('cart');
        }
    }

    function handleAddToCartFromWishlist(e) {
        const { productId } = e.currentTarget.dataset;
        addToCart(productId);
        toggleWishlist(productId); 
        renderSidePanel('wishlist');
    }

    function handleCartQuantityChange(e) {
        const { productId, action } = e.currentTarget.dataset;
        const itemInCart = cart.find(item => item.id == productId);
        if (!itemInCart) return;

        if (action === 'increase') {
            itemInCart.quantity++;
        } else if (action === 'decrease') {
            itemInCart.quantity--;
            if (itemInCart.quantity <= 0) {
                cart = cart.filter(item => item.id != productId);
            }
        }
        saveToLocalStorage('cart', cart);
        updateNavbarCounters();
        renderSidePanel('cart');
    }

    function updateNavbarCounters() {
        const cartLength = cart.reduce((sum, item) => sum + item.quantity, 0);
        const wishlistLength = wishlist.length;
        document.querySelectorAll('.nav-cart-count').forEach(el => {
            el.textContent = cartLength;
            el.classList.toggle('hidden', cartLength === 0);
        });
        document.querySelectorAll('.nav-wishlist-count').forEach(el => {
            el.textContent = wishlistLength;
            el.classList.toggle('hidden', wishlistLength === 0);
        });
    }

    function updateLikeUI(productId, isLiked) {
        document.querySelectorAll(`.like-btn[data-product-id="${productId}"]`).forEach(btn => {
            const heartIcon = btn.querySelector('svg');
            btn.classList.toggle('border-red-500', isLiked);
            heartIcon.classList.toggle('text-red-500', isLiked);
            heartIcon.classList.toggle('text-gray-500', !isLiked);
        });
        const modalLikeBtn = document.getElementById('modal-like-btn');
        if (modalLikeBtn && modalLikeBtn.dataset.productId == productId && !document.getElementById('product-modal').classList.contains('hidden')) {
            const heartIcon = modalLikeBtn.querySelector('svg');
            heartIcon.classList.toggle('text-red-500', isLiked);
        }
    }

    

    // =========================================================================
    // 6. منطق عرض المنتجات والفلاتر والمودال (Product Grid, Filters, Modal)
    // =========================================================================

    async function initializeProductSection() {
        bindModalEventsOnce();
        if (allProducts.length === 0) {
            try {
                const response = await fetch('../products.json');
                if (!response.ok) throw new Error('Failed to load products.json');
                const productsData = await response.json();
                allProducts = productsData.map((product, index) => ({ id: product.id || `product-${index}`, ...product }));
                extractAvailableCategories();
                renderFilterSidebar();
                bindFilterEvents();
            } catch (error) {
                console.error("Error loading products:", error);
                const productGrid = document.getElementById('product-grid');
                if(productGrid) productGrid.innerHTML = '<p class="col-span-full text-center text-red-600">Failed to load products.</p>';
                return;
            }
        }
        applyFilters();
        const productGrid = document.getElementById('product-grid');
        if (productGrid) {
            bindProductGridEvents(productGrid);
        }
    }

    function extractAvailableCategories() {
        const categories = new Set(allProducts.map(p => p.category).filter(Boolean));
        availableCategories = Array.from(categories).sort();
    }

    function renderFilterSidebar() {
        const categoryOptionsDiv = document.getElementById('category-options');
        const minPriceInput = document.getElementById('min-price');
        const maxPriceInput = document.getElementById('max-price');

        if (categoryOptionsDiv) {
            const isAllSelected = selectedCategories.length === 0;
            let categoryHTML = `<div class="flex items-center"><input type="checkbox" id="category-all" value="all" class="filter-checkbox mr-2 rounded text-blue-600 focus:ring-blue-500 cursor-pointer" ${isAllSelected ? 'checked' : ''}><label for="category-all" class="text-gray-700 text-sm cursor-pointer">All Categories</label></div>`;
            if (availableCategories.length > 0) {
                availableCategories.forEach(category => {
                    const isChecked = selectedCategories.includes(category);
                    const categoryId = `category-${category.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase()}`;
                    categoryHTML += `<div class="flex items-center"><input type="checkbox" id="${categoryId}" value="${category}" class="filter-checkbox mr-2 rounded text-blue-600 focus:ring-blue-500 cursor-pointer" ${isChecked ? 'checked' : ''}><label for="${categoryId}" class="text-gray-700 text-sm cursor-pointer">${category}</label></div>`;
                });
            } else {
                categoryHTML += '<p class="text-sm text-gray-500">No categories available.</p>';
            }
            categoryOptionsDiv.innerHTML = categoryHTML;
        }

        if (minPriceInput) minPriceInput.value = minPrice !== null ? minPrice : '';
        if (maxPriceInput) maxPriceInput.value = maxPrice !== null ? maxPrice : '';
    }

    function bindFilterEvents() {
        const categoryOptionsDiv = document.getElementById('category-options');
        const minPriceInput = document.getElementById('min-price');
        const maxPriceInput = document.getElementById('max-price');
        const resetFiltersBtn = document.getElementById('reset-filters-btn');

        if (categoryOptionsDiv) {
            categoryOptionsDiv.addEventListener('change', (e) => {
                if (e.target.classList.contains('filter-checkbox')) {
                    const value = e.target.value;
                    const isChecked = e.target.checked;
                    const allCheckbox = document.getElementById('category-all');
                    if (value === 'all') {
                        if (isChecked) {
                            selectedCategories = [];
                            categoryOptionsDiv.querySelectorAll('.filter-checkbox:not(#category-all)').forEach(cb => cb.checked = false);
                        }
                    } else {
                        if (isChecked) {
                            if (!selectedCategories.includes(value)) selectedCategories.push(value);
                            if (allCheckbox) allCheckbox.checked = false;
                        } else {
                            selectedCategories = selectedCategories.filter(cat => cat !== value);
                            if (selectedCategories.length === 0 && allCheckbox) allCheckbox.checked = true;
                        }
                    }
                    applyFilters();
                }
            });
        }
        if (minPriceInput) { minPriceInput.addEventListener('input', (e) => { minPrice = parseFloat(e.target.value) >= 0 ? parseFloat(e.target.value) : null; applyFilters(); }); }
        if (maxPriceInput) { maxPriceInput.addEventListener('input', (e) => { maxPrice = parseFloat(e.target.value) >= 0 ? parseFloat(e.target.value) : null; applyFilters(); }); }
        if (resetFiltersBtn) { resetFiltersBtn.addEventListener('click', resetFilters); }
    }

    function applyFilters() {
        let filteredProducts = allProducts;
        if (selectedCategories.length > 0) {
            filteredProducts = filteredProducts.filter(p => p.category && selectedCategories.includes(p.category));
        }
        if (minPrice !== null) {
            filteredProducts = filteredProducts.filter(p => p.price !== undefined && p.price !== null && p.price >= minPrice);
        }
        if (maxPrice !== null) {
            filteredProducts = filteredProducts.filter(p => p.price !== undefined && p.price !== null && p.price <= maxPrice);
        }
        renderProductCards(filteredProducts);
        const noProductsMessage = document.getElementById('no-products-message');
        const productGrid = document.getElementById('product-grid');
        if (noProductsMessage && productGrid) {
            noProductsMessage.classList.toggle('hidden', !(filteredProducts.length === 0 && allProducts.length > 0));
            if (filteredProducts.length === 0 && allProducts.length > 0) productGrid.innerHTML = '';
        }
    }

    function resetFilters() {
        selectedCategories = [];
        minPrice = null;
        maxPrice = null;
        const categoryOptionsDiv = document.getElementById('category-options');
        if (categoryOptionsDiv) {
            categoryOptionsDiv.querySelectorAll('.filter-checkbox').forEach(cb => cb.checked = (cb.value === 'all'));
        }
        const minPriceInput = document.getElementById('min-price');
        const maxPriceInput = document.getElementById('max-price');
        if (minPriceInput) minPriceInput.value = '';
        if (maxPriceInput) maxPriceInput.value = '';
        applyFilters();
    }

    function renderProductCards(productsToRender) {
        const productGrid = document.getElementById('product-grid');
        if (!productGrid) return;
        productGrid.innerHTML = !productsToRender || productsToRender.length === 0 ? '' : productsToRender.map(product => {
            const isLiked = wishlist.some(item => item.id == product.id);
            const heartColorClass = isLiked ? 'text-red-500' : 'text-gray-500';
            const likeBtnBorderClass = isLiked ? 'border-red-500' : 'border-gray-300';
            return `<div class="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col group"><div class="relative"><img src="${product.imageUrl || 'https://via.placeholder.com/256x256?text=No+Image'}" alt="${product.name || 'Product image'}" class="w-full h-64 object-cover"></div><div class="p-5 flex-grow flex flex-col"><p class="text-sm text-gray-500">${product.brand || 'Unknown Brand'}</p><h3 class="text-lg font-semibold text-gray-900 mt-1">${product.name || 'Unnamed Product'}</h3><p class="text-2xl font-bold text-gray-800 mt-auto pt-4">${(product.price || 0).toFixed(2)} KWD</p></div><div class="p-4 border-t border-gray-100 flex items-center space-x-2"><button class="add-to-cart-btn flex-grow user-gold-button text-white font-bold py-2 px-4 rounded-md  transition" data-product-id="${product.id}">Add to Cart</button><button class="like-btn p-2 border ${likeBtnBorderClass} rounded-md hover:bg-gray-50 transition" data-product-id="${product.id}"><svg class="w-5 h-5 ${heartColorClass} pointer-events-none" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd"></path></svg></button><button class="quick-view-btn p-2 border border-gray-300 rounded-md hover:bg-gray-50 transition" data-product-id="${product.id}"><svg class="w-5 h-5 text-gray-600 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg></button></div></div>`;
        }).join('');
    }

    function bindProductGridEvents(productGrid) {
        productGrid.addEventListener('click', e => {
            const cartBtn = e.target.closest('.add-to-cart-btn');
            const likeBtn = e.target.closest('.like-btn');
            const quickViewBtn = e.target.closest('.quick-view-btn');
            if (cartBtn) {
                addToCart(cartBtn.dataset.productId);
            } else if (likeBtn) {
                toggleWishlist(likeBtn.dataset.productId);
            } else if (quickViewBtn) {
                openQuickViewModal(quickViewBtn.dataset.productId);
            }
        });
    }

    function openQuickViewModal(productId) {
        const product = allProducts.find(p => p.id == productId);
        if (!product) return;
        const modal = document.getElementById('product-modal');
        if (!modal) return;
        
        document.getElementById('modal-main-image').src = product.imageUrl || 'https://via.placeholder.com/500x500?text=No+Image';
        document.getElementById('modal-brand').textContent = product.brand || 'N/A';
        document.getElementById('modal-title').textContent = product.name || 'Unnamed Product';
        document.getElementById('modal-price').textContent = `${(product.price || 0).toFixed(2)} KWD`;
        
        const summaryElement = document.getElementById('modal-summary');
        summaryElement.textContent = (product.description && product.description.summary) || '';
        summaryElement.classList.toggle('hidden', !summaryElement.textContent);

        const featuresSection = document.getElementById('modal-features-section');
        const featuresList = document.getElementById('modal-features-list');
        const hasFeatures = product.description && Array.isArray(product.description.features) && product.description.features.length > 0;
        featuresList.innerHTML = hasFeatures ? product.description.features.map(f => `<li>${f}</li>`).join('') : '';
        featuresSection.classList.toggle('hidden', !hasFeatures);
        
const galleryContainer = document.getElementById('modal-gallery');
        galleryContainer.innerHTML = ''; // مسح الصور السابقة
        if (product.gallery && Array.isArray(product.gallery) && product.gallery.length > 0) {
            product.gallery.forEach(imgUrl => {
                const thumb = document.createElement('img');
                thumb.src = imgUrl || 'https://via.placeholder.com/80x80?text=No+Image';
                thumb.alt = `${product.name} gallery image`;
                thumb.className = 'w-full h-auto object-cover rounded-md border cursor-pointer hover:border-blue-500';
                // عند النقر على صورة مصغرة، يتم تغيير الصورة الرئيسية
                thumb.addEventListener('click', () => { document.getElementById('modal-main-image').src = thumb.src; });
                galleryContainer.appendChild(thumb);
            });
        } else {
             // إذا لم يكن هناك معرض، ربما نعرض الصورة الرئيسية مرة أخرى أو نتركها فارغة
             // galleryContainer.innerHTML = ''; // Ensure it's empty
        }        
        document.getElementById('modal-add-to-cart-btn').dataset.productId = product.id;
        document.getElementById('modal-like-btn').dataset.productId = product.id;
        
        const isLikedInWishlist = wishlist.some(item => item.id == product.id);
        const modalLikeBtn = document.getElementById('modal-like-btn');
        if (modalLikeBtn) {
            const heartIcon = modalLikeBtn.querySelector('svg');
            heartIcon.classList.toggle('text-red-500', isLikedInWishlist);
            heartIcon.classList.toggle('text-gray-500', !isLikedInWishlist);
        }
        
        document.getElementById('quantity-value').textContent = '1';
        modal.classList.remove('hidden');
    }

    function closeModal() {
        document.getElementById('product-modal').classList.add('hidden');
    }

    function bindModalEventsOnce() {
        if (modalEventsAreBound) return;
        const modal = document.getElementById('product-modal');
        if (!modal) return;
        
        document.getElementById('modal-close-btn')?.addEventListener('click', closeModal);
        document.getElementById('quantity-increase-btn')?.addEventListener('click', () => {
            const qtyEl = document.getElementById('quantity-value');
            if (qtyEl) qtyEl.textContent = parseInt(qtyEl.textContent, 10) + 1;
        });
        document.getElementById('quantity-decrease-btn')?.addEventListener('click', () => {
            const qtyEl = document.getElementById('quantity-value');
            if (qtyEl) {
                let currentQty = parseInt(qtyEl.textContent, 10);
                if (currentQty > 1) qtyEl.textContent = currentQty - 1;
            }
        });
        document.getElementById('modal-add-to-cart-btn')?.addEventListener('click', (e) => {
            const productId = e.currentTarget.dataset.productId;
            const quantity = parseInt(document.getElementById('quantity-value').textContent, 10);
            if (productId) {
                addToCart(productId, quantity);
                closeModal();
            }
        });
        document.getElementById('modal-like-btn')?.addEventListener('click', (e) => {
            const productId = e.currentTarget.dataset.productId;
            if (productId) {
                toggleWishlist(productId);
            }
        });
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
        modalEventsAreBound = true;
    }

    // =========================================================================
    // 7. بدء تشغيل التطبيق (Application Kick-off)
    // =========================================================================
    main();
});


// =========================================================================
// كود جافاسكريبت للسلايدر (إذا كان موجوداً في الصفحة)
// =========================================================================
document.addEventListener('DOMContentLoaded', function () {
    const carouselContainer = document.getElementById('carousel-container');
    if (!carouselContainer) return; // تأكد من وجود السلايدر في الصفحة

    const slides = carouselContainer.querySelectorAll('.slide');
    const prevButton = document.getElementById('next-button');
    const nextButton = document.getElementById('prev-button');
    const indicatorsContainer = document.getElementById('carousel-indicators');
    
    if (!slides.length || !prevButton || !nextButton || !indicatorsContainer) return;

    const slideInterval = 4000;
    let currentIndex = 0;
    let autoSlideTimer;

    slides.forEach((_, index) => {
        const dot = document.createElement('button');
        dot.setAttribute('type', 'button');
        dot.classList.add('w-3', 'h-3', 'rounded-full', 'bg-white', 'opacity-50', 'hover:opacity-100');
        dot.setAttribute('aria-label', `Slide ${index + 1}`);
        dot.addEventListener('click', () => {
            goToSlide(index);
            resetAutoSlide();
        });
        indicatorsContainer.appendChild(dot);
    });

    const indicators = indicatorsContainer.querySelectorAll('button');

    function goToSlide(index) {
        currentIndex = (index + slides.length) % slides.length;
        slides.forEach((slide, i) => {
            slide.classList.toggle('hidden', i !== currentIndex);
        });
        indicators.forEach((dot, i) => {
            dot.classList.toggle('opacity-100', i === currentIndex);
            dot.classList.toggle('opacity-50', i !== currentIndex);
        });
    }

    function showNextSlide() { goToSlide(currentIndex + 1); }
    function showPrevSlide() { goToSlide(currentIndex - 1); }
    function startAutoSlide() { autoSlideTimer = setInterval(showNextSlide, slideInterval); }
    function stopAutoSlide() { clearInterval(autoSlideTimer); }
    function resetAutoSlide() { stopAutoSlide(); startAutoSlide(); }

    nextButton.addEventListener('click', () => { showNextSlide(); resetAutoSlide(); });
    prevButton.addEventListener('click', () => { showPrevSlide(); resetAutoSlide(); });
    carouselContainer.addEventListener('mouseenter', stopAutoSlide);
    carouselContainer.addEventListener('mouseleave', startAutoSlide);

    goToSlide(0);
    startAutoSlide();
});
