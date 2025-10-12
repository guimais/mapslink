// Login Pessoal - Funcionalidade JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Funcionalidade da Navbar Mobile
    initializeMobileNavbar();
    // Elementos do formulário
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const passwordToggle = document.getElementById('passwordToggle');
    const loginButton = document.getElementById('loginButton');
    const rememberMeCheckbox = document.getElementById('rememberMe');
    
    // Elementos de erro
    const emailError = document.getElementById('emailError');
    const passwordError = document.getElementById('passwordError');
    
    // Toggle de visibilidade da senha
    passwordToggle.addEventListener('click', function() {
        const isPasswordVisible = passwordInput.type === 'text';
        passwordInput.type = isPasswordVisible ? 'password' : 'text';
        
        const icon = this.querySelector('i');
        icon.className = isPasswordVisible ? 'ri-eye-line' : 'ri-eye-off-line';
        
        this.setAttribute('aria-label', isPasswordVisible ? 'Mostrar senha' : 'Ocultar senha');
    });
    
    // Validação em tempo real
    emailInput.addEventListener('input', function() {
        validateEmail();
    });
    
    passwordInput.addEventListener('input', function() {
        validatePassword();
    });
    
    // Validação de email
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
    
    // Validação de senha
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
    
    // Mostrar erro
    function showError(input, errorElement, message) {
        input.classList.add('error');
        errorElement.textContent = message;
        errorElement.classList.add('show');
    }
    
    // Ocultar erro
    function hideError(input, errorElement) {
        input.classList.remove('error');
        errorElement.classList.remove('show');
        errorElement.textContent = '';
    }
    
    // Limpar todos os erros
    function clearAllErrors() {
        hideError(emailInput, emailError);
        hideError(passwordInput, passwordError);
    }
    
    // Simular login (substitua pela lógica real)
    async function performLogin(email, password, rememberMe) {
        try {
            // Simular delay de rede
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Aqui você faria a chamada real para a API
            // const response = await fetch('/api/login', {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json',
            //     },
            //     body: JSON.stringify({ email, password })
            // });
            
            // Simulação de resposta da API
            const isValidUser = email === 'teste@exemplo.com' && password === '123456';
            
            if (isValidUser) {
                // Salvar dados se "Lembrar-me" estiver marcado
                if (rememberMe) {
                    localStorage.setItem('userEmail', email);
                    localStorage.setItem('rememberMe', 'true');
                } else {
                    localStorage.removeItem('userEmail');
                    localStorage.removeItem('rememberMe');
                }
                
                // Simular token de autenticação
                localStorage.setItem('authToken', 'simulated-token-' + Date.now());
                localStorage.setItem('userType', 'personal');
                
                // Redirecionar para página principal
                showSuccessMessage('Login realizado com sucesso!');
                setTimeout(() => {
                    window.location.href = 'perfilusuario.html'; // Substitua pela página de destino
                }, 1500);
                
            } else {
                throw new Error('E-mail ou senha incorretos');
            }
            
        } catch (error) {
            showErrorMessage(error.message || 'Erro ao fazer login. Tente novamente.');
        }
    }
    
    // Mostrar mensagem de sucesso
    function showSuccessMessage(message) {
        loginButton.innerHTML = `
            <i class="ri-check-line button-icon"></i>
            <span class="button-text">${message}</span>
        `;
        loginButton.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
        loginButton.disabled = true;
    }
    
    // Mostrar mensagem de erro
    function showErrorMessage(message) {
        loginButton.innerHTML = `
            <i class="ri-error-warning-line button-icon"></i>
            <span class="button-text">Erro</span>
        `;
        loginButton.style.background = 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)';
        loginButton.disabled = true;
        
        // Restaurar botão após 3 segundos
        setTimeout(() => {
            loginButton.innerHTML = `
                <span class="button-text">Entrar</span>
                <i class="ri-arrow-right-line button-icon"></i>
            `;
            loginButton.style.background = 'linear-gradient(135deg, var(--brand) 0%, var(--brand-2) 100%)';
            loginButton.disabled = false;
        }, 3000);
        
        // Mostrar erro geral
        alert(message);
    }
    
    // Restaurar botão de loading
    function showLoadingButton() {
        loginButton.innerHTML = `
            <div class="loading-spinner"></div>
            <span class="button-text">Entrando...</span>
        `;
        loginButton.disabled = true;
    }
    
    // Restaurar botão normal
    function restoreButton() {
        loginButton.innerHTML = `
            <span class="button-text">Entrar</span>
            <i class="ri-arrow-right-line button-icon"></i>
        `;
        loginButton.disabled = false;
    }
    
    // Submissão do formulário
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Limpar erros anteriores
        clearAllErrors();
        
        // Validar campos
        const isEmailValid = validateEmail();
        const isPasswordValid = validatePassword();
        
        if (!isEmailValid || !isPasswordValid) {
            return;
        }
        
        // Mostrar loading
        showLoadingButton();
        
        // Dados do formulário
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const rememberMe = rememberMeCheckbox.checked;
        
        // Executar login
        await performLogin(email, password, rememberMe);
    });
    
    // Restaurar dados salvos se "Lembrar-me" estava marcado
    function restoreSavedData() {
        const savedEmail = localStorage.getItem('userEmail');
        const rememberMe = localStorage.getItem('rememberMe');
        
        if (savedEmail && rememberMe === 'true') {
            emailInput.value = savedEmail;
            rememberMeCheckbox.checked = true;
        }
    }
    
    // Carregar dados salvos ao inicializar
    restoreSavedData();
    
    // Adicionar estilo para loading spinner
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
    
    // Focar no campo de email ao carregar (apenas em desktop)
    if (window.innerWidth > 768) {
        emailInput.focus();
    }
    
    // Prevenir zoom no iOS ao focar em inputs
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

// Funcionalidade adicional para links e mobile
document.addEventListener('DOMContentLoaded', function() {
    // Link para cadastro
    const registerLink = document.querySelector('.register-link');
    if (registerLink) {
        registerLink.addEventListener('click', function(e) {
            e.preventDefault();
            showMobileAlert('Redirecionando para página de cadastro...');
            // window.location.href = 'cadastro.html';
        });
    }
    
    // Link para esqueci senha
    const forgotPasswordLink = document.querySelector('.forgot-password');
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', function(e) {
            e.preventDefault();
            showMobileAlert('Redirecionando para recuperação de senha...');
            // window.location.href = 'recuperar-senha.html';
        });
    }
    
    // Link para login empresarial
    const businessLoginLink = document.querySelector('.business-login-link');
    if (businessLoginLink) {
        businessLoginLink.addEventListener('click', function(e) {
            e.preventDefault();
            showMobileAlert('Redirecionando para login empresarial...');
            // window.location.href = 'loginempresarial.html';
        });
    }
    
    // Função para mostrar alertas mobile-friendly
    function showMobileAlert(message) {
        if (window.innerWidth <= 768) {
            // Criar toast mobile-friendly
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
            
            // Animar entrada
            setTimeout(() => {
                toast.style.transform = 'translateY(0)';
                toast.style.opacity = '1';
            }, 100);
            
            // Remover após 3 segundos
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
    
    // Melhorar feedback tátil em dispositivos móveis
    if ('ontouchstart' in window) {
        const touchElements = document.querySelectorAll('.login-button, .password-toggle, .checkbox-container, .forgot-password, .business-login-link');
        
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
    
    // Detectar orientação e ajustar layout
    function handleOrientationChange() {
        if (window.innerWidth <= 768) {
            const loginCard = document.querySelector('.login-card');
            if (loginCard) {
                // Ajustar padding baseado na orientação
                if (window.innerHeight < window.innerWidth) {
                    loginCard.style.padding = '20px 24px';
                } else {
                    loginCard.style.padding = '28px 20px';
                }
            }
        }
    }
    
    // Executar na mudança de orientação
    window.addEventListener('orientationchange', function() {
        setTimeout(handleOrientationChange, 100);
    });
    
    // Executar no resize
    window.addEventListener('resize', handleOrientationChange);
    
    // Melhorar scroll em mobile
    if (window.innerWidth <= 768) {
        document.body.style.overflowX = 'hidden';
        
        // Prevenir scroll durante interação com formulário
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
    
    // Adicionar haptic feedback se disponível
    function addHapticFeedback() {
        const buttons = document.querySelectorAll('.login-button, .password-toggle');
        buttons.forEach(button => {
            button.addEventListener('click', function() {
                if ('vibrate' in navigator) {
                    navigator.vibrate(50); // Vibração suave
                }
            });
        });
    }
    
    // Executar se for dispositivo móvel
    if (window.innerWidth <= 768) {
        addHapticFeedback();
    }
});

// Função para inicializar navbar mobile
function initializeMobileNavbar() {
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    const navOverlay = document.createElement('div');
    const body = document.body;
    
    // Adicionar overlay se não existir
    if (!document.querySelector('.nav-overlay')) {
        navOverlay.className = 'nav-overlay';
        body.appendChild(navOverlay);
    }
    
    // Função para abrir/fechar menu
    function toggleMenu() {
        const isOpen = navLinks.classList.contains('active');
        
        if (isOpen) {
            closeMenu();
        } else {
            openMenu();
        }
    }
    
    // Função para abrir menu
    function openMenu() {
        navLinks.classList.add('active');
        navOverlay.classList.add('active');
        body.style.overflow = 'hidden';
        
        // Animação do ícone hambúrguer
        const icon = navToggle.querySelector('i');
        if (icon) {
            icon.className = 'ri-close-line';
        }
        
        // Haptic feedback
        if ('vibrate' in navigator) {
            navigator.vibrate(30);
        }
    }
    
    // Função para fechar menu
    function closeMenu() {
        navLinks.classList.remove('active');
        navOverlay.classList.remove('active');
        body.style.overflow = '';
        
        // Restaurar ícone hambúrguer
        const icon = navToggle.querySelector('i');
        if (icon) {
            icon.className = 'ri-menu-line';
        }
    }
    
    // Event listeners
    if (navToggle) {
        navToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            toggleMenu();
        });
    }
    
    // Fechar menu ao clicar no overlay
    if (navOverlay) {
        navOverlay.addEventListener('click', closeMenu);
    }
    
    // Fechar menu ao clicar em um link
    const navLinkItems = document.querySelectorAll('.nav-link');
    navLinkItems.forEach(link => {
        link.addEventListener('click', function() {
            setTimeout(closeMenu, 100); // Pequeno delay para ver a animação
        });
    });
    
    // Fechar menu ao pressionar ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && navLinks.classList.contains('active')) {
            closeMenu();
        }
    });
    
    // Fechar menu ao redimensionar para desktop
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            closeMenu();
        }
    });
    
    // Melhorar acessibilidade
    if (navToggle) {
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.setAttribute('aria-controls', 'navMenu');
        
        navToggle.addEventListener('click', function() {
            const isOpen = navLinks.classList.contains('active');
            this.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });
    }
    
    // Smooth scroll para links âncora (se houver)
    navLinkItems.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
    
    // Adicionar efeito de toque nos links mobile
    if (window.innerWidth <= 768) {
        navLinkItems.forEach(link => {
            link.addEventListener('touchstart', function() {
                this.style.transform = 'scale(0.98)';
                this.style.transition = 'transform 0.1s ease';
            });
            
            link.addEventListener('touchend', function() {
                this.style.transform = 'scale(1)';
            });
            
            link.addEventListener('touchcancel', function() {
                this.style.transform = 'scale(1)';
            });
        });
    }
}