document.addEventListener('DOMContentLoaded', function() {
    
    const registerForm = document.getElementById('registerForm');
    
    const companyNameInput = document.getElementById('companyName');
    const cnpjInput = document.getElementById('cnpj');
    const companyPhoneInput = document.getElementById('companyPhone');
    const companyEmailInput = document.getElementById('companyEmail');
    const businessCategoryInput = document.getElementById('businessCategory');
    const otherCategoryInput = document.getElementById('otherCategory');
    const otherCategoryGroup = document.getElementById('otherCategoryGroup');
    
    const responsibleNameInput = document.getElementById('responsibleName');
    const responsiblePositionInput = document.getElementById('responsiblePosition');
    const responsibleEmailInput = document.getElementById('responsibleEmail');
    const responsiblePhoneInput = document.getElementById('responsiblePhone');
    
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const passwordToggle = document.getElementById('passwordToggle');
    const confirmPasswordToggle = document.getElementById('confirmPasswordToggle');
    const registerButton = document.getElementById('registerButton');
    const agreeTermsCheckbox = document.getElementById('agreeTerms');
    const agreeMarketingCheckbox = document.getElementById('agreeMarketing');
    
    const companyNameError = document.getElementById('companyNameError');
    const cnpjError = document.getElementById('cnpjError');
    const companyPhoneError = document.getElementById('companyPhoneError');
    const companyEmailError = document.getElementById('companyEmailError');
    const businessCategoryError = document.getElementById('businessCategoryError');
    const otherCategoryError = document.getElementById('otherCategoryError');
    const responsibleNameError = document.getElementById('responsibleNameError');
    const responsiblePositionError = document.getElementById('responsiblePositionError');
    const responsibleEmailError = document.getElementById('responsibleEmailError');
    const responsiblePhoneError = document.getElementById('responsiblePhoneError');
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
    
    companyNameInput.addEventListener('input', function() {
        validateCompanyName();
    });
    
    cnpjInput.addEventListener('input', function() {
        formatCNPJ();
        validateCNPJ();
    });
    
    companyPhoneInput.addEventListener('input', function() {
        formatPhoneNumber(companyPhoneInput);
        validateCompanyPhone();
    });
    
    companyEmailInput.addEventListener('input', function() {
        validateCompanyEmail();
    });
    
    businessCategoryInput.addEventListener('change', function() {
        console.log('Evento change disparado');
        validateBusinessCategory();
        toggleOtherCategoryField();
    });
    
    businessCategoryInput.addEventListener('input', function() {
        console.log('Evento input disparado');
        validateBusinessCategory();
        toggleOtherCategoryField();
    });
    
    otherCategoryInput.addEventListener('input', function() {
        validateOtherCategory();
    });
    
    responsibleNameInput.addEventListener('input', function() {
        validateResponsibleName();
    });
    
    responsiblePositionInput.addEventListener('input', function() {
        validateResponsiblePosition();
    });
    
    responsibleEmailInput.addEventListener('input', function() {
        validateResponsibleEmail();
    });
    
    responsiblePhoneInput.addEventListener('input', function() {
        formatPhoneNumber(responsiblePhoneInput);
        validateResponsiblePhone();
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
    
    function validateCompanyName() {
        const companyName = companyNameInput.value.trim();
        
        if (companyName === '') {
            showError(companyNameInput, companyNameError, 'Nome da empresa é obrigatório');
            return false;
        } else if (companyName.length < 2) {
            showError(companyNameInput, companyNameError, 'Nome da empresa deve ter pelo menos 2 caracteres');
            return false;
        } else {
            hideError(companyNameInput, companyNameError);
            return true;
        }
    }
    
    function formatCNPJ() {
        let cnpj = cnpjInput.value.replace(/\D/g, '');
        
        if (cnpj.length >= 14) {
            cnpj = cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
        } else if (cnpj.length >= 12) {
            cnpj = cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{0,2})/, '$1.$2.$3/$4-$5');
        } else if (cnpj.length >= 9) {
            cnpj = cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{0,4})/, '$1.$2.$3/$4');
        } else if (cnpj.length >= 6) {
            cnpj = cnpj.replace(/(\d{2})(\d{3})(\d{0,3})/, '$1.$2.$3');
        } else if (cnpj.length >= 3) {
            cnpj = cnpj.replace(/(\d{2})(\d{0,3})/, '$1.$2');
        }
        
        cnpjInput.value = cnpj;
    }
    
    function validateCNPJ() {
        const cnpj = cnpjInput.value.replace(/\D/g, '');
        
        if (cnpj === '') {
            showError(cnpjInput, cnpjError, 'CNPJ é obrigatório');
            return false;
        } else if (cnpj.length !== 14) {
            showError(cnpjInput, cnpjError, 'CNPJ deve ter 14 dígitos');
            return false;
        } else if (!isValidCNPJ(cnpj)) {
            showError(cnpjInput, cnpjError, 'CNPJ inválido');
            return false;
        } else {
            hideError(cnpjInput, cnpjError);
            return true;
        }
    }
    
    function isValidCNPJ(cnpj) {
        if (cnpj === "00000000000000" || 
            cnpj === "11111111111111" || 
            cnpj === "22222222222222" || 
            cnpj === "33333333333333" || 
            cnpj === "44444444444444" || 
            cnpj === "55555555555555" || 
            cnpj === "66666666666666" || 
            cnpj === "77777777777777" || 
            cnpj === "88888888888888" || 
            cnpj === "99999999999999") {
            return false;
        }
        
        let tamanho = cnpj.length - 2;
        let numeros = cnpj.substring(0, tamanho);
        let digitos = cnpj.substring(tamanho);
        let soma = 0;
        let pos = tamanho - 7;
        
        for (let i = tamanho; i >= 1; i--) {
            soma += numeros.charAt(tamanho - i) * pos--;
            if (pos < 2) pos = 9;
        }
        
        let resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
        if (resultado != digitos.charAt(0)) return false;
        
        tamanho = tamanho + 1;
        numeros = cnpj.substring(0, tamanho);
        soma = 0;
        pos = tamanho - 7;
        
        for (let i = tamanho; i >= 1; i--) {
            soma += numeros.charAt(tamanho - i) * pos--;
            if (pos < 2) pos = 9;
        }
        
        resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
        return resultado == digitos.charAt(1);
    }
    
    function formatPhoneNumber(input) {
        let phone = input.value.replace(/\D/g, '');
        
        if (phone.length >= 11) {
            phone = phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        } else if (phone.length >= 7) {
            phone = phone.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
        } else if (phone.length >= 3) {
            phone = phone.replace(/(\d{2})(\d{0,5})/, '($1) $2');
        } else if (phone.length >= 1) {
            phone = phone.replace(/(\d{0,2})/, '($1');
        }
        
        input.value = phone;
    }
    
    function validateCompanyPhone() {
        const phone = companyPhoneInput.value.replace(/\D/g, '');
        
        if (phone === '') {
            showError(companyPhoneInput, companyPhoneError, 'Telefone da empresa é obrigatório');
            return false;
        } else if (phone.length < 10) {
            showError(companyPhoneInput, companyPhoneError, 'Telefone deve ter pelo menos 10 dígitos');
            return false;
        } else if (phone.length > 11) {
            showError(companyPhoneInput, companyPhoneError, 'Telefone deve ter no máximo 11 dígitos');
            return false;
        } else {
            hideError(companyPhoneInput, companyPhoneError);
            return true;
        }
    }
    
    function validateCompanyEmail() {
        const email = companyEmailInput.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (email === '') {
            showError(companyEmailInput, companyEmailError, 'E-mail da empresa é obrigatório');
            return false;
        } else if (!emailRegex.test(email)) {
            showError(companyEmailInput, companyEmailError, 'Por favor, insira um e-mail válido');
            return false;
        } else {
            hideError(companyEmailInput, companyEmailError);
            return true;
        }
    }
    
    function validateBusinessCategory() {
        const category = businessCategoryInput.value;
        
        if (category === '') {
            showError(businessCategoryInput, businessCategoryError, 'Categoria de negócio é obrigatória');
            return false;
        } else {
            hideError(businessCategoryInput, businessCategoryError);
            return true;
        }
    }
    
    function toggleOtherCategoryField() {
        const category = businessCategoryInput.value;
        console.log('Categoria selecionada:', category);
        
        if (category === 'outros') {
            console.log('Mostrando campo outros');
            otherCategoryGroup.style.display = 'flex';
            otherCategoryGroup.classList.add('show');
            
            setTimeout(() => {
                if (otherCategoryInput) {
                    otherCategoryInput.focus();
                }
            }, 200);
            
            otherCategoryInput.setAttribute('required', 'required');
        } else {
            console.log('Ocultando campo outros');
            otherCategoryInput.value = '';
            otherCategoryInput.removeAttribute('required');
            hideError(otherCategoryInput, otherCategoryError);
            
            otherCategoryGroup.classList.remove('show');
            
            setTimeout(() => {
                if (otherCategoryGroup) {
                    otherCategoryGroup.style.display = 'none';
                }
            }, 300);
        }
    }
    
    function validateOtherCategory() {
        const category = businessCategoryInput.value;
        const otherCategory = otherCategoryInput.value.trim();
        
        if (category === 'outros') {
            if (otherCategory === '') {
                showError(otherCategoryInput, otherCategoryError, 'Por favor, especifique a categoria');
                return false;
            } else if (otherCategory.length < 2) {
                showError(otherCategoryInput, otherCategoryError, 'Categoria deve ter pelo menos 2 caracteres');
                return false;
            } else {
                hideError(otherCategoryInput, otherCategoryError);
                return true;
            }
        } else {
            hideError(otherCategoryInput, otherCategoryError);
            return true;
        }
    }
    
    function validateResponsibleName() {
        const name = responsibleNameInput.value.trim();
        
        if (name === '') {
            showError(responsibleNameInput, responsibleNameError, 'Nome do responsável é obrigatório');
            return false;
        } else if (name.length < 2) {
            showError(responsibleNameInput, responsibleNameError, 'Nome deve ter pelo menos 2 caracteres');
            return false;
        } else if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(name)) {
            showError(responsibleNameInput, responsibleNameError, 'Nome deve conter apenas letras');
            return false;
        } else {
            hideError(responsibleNameInput, responsibleNameError);
            return true;
        }
    }
    
    function validateResponsiblePosition() {
        const position = responsiblePositionInput.value.trim();
        
        if (position === '') {
            showError(responsiblePositionInput, responsiblePositionError, 'Cargo é obrigatório');
            return false;
        } else if (position.length < 2) {
            showError(responsiblePositionInput, responsiblePositionError, 'Cargo deve ter pelo menos 2 caracteres');
            return false;
        } else {
            hideError(responsiblePositionInput, responsiblePositionError);
            return true;
        }
    }
    
    function validateResponsibleEmail() {
        const email = responsibleEmailInput.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (email === '') {
            showError(responsibleEmailInput, responsibleEmailError, 'E-mail do responsável é obrigatório');
            return false;
        } else if (!emailRegex.test(email)) {
            showError(responsibleEmailInput, responsibleEmailError, 'Por favor, insira um e-mail válido');
            return false;
        } else {
            hideError(responsibleEmailInput, responsibleEmailError);
            return true;
        }
    }
    
    function validateResponsiblePhone() {
        const phone = responsiblePhoneInput.value.replace(/\D/g, '');
        
        if (phone === '') {
            showError(responsiblePhoneInput, responsiblePhoneError, 'Telefone do responsável é obrigatório');
            return false;
        } else if (phone.length < 10) {
            showError(responsiblePhoneInput, responsiblePhoneError, 'Telefone deve ter pelo menos 10 dígitos');
            return false;
        } else if (phone.length > 11) {
            showError(responsiblePhoneInput, responsiblePhoneError, 'Telefone deve ter no máximo 11 dígitos');
            return false;
        } else {
            hideError(responsiblePhoneInput, responsiblePhoneError);
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
        hideError(companyNameInput, companyNameError);
        hideError(cnpjInput, cnpjError);
        hideError(companyPhoneInput, companyPhoneError);
        hideError(companyEmailInput, companyEmailError);
        hideError(businessCategoryInput, businessCategoryError);
        hideError(otherCategoryInput, otherCategoryError);
        hideError(responsibleNameInput, responsibleNameError);
        hideError(responsiblePositionInput, responsiblePositionError);
        hideError(responsibleEmailInput, responsibleEmailError);
        hideError(responsiblePhoneInput, responsiblePhoneError);
        hideError(passwordInput, passwordError);
        hideError(confirmPasswordInput, confirmPasswordError);
        hideError(agreeTermsCheckbox, termsError);
    }
    
    async function performRegister(formData) {
        try {
            const normalizeDigits = value => (value || '').replace(/\D/g, '');
            const beautifyPhone = (value, fallback) => {
                const digits = normalizeDigits(value);
                if (digits.length === 11) {
                    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
                }
                if (digits.length === 10) {
                    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
                }
                return fallback || value || digits;
            };
            const beautifyCnpj = digits => {
                const clean = (digits || '').replace(/\D/g, '');
                if (clean.length !== 14) return clean || digits;
                return `${clean.slice(0, 2)}.${clean.slice(2, 5)}.${clean.slice(5, 8)}/${clean.slice(8, 12)}-${clean.slice(12)}`;
            };
            const categoryRaw = (formData.businessCategoryLabel || formData.businessCategory || '').trim();
            const categoryTag = categoryRaw
                ? categoryRaw.replace(/\s+/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
                : '';
            await MapsAuth.register({
                type: 'business',
                email: formData.companyEmail,
                password: formData.password,
                name: formData.companyName,
                company: formData.companyName,
                phone: formData.companyPhoneRaw || beautifyPhone(formData.companyPhone),
                cnpj: formData.cnpj,
                profile: {
                    caption: `Responsavel: ${formData.responsibleName}`,
                    tags: categoryTag ? [categoryTag] : [],
                    sector: categoryTag,
                    model: categoryTag ? `Atuacao em ${categoryTag}` : 'Sob demanda',
                    headquarters: 'Brasil',
                    marketingOptIn: !!formData.agreeMarketing,
                    createdAt: new Date().toISOString(),
                    contact: {
                        instagram: '@' + (formData.companyName || '').replace(/\s+/g, '').toLowerCase(),
                        linkedin: formData.companyName,
                        email: formData.responsibleEmail,
                        phone: beautifyPhone(formData.responsiblePhoneRaw || formData.responsiblePhone),
                        manager: formData.responsibleName,
                        role: formData.responsiblePosition,
                        document: beautifyCnpj(formData.cnpj)
                    },
                    agendaToday: 0,
                    curriculos: 0
                }
            });
            showSuccessMessage('Conta empresarial criada com sucesso!');
            setTimeout(() => {
                window.location.href = '../index.html';
            }, 1800);
        } catch (error) {
            const code = error?.message;
            const message =
                code === 'EMAIL_TAKEN' ? 'Este e-mail ja esta em uso' :
                code === 'CNPJ_TAKEN' ? 'Este CNPJ ja esta em uso' :
                code === 'PASSWORD_REQUIRED' ? 'Informe uma senha valida' :
                code === 'STORAGE_UNAVAILABLE' ? 'Nao foi possivel salvar seus dados neste navegador. Verifique permissoes de armazenamento e tente novamente.' :
                (code || 'Erro ao criar conta empresarial. Tente novamente.');
            showErrorMessage(message);
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
                <span class="button-text">Criar Conta Empresarial</span>
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
            <span class="button-text">Criando conta empresarial...</span>
        `;
        registerButton.disabled = true;
    }
    
    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        clearAllErrors();
        
        const isCompanyNameValid = validateCompanyName();
        const isCNPJValid = validateCNPJ();
        const isCompanyPhoneValid = validateCompanyPhone();
        const isCompanyEmailValid = validateCompanyEmail();
        const isBusinessCategoryValid = validateBusinessCategory();
        const isOtherCategoryValid = validateOtherCategory();
        const isResponsibleNameValid = validateResponsibleName();
        const isResponsiblePositionValid = validateResponsiblePosition();
        const isResponsibleEmailValid = validateResponsibleEmail();
        const isResponsiblePhoneValid = validateResponsiblePhone();
        const isPasswordValid = validatePassword();
        const isConfirmPasswordValid = validateConfirmPassword();
        const isTermsValid = validateTerms();
        
        if (!isCompanyNameValid || !isCNPJValid || !isCompanyPhoneValid || 
            !isCompanyEmailValid || !isBusinessCategoryValid || !isOtherCategoryValid ||
            !isResponsibleNameValid || !isResponsiblePositionValid || !isResponsibleEmailValid || 
            !isResponsiblePhoneValid || !isPasswordValid || !isConfirmPasswordValid || !isTermsValid) {
            return;
        }
        
        showLoadingButton();
        
        const companyPhoneRaw = companyPhoneInput.value.trim();
        const responsiblePhoneRaw = responsiblePhoneInput.value.trim();
        const categoryValue = businessCategoryInput.value;
        const categoryLabel = categoryValue === 'outros'
            ? otherCategoryInput.value.trim()
            : (businessCategoryInput.options[businessCategoryInput.selectedIndex]?.text || '').trim();
        const formData = {
            companyName: companyNameInput.value.trim(),
            cnpj: cnpjInput.value.replace(/\D/g, ''),
            companyPhone: companyPhoneRaw.replace(/\D/g, ''),
            companyPhoneRaw,
            companyEmail: companyEmailInput.value.trim(),
            businessCategory: categoryValue === 'outros' ? otherCategoryInput.value.trim() : categoryValue,
            businessCategoryLabel: categoryLabel || (categoryValue === 'outros' ? otherCategoryInput.value.trim() : categoryValue),
            responsibleName: responsibleNameInput.value.trim(),
            responsiblePosition: responsiblePositionInput.value.trim(),
            responsibleEmail: responsibleEmailInput.value.trim(),
            responsiblePhone: responsiblePhoneRaw.replace(/\D/g, ''),
            responsiblePhoneRaw,
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
        companyNameInput.focus();
    }
    toggleOtherCategoryField();
    
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
            navigateWithFeedback('loginempresa.html', 'Redirecionando para login empresarial...');
        });
    }
    
    const personalRegisterLink = document.querySelector('.personal-register-link');
    if (personalRegisterLink) {
        personalRegisterLink.addEventListener('click', function(e) {
            e.preventDefault();
            navigateWithFeedback('registropessoal.html', 'Redirecionando para registro pessoal...');
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
        const touchElements = document.querySelectorAll('.register-button, .password-toggle, .checkbox-container, .personal-register-link, .login-link');
        
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

