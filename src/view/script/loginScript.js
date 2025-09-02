document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const loginBtn = document.getElementById('loginBtn');
    const errorMessage = document.getElementById('errorMessage');
    
    // Verificar se já está logado
    //checkAuthStatus();
    
    // Event listener para o formulário de login
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('rememberMe').checked;
        
        if (!email || !password) {
            showError('Por favor, preencha todos os campos.');
            return;
        }
        
        // Mostrar loading
        setLoading(true);
        hideError();
        
        try {
            const response = await fetch('http://localhost:3002/usuarios/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                // credentials: 'include',
                body: JSON.stringify({
                    email: email,
                    senha: password,
                    // rememberMe: rememberMe
                })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Login bem-sucedido
                if (rememberMe) {
                    setCookie('userEmail', email, 30); // 30 dias
                }

                const userData = {
                id: data.usuario.id,
                nome: data.usuario.nome,
                email: data.usuario.email,
                tipo: data.usuario.tipo,
                token: data.token
                };
                
                // Armazenar informações do usuário
                sessionStorage.setItem('user', JSON.stringify(userData));
                
                // Mostrar mensagem de sucesso
                showSuccess('Login realizado com sucesso!');
                
                // Redirecionar após 1 segundo
                setTimeout(() => {
                    if (data.usuario.tipo === 'admin') {
                        window.location.href = 'dashboardAdm.html';
                    } else {
                        window.location.href = 'dashboardUsuario.html';
                    }
                }, 1000);
                
            } else {
                showError(data.message || 'Erro ao fazer login. Verifique suas credenciais.');
            }
            
        } catch (error) {
            console.error('Erro no login:', error);
            showError('Erro de conexão. Tente novamente.');
        } finally {
            setLoading(false);
        }
    });
    
    // Preencher email se lembrado
    const rememberedEmail = getCookie('userEmail');
    if (rememberedEmail) {
        document.getElementById('email').value = rememberedEmail;
        document.getElementById('rememberMe').checked = true;
    }
    
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

function setLoading(loading) {
    const loginBtn = document.getElementById('loginBtn');
    const btnText = loginBtn.querySelector('.btn-text');
    const btnLoading = loginBtn.querySelector('.btn-loading');
    
    if (loading) {
        loginBtn.classList.add('loading');
        loginBtn.disabled = true;
        btnText.style.display = 'none';
        btnLoading.style.display = 'inline';
    } else {
        loginBtn.classList.remove('loading');
        loginBtn.disabled = false;
        btnText.style.display = 'inline';
        btnLoading.style.display = 'none';
    }
}

function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    errorDiv.style.backgroundColor = '#fee';
    errorDiv.style.color = '#c33';
    
    // Auto-hide após 5 segundos
    setTimeout(hideError, 5000);
}

function showSuccess(message) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    errorDiv.style.backgroundColor = '#dfd';
    errorDiv.style.color = '#2d5';
}

function hideError() {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.style.display = 'none';
}

function setCookie(name, value, days) {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
}

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

/*async function checkAuthStatus() {
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
        // Usuário não está logado, continuar na página de login
        console.log('Usuário não autenticado');
    }
}
*/
// Adicionar efeitos visuais
document.querySelectorAll('.btn-primary, .btn-secondary').forEach(btn => {
    btn.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-2px)';
    });
    
    btn.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
    });
});