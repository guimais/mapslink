document.addEventListener('DOMContentLoaded', function() {
    initializeMobileNavbar();
    
    const registerForm = document.getElementById('registerForm');
    const firstNameInput = document.getElementById('firstName');
    const lastNameInput = document.getElementById('lastName');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const birthDateInput = document.getElementById('birthDate');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const passwordToggle = document.getElementById('passwordToggle');
    const confirmPasswordToggle = document.getElementById('confirmPasswordToggle');
    const registerButton = document.getElementById('registerButton');
    const agreeTermsCheckbox = document.getElementById('agreeTerms');
    const agreeMarketingCheckbox = document.getElementById('agreeMarketing');
    
    const firstNameError = document.getElementById('firstNameError');
    const lastNameError = document.getElementById('lastNameError');
    const emailError = document.getElementById('emailError');
    const phoneError = document.getElementById('phoneError');
    const birthDateError = document.getElementById('birthDateError');
    const passwordError = document.getElementById('passwordError');
    const confirmPasswordError = document.getElementById('confirmPasswordError');
    const termsError = document.getElementById('termsError');
    
    const strengthFill = document.getElementById('strengthFill');
    const strengthText = document.getElementById('strengthText');
    
    passwordToggle.addEventListener('click', function() {
        const isPasswordHidden = passwordInput.type === 'password';
        
        if (isPasswordHidden) {
            passwordInput.type = 'text';
            const icon = this.querySelector('i');
            icon.className = 'ri-eye-off-line';
            this.setAttribute('aria-label', 'Ocultar senha');
        } else {
            passwordInput.type = 'password';
            const icon = this.querySelector('i');
            icon.className = 'ri-eye-line';
            this.setAttribute('aria-label', 'Mostrar senha');
        }
    });
    
    confirmPasswordToggle.addEventListener('click', function() {
        const isPasswordHidden = confirmPasswordInput.type === 'password';
        
        if (isPasswordHidden) {
            confirmPasswordInput.type = 'text';
            const icon = this.querySelector('i');
            icon.className = 'ri-eye-off-line';
            this.setAttribute('aria-label', 'Ocultar senha');
        } else {
            confirmPasswordInput.type = 'password';
            const icon = this.querySelector('i');
            icon.className = 'ri-eye-line';
            this.setAttribute('aria-label', 'Mostrar senha');
        }
    });
    
    firstNameInput.addEventListener('input', function() {
        validateFirstName();
    });
    
    lastNameInput.addEventListener('input', function() {
        validateLastName();
    });
    
    emailInput.addEventListener('input', function() {
        validateEmail();
    });
    
    phoneInput.addEventListener('input', function() {
        formatPhoneNumber();
        validatePhone();
    });
    
    birthDateInput.addEventListener('change', function() {
        validateBirthDate();
    });
    
    passwordInput.addEventListener('input', function() {
        validatePassword();
        checkPasswordStrength();
    });
    
    confirmPasswordInput.addEventListener('input', function() {
        validateConfirmPassword();
    });
    
    agreeTermsCheckbox.addEventListener('change', function() {
        validateTerms();
    });
    
    function validateFirstName() {
        const firstName = firstNameInput.value.trim();
        
        if (firstName === '') {
            showError(firstNameInput, firstNameError, 'Nome é obrigatório');
            return false;
        } else if (firstName.length < 2) {
            showError(firstNameInput, firstNameError, 'Nome deve ter pelo menos 2 caracteres');
            return false;
        } else if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(firstName)) {
            showError(firstNameInput, firstNameError, 'Nome deve conter apenas letras');
            return false;
        } else {
            hideError(firstNameInput, firstNameError);
            return true;
        }
    }
    
    function validateLastName() {
        const lastName = lastNameInput.value.trim();
        
        if (lastName === '') {
            showError(lastNameInput, lastNameError, 'Sobrenome é obrigatório');
            return false;
        } else if (lastName.length < 2) {
            showError(lastNameInput, lastNameError, 'Sobrenome deve ter pelo menos 2 caracteres');
            return false;
        } else if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(lastName)) {
            showError(lastNameInput, lastNameError, 'Sobrenome deve conter apenas letras');
            return false;
        } else {
            hideError(lastNameInput, lastNameError);
            return true;
        }
    }
    
    function validateEmail() {
        const email = emailInput.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (email === '') {
            showError(emailInput, emailError, 'E-mail é obrigatório');
            return false;
        } else if (!emailRegex.test(email)) {
            showError(emailInput, emailError, 'Por favor, insira um e-mail válido');
            return false;
        } else {
            hideError(emailInput, emailError);
            return true;
        }
    }
    
    function formatPhoneNumber() {
        let phone = phoneInput.value.replace(/\D/g, '');
        
        if (phone.length >= 11) {
            phone = phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        } else if (phone.length >= 7) {
            phone = phone.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
        } else if (phone.length >= 3) {
            phone = phone.replace(/(\d{2})(\d{0,5})/, '($1) $2');
        } else if (phone.length >= 1) {
            phone = phone.replace(/(\d{0,2})/, '($1');
        }
        
        phoneInput.value = phone;
    }
    
    function validatePhone() {
        const phone = phoneInput.value.replace(/\D/g, '');
        
        if (phone === '') {
            showError(phoneInput, phoneError, 'Telefone é obrigatório');
            return false;
        } else if (phone.length < 10) {
            showError(phoneInput, phoneError, 'Telefone deve ter pelo menos 10 dígitos');
            return false;
        } else if (phone.length > 11) {
            showError(phoneInput, phoneError, 'Telefone deve ter no máximo 11 dígitos');
            return false;
        } else {
            hideError(phoneInput, phoneError);
            return true;
        }
    }
    
    function validateBirthDate() {
        const birthDate = birthDateInput.value;
        
        if (birthDate === '') {
            showError(birthDateInput, birthDateError, 'Data de nascimento é obrigatória');
            return false;
        }
        
        const today = new Date();
        const birth = new Date(birthDate);
        const age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        
        if (age < 14) {
            showError(birthDateInput, birthDateError, 'Você deve ter pelo menos 14 anos');
            return false;
        } else if (age > 120) {
            showError(birthDateInput, birthDateError, 'Data de nascimento inválida');
            return false;
        } else {
            hideError(birthDateInput, birthDateError);
            return true;
        }
    }
    
    function checkPasswordStrength() {
        const password = passwordInput.value;
        let strength = 0;
        let strengthLabel = '';
        let strengthClass = '';
        
        if (password.length >= 8) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;
        
        if (password === '') {
            strengthLabel = 'Digite uma senha';
            strengthClass = '';
        } else if (strength <= 2) {
            strengthLabel = 'Fraca';
            strengthClass = 'weak';
        } else if (strength <= 3) {
            strengthLabel = 'Média';
            strengthClass = 'medium';
        } else {
            strengthLabel = 'Forte';
            strengthClass = 'strong';
        }
        
        strengthFill.className = `strength-fill ${strengthClass}`;
        strengthText.className = `strength-text ${strengthClass}`;
        strengthText.textContent = strengthLabel;
    }
    
    function validatePassword() {
        const password = passwordInput.value;
        
        if (password === '') {
            showError(passwordInput, passwordError, 'Senha é obrigatória');
            return false;
        } else if (password.length < 8) {
            showError(passwordInput, passwordError, 'A senha deve ter pelo menos 8 caracteres');
            return false;
        } else if (!/(?=.*[a-z])/.test(password)) {
            showError(passwordInput, passwordError, 'A senha deve conter pelo menos uma letra minúscula');
            return false;
        } else if (!/(?=.*[A-Z])/.test(password)) {
            showError(passwordInput, passwordError, 'A senha deve conter pelo menos uma letra maiúscula');
            return false;
        } else if (!/(?=.*\d)/.test(password)) {
            showError(passwordInput, passwordError, 'A senha deve conter pelo menos um número');
            return false;
        } else {
            hideError(passwordInput, passwordError);
            return true;
        }
    }
    
    function validateConfirmPassword() {
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        
        if (confirmPassword === '') {
            showError(confirmPasswordInput, confirmPasswordError, 'Confirmação de senha é obrigatória');
            return false;
        } else if (password !== confirmPassword) {
            showError(confirmPasswordInput, confirmPasswordError, 'As senhas não coincidem');
            return false;
        } else {
            hideError(confirmPasswordInput, confirmPasswordError);
            return true;
        }
    }
    
    function validateTerms() {
        if (!agreeTermsCheckbox.checked) {
            showError(agreeTermsCheckbox, termsError, 'Você deve aceitar os termos de uso');
            return false;
        } else {
            hideError(agreeTermsCheckbox, termsError);
            return true;
        }
    }
    
    function showError(input, errorElement, message) {
        input.classList.add('error');
        errorElement.textContent = message;
        errorElement.classList.add('show');
    }
    
    function hideError(input, errorElement) {
        input.classList.remove('error');
        errorElement.classList.remove('show');
        errorElement.textContent = '';
    }
    
    function clearAllErrors() {
        hideError(firstNameInput, firstNameError);
        hideError(lastNameInput, lastNameError);
        hideError(emailInput, emailError);
        hideError(phoneInput, phoneError);
        hideError(birthDateInput, birthDateError);
        hideError(passwordInput, passwordError);
        hideError(confirmPasswordInput, confirmPasswordError);
        hideError(agreeTermsCheckbox, termsError);
    }
    
    async function performRegister(formData) {
        try {
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            
            const isEmailAvailable = formData.email !== 'teste@exemplo.com';
            
            if (isEmailAvailable) {
                localStorage.setItem('authToken', 'simulated-token-' + Date.now());
                localStorage.setItem('userType', 'personal');
                localStorage.setItem('userEmail', formData.email);
                localStorage.setItem('userName', `${formData.firstName} ${formData.lastName}`);
                
                showSuccessMessage('Conta criada com sucesso!');
                setTimeout(() => {
                    window.location.href = 'paginainicial.html';
                }, 2000);
                
            } else {
                throw new Error('Este e-mail já está em uso');
            }
            
        } catch (error) {
            showErrorMessage(error.message || 'Erro ao criar conta. Tente novamente.');
        }
    }
    
    function showSuccessMessage(message) {
        registerButton.innerHTML = `
            <i class="ri-check-line button-icon"></i>
            <span class="button-text">${message}</span>
        `;
        registerButton.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
        registerButton.disabled = true;
    }
    
    function showErrorMessage(message) {
        registerButton.innerHTML = `
            <i class="ri-error-warning-line button-icon"></i>
            <span class="button-text">Erro</span>
        `;
        registerButton.style.background = 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)';
        registerButton.disabled = true;
        
        setTimeout(() => {
            registerButton.innerHTML = `
                <span class="button-text">Criar Conta</span>
                <i class="ri-arrow-right-line button-icon"></i>
            `;
            registerButton.style.background = 'linear-gradient(135deg, var(--brand) 0%, var(--brand-2) 100%)';
            registerButton.disabled = false;
        }, 3000);
        
        alert(message);
    }
    
    function showLoadingButton() {
        registerButton.innerHTML = `
            <div class="loading-spinner"></div>
            <span class="button-text">Criando conta...</span>
        `;
        registerButton.disabled = true;
    }
    
    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        clearAllErrors();
        
        const isFirstNameValid = validateFirstName();
        const isLastNameValid = validateLastName();
        const isEmailValid = validateEmail();
        const isPhoneValid = validatePhone();
        const isBirthDateValid = validateBirthDate();
        const isPasswordValid = validatePassword();
        const isConfirmPasswordValid = validateConfirmPassword();
        const isTermsValid = validateTerms();
        
        if (!isFirstNameValid || !isLastNameValid || !isEmailValid || 
            !isPhoneValid || !isBirthDateValid || !isPasswordValid || 
            !isConfirmPasswordValid || !isTermsValid) {
            return;
        }
        
        showLoadingButton();
        
        const formData = {
            firstName: firstNameInput.value.trim(),
            lastName: lastNameInput.value.trim(),
            email: emailInput.value.trim(),
            phone: phoneInput.value.replace(/\D/g, ''),
            birthDate: birthDateInput.value,
            password: passwordInput.value,
            agreeMarketing: agreeMarketingCheckbox.checked
        };
        
        await performRegister(formData);
    });
    
    const style = document.createElement('style');
    style.textContent = `
        .loading-spinner {
            width: 20px;
            height: 20px;
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-top: 2px solid white;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
    
    if (window.innerWidth > 768) {
        firstNameInput.focus();
    }
    
    if (window.innerWidth <= 768) {
        const inputs = document.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('focus', function() {
                if (window.innerWidth <= 768) {
                    const viewport = document.querySelector('meta[name="viewport"]');
                    if (viewport) {
                        viewport.content = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no';
                    }
                }
            });
            
            input.addEventListener('blur', function() {
                setTimeout(() => {
                    const viewport = document.querySelector('meta[name="viewport"]');
                    if (viewport) {
                        viewport.content = 'width=device-width, initial-scale=1';
                    }
                }, 300);
            });
        });
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const loginLink = document.querySelector('.login-link');
    if (loginLink) {
        loginLink.addEventListener('click', function(e) {
            e.preventDefault();
            navigateWithFeedback('loginpessoal.html', 'Redirecionando para login pessoal...');
        });
    }
    
    const termsLinks = document.querySelectorAll('.terms-link');
    termsLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            showMobileAlert('Abrindo termos de uso...');
        });
    });
    
    const businessRegisterLink = document.querySelector('.business-register-link');
    if (businessRegisterLink) {
        businessRegisterLink.addEventListener('click', function(e) {
            e.preventDefault();
            navigateWithFeedback('registroempresa.html', 'Redirecionando para registro empresarial...');
        });
    }
    
    function navigateWithFeedback(url, message) {
        if (window.innerWidth <= 768) {
            showMobileAlert(message);
            setTimeout(() => {
                window.location.href = url;
            }, 800);
        } else {
            window.location.href = url;
        }
    }
    
    function showMobileAlert(message) {
        if (window.innerWidth <= 768) {
            const toast = document.createElement('div');
            toast.style.cssText = `
                position: fixed;
                bottom: 20px;
                left: 20px;
                right: 20px;
                background: var(--brand);
                color: white;
                padding: 16px;
                border-radius: 12px;
                font-size: 14px;
                font-weight: 500;
                text-align: center;
                z-index: 10000;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
                transform: translateY(100px);
                opacity: 0;
                transition: all 0.3s ease;
            `;
            toast.textContent = message;
            document.body.appendChild(toast);
            
            setTimeout(() => {
                toast.style.transform = 'translateY(0)';
                toast.style.opacity = '1';
            }, 100);
            
            setTimeout(() => {
                toast.style.transform = 'translateY(100px)';
                toast.style.opacity = '0';
                setTimeout(() => {
                    document.body.removeChild(toast);
                }, 300);
            }, 3000);
        } else {
            alert(message);
        }
    }

    if ('ontouchstart' in window) {
        const touchElements = document.querySelectorAll('.register-button, .password-toggle, .checkbox-container, .business-register-link, .login-link');
        
        touchElements.forEach(element => {
            element.addEventListener('touchstart', function() {
                this.style.transform = 'scale(0.95)';
                this.style.transition = 'transform 0.1s ease';
            });
            
            element.addEventListener('touchend', function() {
                this.style.transform = 'scale(1)';
            });
            
            element.addEventListener('touchcancel', function() {
                this.style.transform = 'scale(1)';
            });
        });
    }
    
    function handleOrientationChange() {
        if (window.innerWidth <= 768) {
            const registerCard = document.querySelector('.register-card');
            if (registerCard) {
                if (window.innerHeight < window.innerWidth) {
                    registerCard.style.padding = '20px 24px';
                } else {
                    registerCard.style.padding = '28px 20px';
                }
            }
        }
    }
    
    window.addEventListener('orientationchange', function() {
        setTimeout(handleOrientationChange, 100);
    });
    
    window.addEventListener('resize', handleOrientationChange);
    
    if (window.innerWidth <= 768) {
        document.body.style.overflowX = 'hidden';
        
        const inputs = document.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('focus', function() {
                setTimeout(() => {
                    this.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'center',
                        inline: 'nearest'
                    });
                }, 300);
            });
        });
    }
    
    function addHapticFeedback() {
        const buttons = document.querySelectorAll('.register-button, .password-toggle');
        buttons.forEach(button => {
            button.addEventListener('click', function() {
                if ('vibrate' in navigator) {
                    navigator.vibrate(50);
                }
            });
        });
    }
    
    if (window.innerWidth <= 768) {
        addHapticFeedback();
    }
});

function initializeMobileNavbar() {
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    const navOverlay = document.createElement('div');
    const body = document.body;
    
    if (!document.querySelector('.nav-overlay')) {
        navOverlay.className = 'nav-overlay';
        body.appendChild(navOverlay);
    }
    
    function toggleMenu() {
        const isOpen = navLinks.classList.contains('active');
        
        if (isOpen) {
            closeMenu();
        } else {
            openMenu();
        }
    }
    
    function openMenu() {
        navLinks.classList.add('active');
        navOverlay.classList.add('active');
        body.style.overflow = 'hidden';
        
        const icon = navToggle.querySelector('i');
        if (icon) {
            icon.className = 'ri-close-line';
        }
        
        if ('vibrate' in navigator) {
            navigator.vibrate(30);
        }
    }
    
    function closeMenu() {
        navLinks.classList.remove('active');
        navOverlay.classList.remove('active');
        body.style.overflow = '';
        
        const icon = navToggle.querySelector('i');
        if (icon) {
            icon.className = 'ri-menu-line';
        }
    }
    
    if (navToggle) {
        navToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            toggleMenu();
        });
    }
    
    if (navOverlay) {
        navOverlay.addEventListener('click', closeMenu);
    }
    
    const navLinkItems = document.querySelectorAll('.nav-link');
    navLinkItems.forEach(link => {
        link.addEventListener('click', function() {
            setTimeout(closeMenu, 100);
        });
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && navLinks.classList.contains('active')) {
            closeMenu();
        }
    });
    
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            closeMenu();
        }
    });
    
    if (navToggle) {
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.setAttribute('aria-controls', 'navMenu');
        
        navToggle.addEventListener('click', function() {
            const isOpen = navLinks.classList.contains('active');
            this.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });
    }
}


