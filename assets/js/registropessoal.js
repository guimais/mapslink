// Registro Pessoal - Funcionalidade JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Funcionalidade da Navbar Mobile
    initializeMobileNavbar();
    
    // Elementos do formulário
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
    
    // Elementos de erro
    const firstNameError = document.getElementById('firstNameError');
    const lastNameError = document.getElementById('lastNameError');
    const emailError = document.getElementById('emailError');
    const phoneError = document.getElementById('phoneError');
    const birthDateError = document.getElementById('birthDateError');
    const passwordError = document.getElementById('passwordError');
    const confirmPasswordError = document.getElementById('confirmPasswordError');
    const termsError = document.getElementById('termsError');
    
    // Elementos de força da senha
    const strengthFill = document.getElementById('strengthFill');
    const strengthText = document.getElementById('strengthText');
    
    // Toggle de visibilidade da senha
    passwordToggle.addEventListener('click', function() {
        const isPasswordHidden = passwordInput.type === 'password';
        
        if (isPasswordHidden) {
            // Senha está oculta, vamos mostrar
            passwordInput.type = 'text';
            const icon = this.querySelector('i');
            icon.className = 'ri-eye-off-line';
            this.setAttribute('aria-label', 'Ocultar senha');
        } else {
            // Senha está visível, vamos ocultar
            passwordInput.type = 'password';
            const icon = this.querySelector('i');
            icon.className = 'ri-eye-line';
            this.setAttribute('aria-label', 'Mostrar senha');
        }
    });
    
    confirmPasswordToggle.addEventListener('click', function() {
        const isPasswordHidden = confirmPasswordInput.type === 'password';
        
        if (isPasswordHidden) {
            // Senha está oculta, vamos mostrar
            confirmPasswordInput.type = 'text';
            const icon = this.querySelector('i');
            icon.className = 'ri-eye-off-line';
            this.setAttribute('aria-label', 'Ocultar senha');
        } else {
            // Senha está visível, vamos ocultar
            confirmPasswordInput.type = 'password';
            const icon = this.querySelector('i');
            icon.className = 'ri-eye-line';
            this.setAttribute('aria-label', 'Mostrar senha');
        }
    });
    
    // Validação em tempo real
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
    
    // Validação de nome
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
    
    // Validação de sobrenome
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
    
    // Formatação de telefone
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
    
    // Validação de telefone
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
    
    // Validação de data de nascimento
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
    
    // Verificar força da senha
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
    
    // Validação de senha
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
    
    // Validação de confirmação de senha
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
    
    // Validação de termos
    function validateTerms() {
        if (!agreeTermsCheckbox.checked) {
            showError(agreeTermsCheckbox, termsError, 'Você deve aceitar os termos de uso');
            return false;
        } else {
            hideError(agreeTermsCheckbox, termsError);
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
        hideError(firstNameInput, firstNameError);
        hideError(lastNameInput, lastNameError);
        hideError(emailInput, emailError);
        hideError(phoneInput, phoneError);
        hideError(birthDateInput, birthDateError);
        hideError(passwordInput, passwordError);
        hideError(confirmPasswordInput, confirmPasswordError);
        hideError(agreeTermsCheckbox, termsError);
    }
    
    // Simular registro (substitua pela lógica real)
    async function performRegister(formData) {
        try {
            // Simular delay de rede
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Aqui você faria a chamada real para a API
            // const response = await fetch('/api/register', {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json',
            //     },
            //     body: JSON.stringify(formData)
            // });
            
            // Simulação de resposta da API
            const isEmailAvailable = formData.email !== 'teste@exemplo.com';
            
            if (isEmailAvailable) {
                // Simular token de autenticação
                localStorage.setItem('authToken', 'simulated-token-' + Date.now());
                localStorage.setItem('userType', 'personal');
                localStorage.setItem('userEmail', formData.email);
                localStorage.setItem('userName', `${formData.firstName} ${formData.lastName}`);
                
                // Redirecionar para página principal
                showSuccessMessage('Conta criada com sucesso!');
                setTimeout(() => {
                    window.location.href = 'paginainicial.html'; // Substitua pela página de destino
                }, 2000);
                
            } else {
                throw new Error('Este e-mail já está em uso');
            }
            
        } catch (error) {
            showErrorMessage(error.message || 'Erro ao criar conta. Tente novamente.');
        }
    }
    
    // Mostrar mensagem de sucesso
    function showSuccessMessage(message) {
        registerButton.innerHTML = `
            <i class="ri-check-line button-icon"></i>
            <span class="button-text">${message}</span>
        `;
        registerButton.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
        registerButton.disabled = true;
    }
    
    // Mostrar mensagem de erro
    function showErrorMessage(message) {
        registerButton.innerHTML = `
            <i class="ri-error-warning-line button-icon"></i>
            <span class="button-text">Erro</span>
        `;
        registerButton.style.background = 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)';
        registerButton.disabled = true;
        
        // Restaurar botão após 3 segundos
        setTimeout(() => {
            registerButton.innerHTML = `
                <span class="button-text">Criar Conta</span>
                <i class="ri-arrow-right-line button-icon"></i>
            `;
            registerButton.style.background = 'linear-gradient(135deg, var(--brand) 0%, var(--brand-2) 100%)';
            registerButton.disabled = false;
        }, 3000);
        
        // Mostrar erro geral
        alert(message);
    }
    
    // Restaurar botão de loading
    function showLoadingButton() {
        registerButton.innerHTML = `
            <div class="loading-spinner"></div>
            <span class="button-text">Criando conta...</span>
        `;
        registerButton.disabled = true;
    }
    
    // Submissão do formulário
    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Limpar erros anteriores
        clearAllErrors();
        
        // Validar todos os campos
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
        
        // Mostrar loading
        showLoadingButton();
        
        // Dados do formulário
        const formData = {
            firstName: firstNameInput.value.trim(),
            lastName: lastNameInput.value.trim(),
            email: emailInput.value.trim(),
            phone: phoneInput.value.replace(/\D/g, ''),
            birthDate: birthDateInput.value,
            password: passwordInput.value,
            agreeMarketing: agreeMarketingCheckbox.checked
        };
        
        // Executar registro
        await performRegister(formData);
    });
    
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
    
    // Focar no campo de nome ao carregar (apenas em desktop)
    if (window.innerWidth > 768) {
        firstNameInput.focus();
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
    // Link para login
    const loginLink = document.querySelector('.login-link');
    if (loginLink) {
        loginLink.addEventListener('click', function(e) {
            e.preventDefault();
            showMobileAlert('Redirecionando para login...');
            // window.location.href = 'loginpessoal.html';
        });
    }
    
    // Link para termos
    const termsLinks = document.querySelectorAll('.terms-link');
    termsLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            showMobileAlert('Abrindo termos de uso...');
        });
    });
    
    // Link para registro empresarial
    const businessRegisterLink = document.querySelector('.business-register-link');
    if (businessRegisterLink) {
        businessRegisterLink.addEventListener('click', function(e) {
            e.preventDefault();
            showMobileAlert('Redirecionando para registro empresarial...');
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
        const touchElements = document.querySelectorAll('.register-button, .password-toggle, .checkbox-container, .business-register-link');
        
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
            const registerCard = document.querySelector('.register-card');
            if (registerCard) {
                // Ajustar padding baseado na orientação
                if (window.innerHeight < window.innerWidth) {
                    registerCard.style.padding = '20px 24px';
                } else {
                    registerCard.style.padding = '28px 20px';
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
        const buttons = document.querySelectorAll('.register-button, .password-toggle');
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

// Função para inicializar navbar mobile (reutilizada do login)
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
            setTimeout(closeMenu, 100);
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
}