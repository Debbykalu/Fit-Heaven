/* ==========================================================================
   Apex Strength & Fitness - Vanilla JavaScript Logic
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    /* --------------------------------------------------------------------------
       1. Navigation & Hamburger Menu
       -------------------------------------------------------------------------- */
    const header = document.getElementById('header');
    const navToggle = document.getElementById('nav-toggle');
    const mainNav = document.getElementById('main-nav');
    const navLinks = document.querySelectorAll('.nav-link');

    // Sticky Navigation on Scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('sticky');
        } else {
            header.classList.remove('sticky');
        }
        highlightNavLinkOnScroll();
    });

    // Mobile Navigation Menu Toggle
    if (navToggle && mainNav) {
        navToggle.addEventListener('click', () => {
            const isOpen = mainNav.classList.contains('open');
            if (isOpen) {
                closeMobileMenu();
            } else {
                openMobileMenu();
            }
        });
    }

    function openMobileMenu() {
        mainNav.classList.add('open');
        navToggle.setAttribute('aria-expanded', 'true');
    }

    function closeMobileMenu() {
        mainNav.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
    }

    // Close Mobile Menu on Nav Link Click (Smooth scroll handles viewport change)
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);

            if (targetSection) {
                closeMobileMenu();
                
                // Calculate scroll position compensating for sticky header
                const headerOffset = header.classList.contains('sticky') ? 70 : 80;
                const elementPosition = targetSection.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Dynamic Navigation Link Active Highlight on Scroll
    const sections = document.querySelectorAll('section[id]');
    
    function highlightNavLinkOnScroll() {
        const scrollPosition = window.pageYOffset + 120; // threshold for activation

        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop;
            const sectionId = section.getAttribute('id');
            const correspondingLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);

            if (correspondingLink) {
                if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                    navLinks.forEach(lnk => lnk.classList.remove('active'));
                    correspondingLink.classList.add('active');
                }
            }
        });
    }

    /* --------------------------------------------------------------------------
       2. Unified Modal System
       -------------------------------------------------------------------------- */
    const modalOverlay = document.getElementById('modal-overlay');
    const allModals = document.querySelectorAll('.modal-content-card');
    const closeButtons = document.querySelectorAll('.modal-close, .modal-cancel-btn, .modal-success-close');

    // Open Specific Modal
    function openModal(modalId) {
        // Hide all modals first
        allModals.forEach(modal => modal.classList.add('hidden'));
        
        // Find target modal
        const targetModal = document.getElementById(modalId);
        if (targetModal) {
            modalOverlay.classList.remove('hidden');
            targetModal.classList.remove('hidden');
            document.body.style.overflow = 'hidden'; // Lock background scroll
            
            // Focus on first input if available
            const firstInput = targetModal.querySelector('input, select');
            if (firstInput) setTimeout(() => firstInput.focus(), 100);
        }
    }

    // Close Modals
    function closeCurrentModal() {
        modalOverlay.classList.add('hidden');
        allModals.forEach(modal => {
            modal.classList.add('hidden');
            
            // Reset success overlay inside modal if present
            const successWrapper = modal.querySelector('.modal-success-wrapper');
            const formWrapper = modal.querySelector('.modal-form-wrapper');
            if (successWrapper && formWrapper) {
                successWrapper.classList.add('hidden');
                formWrapper.classList.remove('hidden');
            }
            
            // Reset form fields
            const form = modal.querySelector('form');
            if (form) {
                form.reset();
                // Clear validation errors
                const errorMsgs = form.querySelectorAll('.error-msg');
                const inputs = form.querySelectorAll('.form-control');
                errorMsgs.forEach(err => {
                    err.style.display = 'none';
                    err.innerText = '';
                });
                inputs.forEach(inp => inp.classList.remove('input-error'));
                
                // Clear signin global error
                const globalError = form.querySelector('.global-error');
                if (globalError) globalError.classList.add('hidden');
            }
        });
        document.body.style.overflow = ''; // Unlock background scroll
    }

    // Close Event Listeners
    closeButtons.forEach(btn => {
        btn.addEventListener('click', closeCurrentModal);
    });

    // Close on overlay backdrop click
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            closeCurrentModal();
        }
    });

    // Close on Escape Key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modalOverlay.classList.contains('hidden')) {
            closeCurrentModal();
        }
    });

    // Wire up trigger buttons
    document.getElementById('nav-signin-btn').addEventListener('click', () => openModal('modal-signin'));
    document.getElementById('nav-register-btn').addEventListener('click', () => openModal('modal-register'));
    document.getElementById('hero-demo-btn').addEventListener('click', () => openModal('modal-demo'));
    document.getElementById('pt-journey-btn').addEventListener('click', () => openModal('modal-pt'));
    document.getElementById('demo-claim-btn').addEventListener('click', () => openModal('modal-demo'));

    // Modal Navigation Redirects (SignIn <-> Register)
    document.getElementById('modal-to-register-btn').addEventListener('click', (e) => {
        e.preventDefault();
        openModal('modal-register');
    });

    document.getElementById('modal-to-signin-btn').addEventListener('click', (e) => {
        e.preventDefault();
        openModal('modal-signin');
    });

    document.getElementById('register-success-signin').addEventListener('click', () => {
        openModal('modal-signin');
    });

    /* --------------------------------------------------------------------------
       3. LocalStorage Authentication Simulation
       -------------------------------------------------------------------------- */
    const signinForm = document.getElementById('signin-form');
    const registerForm = document.getElementById('register-form');
    const userMenuBtn = document.getElementById('user-menu-btn');
    const dropdownMenu = document.getElementById('dropdown-menu');
    const userDropdown = document.querySelector('.user-dropdown');
    const logoutBtn = document.getElementById('logout-btn');
    const usernameDisplay = document.getElementById('username-display');

    // Read stored user database
    function getStoredUsers() {
        return JSON.parse(localStorage.getItem('apex_users')) || [];
    }

    // Save user details
    function storeUser(userObj) {
        const users = getStoredUsers();
        users.push(userObj);
        localStorage.setItem('apex_users', JSON.stringify(users));
    }

    // Set Active Logged In Session
    function setCurrentSession(userObj) {
        localStorage.setItem('apex_current_user', JSON.stringify(userObj));
        updateAuthDOM();
    }

    // Check Current User session
    function getCurrentSession() {
        return JSON.parse(localStorage.getItem('apex_current_user'));
    }

    // Clear Active Session
    function logoutSession() {
        localStorage.removeItem('apex_current_user');
        updateAuthDOM();
        closeCurrentModal();
    }

    // Updates Navigation DOM based on Login Status
    function updateAuthDOM() {
        const currentUser = getCurrentSession();
        const guestElements = document.querySelectorAll('.auth-guest');
        const userElements = document.querySelectorAll('.auth-user');

        if (currentUser) {
            // Hide guest actions, show user actions
            guestElements.forEach(el => el.classList.add('hidden'));
            userElements.forEach(el => el.classList.remove('hidden'));
            if (usernameDisplay) {
                // Shorten name to first name if long
                const firstName = currentUser.name.split(' ')[0];
                usernameDisplay.innerText = firstName;
            }
        } else {
            // Show guest actions, hide user actions
            guestElements.forEach(el => el.classList.remove('hidden'));
            userElements.forEach(el => el.classList.add('hidden'));
            if (userDropdown) {
                userDropdown.classList.remove('open');
            }
        }
    }

    // Toggle Dropdown Menu
    if (userMenuBtn) {
        userMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            userDropdown.classList.toggle('open');
        });
    }

    // Close Dropdown when clicking outside
    document.addEventListener('click', () => {
        if (userDropdown) userDropdown.classList.remove('open');
    });

    // Logout Action
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            logoutSession();
        });
    }

    // Initialize Auth state on load
    updateAuthDOM();

    /* --------------------------------------------------------------------------
       4. Input Validators & Form Handlers
       -------------------------------------------------------------------------- */

    // Helper functions for validation
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const regexPhone = /^\+?[0-9\s\-()]{7,20}$/;

    function setError(inputEl, errorEl, msg) {
        inputEl.classList.add('input-error');
        errorEl.innerText = msg;
        errorEl.style.display = 'block';
    }

    function clearError(inputEl, errorEl) {
        inputEl.classList.remove('input-error');
        errorEl.innerText = '';
        errorEl.style.display = 'none';
    }

    function validateField(inputEl, errorEl, condition, errorMsg) {
        if (condition) {
            setError(inputEl, errorEl, errorMsg);
            return false;
        } else {
            clearError(inputEl, errorEl);
            return true;
        }
    }

    // Auto fill form fields with session data if user is logged in
    function prefillFormWithSession(form) {
        const session = getCurrentSession();
        if (session) {
            const nameField = form.querySelector('input[name="name"]');
            const emailField = form.querySelector('input[name="email"]');
            const phoneField = form.querySelector('input[name="phone"]');

            if (nameField && !nameField.value) nameField.value = session.name;
            if (emailField && !emailField.value) emailField.value = session.email;
            if (phoneField && !phoneField.value) phoneField.value = session.phone || '';
        }
    }

    // Monitor modal opens to prefill fields
    allModals.forEach(modal => {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class' && !modal.classList.contains('hidden')) {
                    const form = modal.querySelector('form');
                    if (form) prefillFormWithSession(form);
                }
            });
        });
        observer.observe(modal, { attributes: true });
    });

    // A. Sign In Form Submission
    if (signinForm) {
        signinForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const emailInp = document.getElementById('signin-email');
            const passInp = document.getElementById('signin-password');
            const errEmail = document.getElementById('error-signin-email');
            const errPass = document.getElementById('error-signin-password');
            const globalErr = document.getElementById('signin-global-error');

            globalErr.classList.add('hidden');

            let isValid = true;

            // Required validations
            isValid = validateField(emailInp, errEmail, !emailInp.value.trim(), 'Email is required.') && isValid;
            isValid = validateField(passInp, errPass, !passInp.value.trim(), 'Password is required.') && isValid;

            if (emailInp.value.trim() && !regexEmail.test(emailInp.value.trim())) {
                setError(emailInp, errEmail, 'Please enter a valid email.');
                isValid = false;
            }

            if (!isValid) return;

            // Authenticate simulation
            const users = getStoredUsers();
            const matchingUser = users.find(u => u.email.toLowerCase() === emailInp.value.trim().toLowerCase() && u.password === passInp.value);

            if (matchingUser) {
                setCurrentSession(matchingUser);
                closeCurrentModal();
            } else {
                globalErr.classList.remove('hidden');
                passInp.classList.add('input-error');
            }
        });
    }

    // B. Register Form Submission
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const nameInp = document.getElementById('register-name');
            const emailInp = document.getElementById('register-email');
            const phoneInp = document.getElementById('register-phone');
            const passInp = document.getElementById('register-password');
            const confirmInp = document.getElementById('register-confirm');

            const errName = document.getElementById('error-register-name');
            const errEmail = document.getElementById('error-register-email');
            const errPhone = document.getElementById('error-register-phone');
            const errPass = document.getElementById('error-register-password');
            const errConfirm = document.getElementById('error-register-confirm');

            let isValid = true;

            // 1. Required fields checks
            isValid = validateField(nameInp, errName, !nameInp.value.trim(), 'Full name is required.') && isValid;
            isValid = validateField(emailInp, errEmail, !emailInp.value.trim(), 'Email is required.') && isValid;
            isValid = validateField(phoneInp, errPhone, !phoneInp.value.trim(), 'Phone number is required.') && isValid;
            isValid = validateField(passInp, errPass, !passInp.value.trim(), 'Password is required.') && isValid;
            isValid = validateField(confirmInp, errConfirm, !confirmInp.value.trim(), 'Please confirm password.') && isValid;

            // 2. Email format validation
            if (emailInp.value.trim() && !regexEmail.test(emailInp.value.trim())) {
                setError(emailInp, errEmail, 'Enter a valid email structure.');
                isValid = false;
            }

            // 3. Phone format validation
            if (phoneInp.value.trim() && !regexPhone.test(phoneInp.value.trim())) {
                setError(phoneInp, errPhone, 'Enter a valid phone number.');
                isValid = false;
            }

            // 4. Password length validation
            if (passInp.value.trim() && passInp.value.length < 6) {
                setError(passInp, errPass, 'Password must be at least 6 characters.');
                isValid = false;
            }

            // 5. Password matches confirm
            if (passInp.value && confirmInp.value && passInp.value !== confirmInp.value) {
                setError(confirmInp, errConfirm, 'Passwords do not match.');
                isValid = false;
            }

            // 6. Check unique email database
            if (isValid) {
                const users = getStoredUsers();
                const alreadyExists = users.some(u => u.email.toLowerCase() === emailInp.value.trim().toLowerCase());
                if (alreadyExists) {
                    setError(emailInp, errEmail, 'This email is already registered.');
                    isValid = false;
                }
            }

            if (!isValid) return;

            // Success: Register user object
            const newUser = {
                name: nameInp.value.trim(),
                email: emailInp.value.trim(),
                phone: phoneInp.value.trim(),
                password: passInp.value
            };

            storeUser(newUser);

            // Toggle visual success screen inside modal
            const card = document.getElementById('modal-register');
            const formWrapper = card.querySelector('.modal-form-wrapper');
            const successWrapper = card.querySelector('.modal-success-wrapper');
            const successName = document.getElementById('success-register-name');

            if (successName) successName.innerText = newUser.name;
            formWrapper.classList.add('hidden');
            successWrapper.classList.remove('hidden');
        });
    }

    // C. Live Session Booking Modal trigger & Submit
    const bookButtons = document.querySelectorAll('.book-service-btn');
    const bookingSessionName = document.getElementById('booking-session-name');
    const bookingSessionVal = document.getElementById('booking-session-val');
    const bookingForm = document.getElementById('booking-form');

    // Available spaces state tracking
    const spacesState = {
        'Monday': 5,
        'Wednesday': 3,
        'Saturday': 8
    };

    bookButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const card = e.target.closest('.service-card');
            const day = card.getAttribute('data-day');
            const session = card.getAttribute('data-session');
            const time = card.getAttribute('data-time');

            // Pre-fill header data attributes
            if (bookingSessionName) {
                bookingSessionName.innerText = `${day} – ${session} (${time})`;
            }
            if (bookingSessionVal) {
                bookingSessionVal.value = day;
            }
            openModal('modal-booking');
        });
    });

    if (bookingForm) {
        bookingForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const nameInp = document.getElementById('booking-name');
            const emailInp = document.getElementById('booking-email');
            const phoneInp = document.getElementById('booking-phone');
            const sessionVal = document.getElementById('booking-session-val').value;

            const errName = document.getElementById('error-booking-name');
            const errEmail = document.getElementById('error-booking-email');
            const errPhone = document.getElementById('error-booking-phone');

            let isValid = true;

            isValid = validateField(nameInp, errName, !nameInp.value.trim(), 'Full name is required.') && isValid;
            isValid = validateField(emailInp, errEmail, !emailInp.value.trim(), 'Email is required.') && isValid;
            isValid = validateField(phoneInp, errPhone, !phoneInp.value.trim(), 'Phone number is required.') && isValid;

            if (emailInp.value.trim() && !regexEmail.test(emailInp.value.trim())) {
                setError(emailInp, errEmail, 'Enter a valid email.');
                isValid = false;
            }
            if (phoneInp.value.trim() && !regexPhone.test(phoneInp.value.trim())) {
                setError(phoneInp, errPhone, 'Enter a valid phone.');
                isValid = false;
            }

            if (!isValid) return;

            // Success simulation: Decrease spaces counts
            if (spacesState[sessionVal] > 0) {
                spacesState[sessionVal]--;
                // Update DOM text content
                const countSpan = document.getElementById(`spaces-${sessionVal.toLowerCase().substring(0,3)}`);
                if (countSpan) countSpan.innerText = spacesState[sessionVal];
            }

            // Update success screen elements inside Modal
            const card = document.getElementById('modal-booking');
            const formWrapper = card.querySelector('.modal-form-wrapper');
            const successWrapper = card.querySelector('.modal-success-wrapper');
            const successSessionText = document.getElementById('success-booking-session');

            if (successSessionText) {
                successSessionText.innerText = bookingSessionName.innerText;
            }

            formWrapper.classList.add('hidden');
            successWrapper.classList.remove('hidden');
        });
    }

    // D. Personal Training Application submission
    const ptForm = document.getElementById('pt-form');
    if (ptForm) {
        ptForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const nameInp = document.getElementById('pt-name');
            const emailInp = document.getElementById('pt-email');
            const phoneInp = document.getElementById('pt-phone');
            const goalInp = document.getElementById('pt-goal');
            const levelInp = document.getElementById('pt-level');
            const timeInp = document.getElementById('pt-time');

            const errName = document.getElementById('error-pt-name');
            const errEmail = document.getElementById('error-pt-email');
            const errPhone = document.getElementById('error-pt-phone');
            const errGoal = document.getElementById('error-pt-goal');
            const errLevel = document.getElementById('error-pt-level');
            const errTime = document.getElementById('error-pt-time');

            let isValid = true;

            isValid = validateField(nameInp, errName, !nameInp.value.trim(), 'Full name is required.') && isValid;
            isValid = validateField(emailInp, errEmail, !emailInp.value.trim(), 'Email is required.') && isValid;
            isValid = validateField(phoneInp, errPhone, !phoneInp.value.trim(), 'Phone number is required.') && isValid;
            isValid = validateField(goalInp, errGoal, !goalInp.value, 'Please select a fitness goal.') && isValid;
            isValid = validateField(levelInp, errLevel, !levelInp.value, 'Please select your fitness level.') && isValid;
            isValid = validateField(timeInp, errTime, !timeInp.value, 'Please select a preferred training time.') && isValid;

            if (emailInp.value.trim() && !regexEmail.test(emailInp.value.trim())) {
                setError(emailInp, errEmail, 'Enter a valid email.');
                isValid = false;
            }
            if (phoneInp.value.trim() && !regexPhone.test(phoneInp.value.trim())) {
                setError(phoneInp, errPhone, 'Enter a valid phone.');
                isValid = false;
            }

            if (!isValid) return;

            // Trigger success wrapper
            const card = document.getElementById('modal-pt');
            const formWrapper = card.querySelector('.modal-form-wrapper');
            const successWrapper = card.querySelector('.modal-success-wrapper');

            formWrapper.classList.add('hidden');
            successWrapper.classList.remove('hidden');
        });
    }

    // E. Free Demo Registration Form
    const demoForm = document.getElementById('demo-form');
    if (demoForm) {
        demoForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const nameInp = document.getElementById('demo-name');
            const emailInp = document.getElementById('demo-email');
            const phoneInp = document.getElementById('demo-phone');
            const goalInp = document.getElementById('demo-goal');

            const errName = document.getElementById('error-demo-name');
            const errEmail = document.getElementById('error-demo-email');
            const errPhone = document.getElementById('error-demo-phone');
            const errGoal = document.getElementById('error-demo-goal');

            let isValid = true;

            isValid = validateField(nameInp, errName, !nameInp.value.trim(), 'Full name is required.') && isValid;
            isValid = validateField(emailInp, errEmail, !emailInp.value.trim(), 'Email is required.') && isValid;
            isValid = validateField(phoneInp, errPhone, !phoneInp.value.trim(), 'Phone number is required.') && isValid;
            isValid = validateField(goalInp, errGoal, !goalInp.value.trim(), 'Please enter your fitness goal.') && isValid;

            if (emailInp.value.trim() && !regexEmail.test(emailInp.value.trim())) {
                setError(emailInp, errEmail, 'Enter a valid email.');
                isValid = false;
            }
            if (phoneInp.value.trim() && !regexPhone.test(phoneInp.value.trim())) {
                setError(phoneInp, errPhone, 'Enter a valid phone.');
                isValid = false;
            }

            if (!isValid) return;

            // Trigger success wrapper
            const card = document.getElementById('modal-demo');
            const formWrapper = card.querySelector('.modal-form-wrapper');
            const successWrapper = card.querySelector('.modal-success-wrapper');

            formWrapper.classList.add('hidden');
            successWrapper.classList.remove('hidden');
        });
    }

    // F. Contact Form Submission
    const contactForm = document.getElementById('contact-form');
    const contactSuccessState = document.getElementById('contact-success-state');
    const contactSuccessResetBtn = document.getElementById('contact-success-reset');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const nameInp = document.getElementById('contact-name');
            const emailInp = document.getElementById('contact-email');
            const phoneInp = document.getElementById('contact-phone');
            const subjectInp = document.getElementById('contact-subject');
            const messageInp = document.getElementById('contact-message');

            const errName = document.getElementById('error-contact-name');
            const errEmail = document.getElementById('error-contact-email');
            const errPhone = document.getElementById('error-contact-phone');
            const errSubject = document.getElementById('error-contact-subject');
            const errMessage = document.getElementById('error-contact-message');

            let isValid = true;

            isValid = validateField(nameInp, errName, !nameInp.value.trim(), 'Full name is required.') && isValid;
            isValid = validateField(emailInp, errEmail, !emailInp.value.trim(), 'Email is required.') && isValid;
            isValid = validateField(phoneInp, errPhone, !phoneInp.value.trim(), 'Phone number is required.') && isValid;
            isValid = validateField(subjectInp, errSubject, !subjectInp.value.trim(), 'Subject is required.') && isValid;
            isValid = validateField(messageInp, errMessage, !messageInp.value.trim(), 'Message content is required.') && isValid;

            if (emailInp.value.trim() && !regexEmail.test(emailInp.value.trim())) {
                setError(emailInp, errEmail, 'Enter a valid email.');
                isValid = false;
            }
            if (phoneInp.value.trim() && !regexPhone.test(phoneInp.value.trim())) {
                setError(phoneInp, errPhone, 'Enter a valid phone.');
                isValid = false;
            }

            if (!isValid) return;

            // Success simulation: Toggle card visibility
            contactForm.classList.add('hidden');
            contactSuccessState.classList.remove('hidden');
        });
    }

    if (contactSuccessResetBtn) {
        contactSuccessResetBtn.addEventListener('click', () => {
            if (contactForm) {
                contactForm.reset();
                contactForm.classList.remove('hidden');
            }
            contactSuccessState.classList.add('hidden');
        });
    }

    // Auto-prefill contact fields if active session exists
    if (contactForm) {
        prefillFormWithSession(contactForm);
    }

    // Clear validation errors dynamically on typing
    const allFormControls = document.querySelectorAll('.form-control');
    allFormControls.forEach(ctrl => {
        ctrl.addEventListener('input', () => {
            ctrl.classList.remove('input-error');
            const parent = ctrl.closest('.form-group');
            if (parent) {
                const errSpan = parent.querySelector('.error-msg');
                if (errSpan) {
                    errSpan.innerText = '';
                    errSpan.style.display = 'none';
                }
            }
            // Clear Sign In global error
            const sigInGlobal = document.getElementById('signin-global-error');
            if (sigInGlobal) sigInGlobal.classList.add('hidden');
        });
    });


    /* --------------------------------------------------------------------------
       5. Client Testimonials Carousel
       -------------------------------------------------------------------------- */
    const slides = document.querySelectorAll('.testimonial-slide');
    const dots = document.querySelectorAll('.slider-dot');
    const prevBtn = document.getElementById('slide-prev');
    const nextBtn = document.getElementById('slide-next');
    
    let currentSlide = 0;
    let slideInterval;

    function showSlide(index) {
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));

        currentSlide = (index + slides.length) % slides.length;
        
        slides[currentSlide].classList.add('active');
        if (dots[currentSlide]) {
            dots[currentSlide].classList.add('active');
        }
    }

    function nextSlide() {
        showSlide(currentSlide + 1);
    }

    function prevSlide() {
        showSlide(currentSlide - 1);
    }

    function startAutoSlide() {
        clearInterval(slideInterval);
        slideInterval = setInterval(nextSlide, 5000); // 5 seconds rotate
    }

    if (nextBtn && prevBtn) {
        nextBtn.addEventListener('click', () => {
            nextSlide();
            startAutoSlide(); // reset timer on user manual interaction
        });

        prevBtn.addEventListener('click', () => {
            prevSlide();
            startAutoSlide();
        });
    }

    dots.forEach(dot => {
        dot.addEventListener('click', (e) => {
            const index = parseInt(e.target.getAttribute('data-slide'));
            showSlide(index);
            startAutoSlide();
        });
    });

    // Start auto carousel
    if (slides.length > 0) {
        startAutoSlide();
    }


    /* --------------------------------------------------------------------------
       6. FAQ Accordion Logic
       -------------------------------------------------------------------------- */
    const faqTriggers = document.querySelectorAll('.faq-trigger');

    faqTriggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
            const content = trigger.nextElementSibling;
            
            // Close other open accordions (exclusive option)
            faqTriggers.forEach(otherTrigger => {
                if (otherTrigger !== trigger) {
                    otherTrigger.setAttribute('aria-expanded', 'false');
                    const otherContent = otherTrigger.nextElementSibling;
                    otherContent.style.maxHeight = null;
                }
            });

            // Toggle target accordion state
            if (isExpanded) {
                trigger.setAttribute('aria-expanded', 'false');
                content.style.maxHeight = null;
            } else {
                trigger.setAttribute('aria-expanded', 'true');
                // Calculate precise height including padding
                content.style.maxHeight = content.scrollHeight + 'px';
            }
        });
    });


    /* --------------------------------------------------------------------------
       7. Scroll Reveal & Statistics Counter
       -------------------------------------------------------------------------- */
    
    // Intersection Observer for Reveal elements
    const revealElements = document.querySelectorAll('.scroll-reveal');
    
    if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    // Stop observing once animated into viewport
                    revealObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.15 // trigger when 15% of element is seen
        });

        revealElements.forEach(el => revealObserver.observe(el));
    } else {
        // Fallback for older browsers
        revealElements.forEach(el => el.classList.add('revealed'));
    }

    // Dynamic Counter Animation
    const statsSection = document.getElementById('stats-section');
    const statNumbers = document.querySelectorAll('.stat-number');
    let countersStarted = false;

    function startCounters() {
        statNumbers.forEach(stat => {
            const target = parseInt(stat.getAttribute('data-target'));
            const duration = 2000; // 2 seconds duration
            const increment = target / (duration / 16); // ~60fps
            let current = 0;

            function updateCounter() {
                current += increment;
                if (current >= target) {
                    stat.innerText = target + (target === 12 || target === 3 ? '' : '+');
                } else {
                    stat.innerText = Math.floor(current);
                    requestAnimationFrame(updateCounter);
                }
            }
            updateCounter();
        });
    }

    if ('IntersectionObserver' in window && statsSection) {
        const statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !countersStarted) {
                    startCounters();
                    countersStarted = true;
                    statsObserver.unobserve(statsSection);
                }
            });
        }, {
            threshold: 0.5
        });

        statsObserver.observe(statsSection);
    } else {
        // Fallback or run immediately if no observer support
        setTimeout(startCounters, 1000);
    }

});
