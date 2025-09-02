document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const strengthFill = document.getElementById('strengthFill');
    const strengthText = document.getElementById('strengthText');
    const message = document.getElementById('message');
    
    // Verificar se já está logado
    
    //checkAuthStatus();
    
    passwordInput.addEventListener('input', checkPasswordStrength);
    
    // Event listener para verificar confirmação da senha
    confirmPasswordInput.addEventListener('input', checkPasswordMatch);
    
    // Event listener para o formulário de cadastro
    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const acceptTerms = document.getElementById('acceptTerms').checked;
        
        // Validações
        if (!name || !email || !password || !confirmPassword) {
            showMessage('Por favor, preencha todos os campos.', 'error');
            return;
        }
        
        if (!acceptTerms) {
            showMessage('Você deve aceitar os termos de uso.', 'error');
            return;
        }
        
        if (password !== confirmPassword) {
            showMessage('As senhas não coincidem.', 'error');
            return;
        }
        
        if (password.length < 6) {
            showMessage('A senha deve ter pelo menos 6 caracteres.', 'error');
            return;
        }
        
        // Validar email
        if (!isValidEmail(email)) {
            showMessage('Por favor, insira um e-mail válido.', 'error');
            return;
        }
        
        // Mostrar loading
        setLoading(true);
        hideMessage();
        
        try {
            const response = await fetch('http://localhost:3002/usuarios/cadastrar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
               // credentials: 'include',
                body: JSON.stringify({
                    nome: name,
                    email: email,
                    senha: password,
                    tipo: "default"
                })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Cadastro bem-sucedido
                showMessage('Cadastro realizado com sucesso! Redirecionando...', 'success');
                
                // Armazenar informações do usuário
                if (data.usuario && data.token) {
                const userData = {
                    id: data.usuario.id,
                    nome: data.usuario.nome,
                    email: data.usuario.email,
                    tipo: data.usuario.tipo,
                    token: data.token
                };
                sessionStorage.setItem('user', JSON.stringify(userData));
                    }

                // Redirecionar após 2 segundos
                setTimeout(() => {
                    window.location.href = 'dashboardUsuario.html';
                }, 2000);
                
            } else {
                showMessage(data.message || 'Erro ao criar conta. Tente novamente.', 'error');
            }
            
        } catch (error) {
            console.error('Erro no cadastro:', error);
            showMessage('Erro de conexão. Tente novamente.', 'error');
        } finally {
            setLoading(false);
        }
    });
    
    // Animação nos inputs
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.style.transform = 'scale(1.02)';
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.style.transform = 'scale(1)';
        });
    });
});

function checkPasswordStrength() {
    const password = document.getElementById('password').value;
    const strengthFill = document.getElementById('strengthFill');
    const strengthText = document.getElementById('strengthText');
    
    if (!password) {
        strengthFill.className = 'strength-fill';
        strengthText.textContent = 'Digite uma senha';
        return;
    }
    
    let strength = 0;
    let feedback = [];
    
    // Critérios de força
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    // Determinar nível
    if (strength < 3) {
        strengthFill.className = 'strength-fill weak';
        strengthText.textContent = 'Senha fraca';
    } else if (strength < 5) {
        strengthFill.className = 'strength-fill medium';
        strengthText.textContent = 'Senha média';
    } else {
        strengthFill.className = 'strength-fill strong';
        strengthText.textContent = 'Senha forte';
    }
}

function checkPasswordMatch() {
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const confirmInput = document.getElementById('confirmPassword');
    
    if (confirmPassword && password !== confirmPassword) {
        confirmInput.style.borderColor = '#e74c3c';
    } else if (confirmPassword) {
        confirmInput.style.borderColor = '#27ae60';
    } else {
        confirmInput.style.borderColor = '#e1e5e9';
    }
}

function setLoading(loading) {
    const registerBtn = document.getElementById('registerBtn');
    const btnText = registerBtn.querySelector('.btn-text');
    const btnLoading = registerBtn.querySelector('.btn-loading');
    
    if (loading) {
        registerBtn.classList.add('loading');
        registerBtn.disabled = true;
        btnText.style.display = 'none';
        btnLoading.style.display = 'inline';
    } else {
        registerBtn.classList.remove('loading');
        registerBtn.disabled = false;
        btnText.style.display = 'inline';
        btnLoading.style.display = 'none';
    }
}

function showMessage(text, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';
    
    // Auto-hide após 5 segundos para mensagens de erro
    if (type === 'error') {
        setTimeout(hideMessage, 5000);
    }
}

function hideMessage() {
    const messageDiv = document.getElementById('message');
    messageDiv.style.display = 'none';
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/* async function checkAuthStatus() {
    try {
        const response = await fetch('http://localhost:3002/api/auth/check', {
            credentials: 'include'
        });
        
        if (response.ok) {
            const data = await response.json();
            // Se já está logado, redirecionar
            if (data.user.role === 'admin') {
                window.location.href = 'admin-dashboard.html';
            } else {
                window.location.href = 'user-dashboard.html';
            }
        }
    } catch (error) {
        // Usuário não está logado, continuar na página de cadastro
        console.log('Usuário não autenticado');
    }
}
*/

// Adicionar efeitos visuais
document.querySelectorAll('.btn-primary, .btn-secondary').forEach(btn => {
    btn.addEventListener('mouseenter', function() {
        if (!this.disabled) {
            this.style.transform = 'translateY(-2px)';
        }
    });
    
    btn.addEventListener('mouseleave', function() {
        if (!this.disabled) {
            this.style.transform = 'translateY(0)';
        }
    });
});