document.addEventListener('DOMContentLoaded', () => {
    console.log('Script initialized...');

    // LINDUNGI: Elemen Login
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        const togglePasswordBtn = document.getElementById('toggle-password');
        const passwordInput = document.getElementById('password');
        const errorAlert = document.getElementById('error-alert');
        const errorMessage = document.getElementById('error-message');
        const submitBtn = loginForm.querySelector('.submit-btn');
        const btnText = submitBtn ? submitBtn.querySelector('span') : null;

        // Toggle Password Visibility
        if (togglePasswordBtn && passwordInput) {
            togglePasswordBtn.addEventListener('click', () => {
                const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
                passwordInput.setAttribute('type', type);
                const icon = togglePasswordBtn.querySelector('i');
                if (icon) {
                    icon.className = type === 'text' ? 'ph ph-eye-slash' : 'ph ph-eye';
                }
            });
        }

        // Handle Form Submission
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            e.stopPropagation();

            const username = document.getElementById('username')?.value.trim();
            const password = document.getElementById('password')?.value.trim();

            if (!username || !password) return;

            // Reset UI
            if (errorAlert) errorAlert.classList.add('hidden');
            if (submitBtn) submitBtn.disabled = true;
            let originalBtnText = '';
            if (btnText) {
                originalBtnText = btnText.textContent;
                btnText.textContent = 'Memuat...';
            }

            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });

                const data = await response.json();

                if (data.success) {
                    const token = data.token || (data.data && data.data.token);
                    localStorage.setItem('token', token);
                    window.location.href = '/dashboard.html';
                } else {
                    if (errorMessage) errorMessage.textContent = data.message || 'Login gagal.';
                    if (errorAlert) errorAlert.classList.remove('hidden');
                }
            } catch (error) {
                console.error('Fetch error:', error);
                if (errorMessage) errorMessage.textContent = 'Gagal menghubungi server.';
                if (errorAlert) errorAlert.classList.remove('hidden');
            } finally {
                if (submitBtn) submitBtn.disabled = false;
                if (btnText) btnText.textContent = originalBtnText;
            }
        });
    }

    // LINDUNGI: Slideshow
    const slides = document.querySelectorAll('.slide');
    if (slides.length > 0) {
        let currentSlide = 0;
        setInterval(() => {
            slides[currentSlide].classList.remove('active');
            currentSlide = (currentSlide + 1) % slides.length;
            slides[currentSlide].classList.add('active');
        }, 3000);
    }
});

// Add shake animation to styles dynamically or in css (adding here for completeness if missed in css)
const styleSheet = document.createElement("style");
styleSheet.innerText = `
@keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
    20%, 40%, 60%, 80% { transform: translateX(5px); }
}
`;
document.head.appendChild(styleSheet);


// Sidebar Toggle Logic for Mobile
document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    const body = document.body;

    // Create overlay if not exists
    let overlay = document.querySelector('.sidebar-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        body.appendChild(overlay);
    }

    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent immediate close
            sidebar.classList.toggle('open');
            overlay.classList.toggle('show');
        });

        // Close when clicking overlay
        overlay.addEventListener('click', () => {
            sidebar.classList.remove('open');
            overlay.classList.remove('show');
        });

        // Close when clicking a link (optional, good for UX)
        const navLinks = sidebar.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    sidebar.classList.remove('open');
                    overlay.classList.remove('show');
                }
            });
        });
    }
});
