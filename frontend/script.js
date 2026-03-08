document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const togglePasswordBtn = document.getElementById('toggle-password');
    const passwordInput = document.getElementById('password');
    const errorAlert = document.getElementById('error-alert');
    const errorMessage = document.getElementById('error-message');
    const submitBtn = loginForm.querySelector('.submit-btn');
    const btnText = submitBtn.querySelector('span');

    // Toggle Password Visibility
    togglePasswordBtn.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);

        // Toggle icon
        const icon = togglePasswordBtn.querySelector('i');
        if (type === 'text') {
            icon.classList.remove('ph-eye');
            icon.classList.add('ph-eye-slash');
        } else {
            icon.classList.remove('ph-eye-slash');
            icon.classList.add('ph-eye');
        }
    });

    // Handle Form Submission
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        console.log('Sending login:', { username, password });

        // Reset UI
        errorAlert.classList.add('hidden');
        submitBtn.disabled = true;
        const originalBtnText = btnText.textContent;
        btnText.textContent = 'Memuat...';

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (data.success) {
                // Success - Redirect
                const token = (data.data && data.data.token) ? data.data.token : data.token;
                localStorage.setItem('token', token);
                window.location.href = '/dashboard.html';
            } else {
                // Show Error
                errorMessage.textContent = data.message || 'Terjadi kesalahan saat masuk.';
                errorAlert.classList.remove('hidden');
                // Shake animation
                const card = document.querySelector('.login-card');
                card.style.animation = 'none';
                card.offsetHeight; /* trigger reflow */
                card.style.animation = 'shake 0.4s';
            }
        } catch (error) {
            console.error('Error:', error);
            errorMessage.textContent = 'Gagal menghubungi server. Periksa koneksi Anda.';
            errorAlert.classList.remove('hidden');
        } finally {
            submitBtn.disabled = false;
            btnText.textContent = originalBtnText;
        }
    });

    /* Background Slideshow */
    const slides = document.querySelectorAll('.slide');
    let currentSlide = 0;

    if (slides.length > 0) {
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
