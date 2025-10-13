document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const passwordToggle = document.getElementById('passwordToggle');
    const loginButton = document.getElementById('loginButton');
    const rememberMeCheckbox = document.getElementById('rememberMe');
    
    const emailError = document.getElementById('emailError');
    const passwordError = document.getElementById('passwordError');
    
    passwordToggle.addEventListener('click', function() {
        const isPasswordVisible = passwordInput.type === 'text';
        passwordInput.type = isPasswordVisible ? 'password' : 'text';
        
        const icon = this.querySelector('i');
        icon.className = isPasswordVisible ? 'ri-eye-line' : 'ri-eye-off-line';
        
        this.setAttribute('aria-label', isPasswordVisible ? 'Mostrar senha' : 'Ocultar senha');
    });
    
    emailInput.addEventListener('input', function() {
        validateEmail();
    });
    
    passwordInput.addEventListener('input', function() {
        validatePassword();
    });
    
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
    
    function validatePassword() {
        const password = passwordInput.value;
        
        if (password === '') {
            showError(passwordInput, passwordError, 'Senha é obrigatória');
            return false;
        } else if (password.length < 8) {
            showError(passwordInput, passwordError, 'A senha deve ter pelo menos 8 caracteres');
            return false;
        } else {
            hideError(passwordInput, passwordError);
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
        hideError(emailInput, emailError);
        hideError(passwordInput, passwordError);
    }
    
    async function performLogin(email, password, rememberMe) {
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            
            const isValidUser = email === 'teste@exemplo.com' && password === '123456';
            
            if (isValidUser) {
                if (rememberMe) {
                    localStorage.setItem('userEmail', email);
                    localStorage.setItem('rememberMe', 'true');
                } else {
                    localStorage.removeItem('userEmail');
                    localStorage.removeItem('rememberMe');
                }
                
                localStorage.setItem('authToken', 'simulated-token-' + Date.now());
                localStorage.setItem('userType', 'personal');
                
                showSuccessMessage('Login realizado com sucesso!');
                setTimeout(() => {
                    window.location.href = 'perfilusuario.html';
                }, 1500);
                
            } else {
                throw new Error('E-mail ou senha incorretos');
            }
            
        } catch (error) {
            showErrorMessage(error.message || 'Erro ao fazer login. Tente novamente.');
        }
    }
    
    function showSuccessMessage(message) {
        loginButton.innerHTML = `
            <i class="ri-check-line button-icon"></i>
            <span class="button-text">${message}</span>
        `;
        loginButton.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
        loginButton.disabled = true;
    }
    
    function showErrorMessage(message) {
        loginButton.innerHTML = `
            <i class="ri-error-warning-line button-icon"></i>
            <span class="button-text">Erro</span>
        `;
        loginButton.style.background = 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)';
        loginButton.disabled = true;
        
        setTimeout(() => {
            loginButton.innerHTML = `
                <span class="button-text">Entrar</span>
                <i class="ri-arrow-right-line button-icon"></i>
            `;
            loginButton.style.background = 'linear-gradient(135deg, var(--brand) 0%, var(--brand-2) 100%)';
            loginButton.disabled = false;
        }, 3000);
        
        alert(message);
    }
    
    function showLoadingButton() {
        loginButton.innerHTML = `
            <div class="loading-spinner"></div>
            <span class="button-text">Entrando...</span>
        `;
        loginButton.disabled = true;
    }
    
    function restoreButton() {
        loginButton.innerHTML = `
            <span class="button-text">Entrar</span>
            <i class="ri-arrow-right-line button-icon"></i>
        `;
        loginButton.disabled = false;
    }
    
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        clearAllErrors();
        
        const isEmailValid = validateEmail();
        const isPasswordValid = validatePassword();
        
        if (!isEmailValid || !isPasswordValid) {
            return;
        }
        
        showLoadingButton();
        
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const rememberMe = rememberMeCheckbox.checked;
        
        await performLogin(email, password, rememberMe);
    });
    
    function restoreSavedData() {
        const savedEmail = localStorage.getItem('userEmail');
        const rememberMe = localStorage.getItem('rememberMe');
        
        if (savedEmail && rememberMe === 'true') {
            emailInput.value = savedEmail;
            rememberMeCheckbox.checked = true;
        }
    }
    
    restoreSavedData();
    
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
        emailInput.focus();
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
    const registerLink = document.querySelector('.register-link');
    if (registerLink) {
        registerLink.addEventListener('click', function(e) {
            e.preventDefault();
            navigateWithFeedback('registropessoal.html', 'Redirecionando para pagina de cadastro...');
        });
    }
    
    const forgotPasswordLink = document.querySelector('.forgot-password');
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', function(e) {
            e.preventDefault();
            navigateWithFeedback('esqueceusenha.html', 'Redirecionando para recuperacao de senha...');
        });
    }
    
    const businessLoginLink = document.querySelector('.business-login-link');
    if (businessLoginLink) {
        businessLoginLink.addEventListener('click', function(e) {
            e.preventDefault();
            navigateWithFeedback('loginempresa.html', 'Redirecionando para login empresarial...');
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
        }
    }
    if ('ontouchstart' in window) {
        const touchElements = document.querySelectorAll('.login-button, .password-toggle, .checkbox-container, .forgot-password, .business-login-link, .register-link');
        
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
            const loginCard = document.querySelector('.login-card');
            if (loginCard) {
                if (window.innerHeight < window.innerWidth) {
                    loginCard.style.padding = '20px 24px';
                } else {
                    loginCard.style.padding = '28px 20px';
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
        const buttons = document.querySelectorAll('.login-button, .password-toggle');
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


