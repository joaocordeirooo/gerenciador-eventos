document.addEventListener('DOMContentLoaded', function() {
    // Elementos DOM
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const searchInput = document.getElementById('searchEvents');
    const logoutBtn = document.getElementById('logoutBtn');
    const modal = document.getElementById('confirmModal');
    const closeModal = document.getElementById('closeModal');
    const cancelBtn = document.getElementById('cancelBtn');
    const confirmBtn = document.getElementById('confirmBtn');

    // Variáveis globais
    let currentUser = null;
    let allEvents = [];
    let myRegistrations = [];
    let selectedEvent = null;

    // Event Listeners
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    searchInput.addEventListener('input', filterEvents);
    logoutBtn.addEventListener('click', logout);
    closeModal.addEventListener('click', closeModalHandler);
    cancelBtn.addEventListener('click', closeModalHandler);
    confirmBtn.addEventListener('click', confirmRegistration);

    modal.addEventListener('click', function(e) {
        if (e.target === modal) closeModalHandler();
    });

    // Carregar dados iniciais
    loadUserData();
    loadAvailableEvents();
    loadMyRegistrations();

    // Funções

    function loadUserData() {
        const userData = sessionStorage.getItem('user');
        if (userData) {
            const user = JSON.parse(userData);
            currentUser = {
                id: user.id,
                name: user.nome, // backend envia "nome"
                role: user.tipo  // backend envia "tipo"
            };
            document.getElementById('userName').textContent = currentUser.name;
        }
    }

    async function loadAvailableEvents() {
        try {

            const currentUser = JSON.parse(sessionStorage.getItem('user'));
            if (!currentUser || !currentUser.token) {
            throw new Error('Usuário não autenticado');
            }

        const token = currentUser.token;
            const response = await fetch('http://localhost:3002/evento/eventos-disponiveis', {
                method: 'GET',
                headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) throw new Error('Falha ao buscar eventos');
            
            const data = await response.json();
            allEvents = data.eventos_disponiveis || []; // <- garante que seja um array
            displayAvailableEvents(allEvents);
            updateStats();
        } catch (err) {
            console.error(err);
            document.getElementById('availableEvents').innerHTML = 
                '<div class="empty-state"><h3>Erro ao carregar eventos</h3><p>Tente novamente mais tarde.</p></div>';
        }
    }

   async function loadMyRegistrations() {
    try {
        // Recupera usuário e token do sessionStorage
        const currentUser = JSON.parse(sessionStorage.getItem('user'));
        if (!currentUser || !currentUser.token) {
            throw new Error('Usuário não autenticado');
        }
        const token = currentUser.token;

        const response = await fetch('http://localhost:3002/inscrever-se/meus-eventos', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // envia o token
            }
        });

        if (!response.ok) throw new Error('Falha ao buscar inscrições');

        const data = await response.json();
        myRegistrations = data.eventos_inscritos;
        displayMyRegistrations();
        updateStats();

    } catch (err) {
        console.error(err);
        document.getElementById('registeredEvents').innerHTML = 
            '<div class="empty-state"><h3>Erro ao carregar inscrições</h3><p>Tente novamente mais tarde.</p></div>';
    }
}


    function displayAvailableEvents(events) {
        const container = document.getElementById('availableEvents');
        if (!events || events.length === 0) {
            container.innerHTML = `<div class="empty-state"><h3>📅 Nenhum evento disponível</h3></div>`;
            return;
        }

        container.innerHTML = events.map(event => {
            const isRegistered = myRegistrations.some(reg => reg.id === event.id);
            const eventDate = new Date(event.data).toLocaleDateString('pt-BR');
            return `
                <div class="event-card" data-event-id="${event.id}">
                    <h3 class="event-title">${event.nome}</h3>
                    <div class="event-info">
                        <span>📅 ${eventDate}</span>
                        <span>📍 ${event.local}</span>
                    </div>
                    <p class="event-description">${event.descricao}</p>
                    <div class="event-actions">
                        ${isRegistered ? 
                            '<button class="btn-secondary" disabled>Já inscrito</button>' :
                            `<button class="btn-primary" onclick="openRegistrationModal(${event.id})">Inscrever-se</button>`
                        }
                    </div>
                </div>
            `;
        }).join('');
    }

    function displayMyRegistrations() {
        const container = document.getElementById('registeredEvents');
        if (!myRegistrations || myRegistrations.length === 0) {
            container.innerHTML = `<div class="empty-state"><h3>📝 Nenhuma inscrição</h3></div>`;
            return;
        }

        container.innerHTML = myRegistrations.map(event => {
            const eventDate = new Date(event.data).toLocaleDateString('pt-BR');
            return `
                <div class="event-card" data-event-id="${event.id}">
                    <h3 class="event-title">${event.nome}</h3>
                    <div class="event-info">
                        <span>📅 ${eventDate}</span>
                        <span>📍 ${event.local}</span>
                    </div>
                    <p class="event-description">${event.descricao}</p>
                    <div class="event-actions">
                        <button class="btn-danger" onclick="cancelRegistration(${event.id})">Cancelar Inscrição</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    function switchTab(tabName) {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(`${tabName}-tab`).classList.add('active');
    }

    function filterEvents() {
        const searchTerm = searchInput.value.toLowerCase();
        const filteredEvents = allEvents.filter(event => 
            event.nome.toLowerCase().includes(searchTerm) ||
            event.descricao.toLowerCase().includes(searchTerm) ||
            event.local.toLowerCase().includes(searchTerm)
        );
        displayAvailableEvents(filteredEvents);
    }

    function updateStats() {
        document.getElementById('totalEvents').textContent = allEvents.length;
        document.getElementById('myRegistrations').textContent = myRegistrations.length;
    }

    window.openRegistrationModal = function(eventId) {
        selectedEvent = allEvents.find(ev => ev.id === eventId);
        if (!selectedEvent) return;
        document.getElementById('eventTitle').textContent = selectedEvent.nome;
        document.getElementById('eventDate').textContent = new Date(selectedEvent.data).toLocaleDateString('pt-BR');
        document.getElementById('eventLocation').textContent = selectedEvent.local;
        document.getElementById('eventDescription').textContent = selectedEvent.descricao;
        modal.style.display = 'block';
    };

    function closeModalHandler() {
        modal.style.display = 'none';
        selectedEvent = null;
    }

    async function confirmRegistration() {
    if (!selectedEvent) return;
    confirmBtn.disabled = true;
    confirmBtn.textContent = 'Inscrevendo...';

    const currentUser = JSON.parse(sessionStorage.getItem('user'));
    if (!currentUser || !currentUser.token) {
        throw new Error('Usuário não autenticado');
    }
    const token = currentUser.token; 

    try {
        const response = await fetch('http://localhost:3002/inscrever-se/inscrever', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // agora funciona
            },
            body: JSON.stringify({ evento_id: selectedEvent.id })
        });

        const data = await response.json();
        if (response.ok) {
            showToast('Inscrição realizada com sucesso!');
            closeModalHandler();
            await loadMyRegistrations();
            await loadAvailableEvents();
        } else {
            showToast(data.message || 'Erro ao se inscrever', 'error');
        }
    } catch (err) {
        console.error(err);
        showToast('Erro de conexão', 'error');
    } finally {
        confirmBtn.disabled = false;
        confirmBtn.textContent = 'Confirmar Inscrição';
    }
}


   window.cancelRegistration = async function(eventId) {
    if (!confirm('Deseja cancelar esta inscrição?')) return;

    const currentUser = JSON.parse(sessionStorage.getItem('user'));
    if (!currentUser || !currentUser.token) {
        showToast('Usuário não autenticado', 'error');
        return;
    }
    const token = currentUser.token; 

    try {
        const response = await fetch(`http://localhost:3002/inscrever-se/${eventId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
        });
        if (response.ok) {
            showToast('Inscrição cancelada com sucesso!');
            await loadMyRegistrations();
            await loadAvailableEvents();
        } else {
            const data = await response.json();
            showToast(data.message || 'Erro ao cancelar inscrição', 'error');
        }
    } catch (err) {
        console.error(err);
        showToast('Erro de conexão', 'error');
    }
};

    async function logout() {
        if (!confirm('Deseja sair?')) return;
        try {
            const response = await fetch('http://localhost:3002/api/auth/logout', { method: 'POST', credentials: 'include' });
            sessionStorage.clear();
            window.location.href = 'login.html';
        } catch (err) {
            console.error(err);
            window.location.href = 'login.html';
        }
    }

    function showToast(message, type='success') {
        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toastMessage');
        toastMessage.textContent = message;
        toast.className = `toast ${type} show`;
        setTimeout(() => toast.classList.remove('show'), 3000);
    }

    // Atualizar automaticamente a cada 30s
    setInterval(() => {
        loadAvailableEvents();
        loadMyRegistrations();
    }, 30000);
});
