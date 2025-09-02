 // Variáveis globais
    let currentUser = JSON.parse(sessionStorage.getItem('user')) || null;
    let allEvents = [];
    let allUsers = [];
    let allRegistrations = [];
    let editingEventId = null;
    let deleteEventId = null;

document.addEventListener('DOMContentLoaded', function() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const logoutBtn = document.getElementById('logoutBtn');
    const newEventBtn = document.getElementById('newEventBtn');
    const eventModal = document.getElementById('eventModal');
    const deleteModal = document.getElementById('deleteModal');
    const eventForm = document.getElementById('eventForm');
    const searchUsers = document.getElementById('searchUsers');
    const eventFilter = document.getElementById('eventFilter');

    // Tab navigation
    tabButtons.forEach(btn => btn.addEventListener('click', () => switchTab(btn.dataset.tab)));

    // Botões
    logoutBtn.addEventListener('click', logout);
    newEventBtn.addEventListener('click', () => openEventModal());
    eventForm.addEventListener('submit', saveEvent);
    if(searchUsers) searchUsers.addEventListener('input', filterUsers);
    if(eventFilter) eventFilter.addEventListener('change', filterRegistrations);

    document.getElementById('closeEventModal').addEventListener('click', closeEventModal);
    document.getElementById('cancelEventBtn').addEventListener('click', closeEventModal);
    document.getElementById('closeDeleteModal').addEventListener('click', closeDeleteModal);
    document.getElementById('cancelDeleteBtn').addEventListener('click', closeDeleteModal);
    document.getElementById('confirmDeleteBtn').addEventListener('click', confirmDelete);

    eventModal.addEventListener('click', e => { if(e.target === eventModal) closeEventModal(); });
    deleteModal.addEventListener('click', e => { if(e.target === deleteModal) closeDeleteModal(); });

    loadDashboardData();
});

// ------------------- AUTH -------------------
function getAuthHeaders() {
    if (!currentUser || !currentUser.token) return {};
    return { 
        'Authorization': `Bearer ${currentUser.token}`,
        'Content-Type': 'application/json'
    };
}

// ------------------- LOAD DASHBOARD -------------------
async function loadDashboardData() {
    await Promise.all([loadEvents(), loadUsers(), loadAllRegistrations()]);
    updateStats();
}

async function loadEvents() {
    try {
        const res = await fetch('http://localhost:3002/evento/eventos-disponiveis', {
            headers: getAuthHeaders()
        });
        if (res.status === 401) return redirectLogin();
        const data = await res.json();
        allEvents = data.eventos_disponiveis || [];
        displayEvents();
        populateEventFilter();
    } catch (err) {
        console.error('Erro ao carregar eventos:', err);
        allEvents = [];
        displayEvents();
        showToast('Erro ao carregar eventos', 'error');
    }
}

async function loadUsers() {
    try {
        // Ajuste conforme sua rota real de admin
        // const response = await fetch('http://localhost:3002/usuarios/admin/users', { headers: getAuthHeaders() });

        // Se não tiver rota admin, apenas retorna array vazio
        allUsers = []; 
        displayUsers(allUsers);

    } catch (err) {
        console.error(err);
        allUsers = [];
        displayUsers([]);
        showToast('Erro ao carregar usuários', 'error');
    }
}

async function loadRegistrations() {
    try {
        const response = await fetch('http://localhost:3002/inscrever-se/meus-eventos', { headers: getAuthHeaders() });
        if (response.status === 401) return redirectLogin();
        if (!response.ok) throw new Error('Rota não encontrada');
        const data = await response.json();
        allRegistrations = data.eventos_inscritos || [];
        displayRegistrations(allRegistrations);
    } catch (err) {
        console.error('Erro ao carregar inscrições:', err);
        allRegistrations = [];
        displayRegistrations([]);
        showToast('Erro ao carregar inscrições', 'error');
    }
}

function redirectLogin() {
    showToast('Sessão expirada. Redirecionando...', 'error');
    setTimeout(() => window.location.href = 'login.html', 1000);
}

// ------------------- DISPLAY FUNCTIONS -------------------
function displayEvents() {
    const container = document.getElementById('eventsList');
    if (!allEvents.length) {
        container.innerHTML = `<div class="empty-state"><h3>📅 Nenhum evento cadastrado</h3></div>`;
        return;
    }
    container.innerHTML = allEvents.map(event => {
        const eventDate = new Date(event.data).toLocaleString('pt-BR');
        return `
            <div class="event-item">
                <div class="item-header">
                    <h3>${event.nome}</h3>
                    <div>
                        <button onclick="editEvent(${event.id})">✏️ Editar</button>
                        <button onclick="openDeleteModal(${event.id})">🗑️ Excluir</button>
                    </div>
                </div>
                <div>
                    <span>📅 ${eventDate}</span>
                    <span>📍 ${event.local}</span>
                </div>
                <p>${event.descricao}</p>
            </div>`;
    }).join('');
}

function displayUsers(users) {
    const container = document.getElementById('usersList');
    if (!users.length) {
        container.innerHTML = `<div class="empty-state"><h3>👥 Nenhum usuário</h3></div>`;
        return;
    }
    container.innerHTML = users.map(u => `<div class="user-item">${u.nome} (${u.email})</div>`).join('');
}

function displayRegistrations(registrations) {
    const container = document.getElementById('registrationsList');
    if (!registrations.length) {
        container.innerHTML = `<div class="empty-state"><h3>📝 Nenhuma inscrição</h3></div>`;
        return;
    }
     container.innerHTML = registrations.map(r => `
        <div class="registration-item">
            <strong>Evento:</strong> ${r.event.nome} <br>
            <strong>Usuário:</strong> ${r.user.name} (${r.user.email}) <br>
            <small>Inscrito em: ${new Date(r.createdAt).toLocaleString('pt-BR')}</small>
        </div>
    `).join('');
}

// ------------------- MODAIS -------------------
function openEventModal() { document.getElementById('eventModal').style.display = 'block'; }
function closeEventModal() { document.getElementById('eventModal').style.display = 'none'; }
function openDeleteModal(id) { deleteEventId = id; document.getElementById('deleteModal').style.display = 'block'; }
function closeDeleteModal() { document.getElementById('deleteModal').style.display = 'none'; }

// ------------------- EVENT CRUD -------------------
async function saveEvent(e) {
    e.preventDefault();

    const formData = new FormData(eventForm);
    const eventData = {
        nome: formData.get('name')?.trim(),
        descricao: formData.get('description')?.trim(),
        data: formData.get('date')?.trim(),
        local: formData.get('location')?.trim()
    };

    // Validação básica
    if (!eventData.nome || !eventData.descricao || !eventData.data || !eventData.local) {
        showToast('Por favor, preencha todos os campos do evento', 'error');
        return;
    }

    try {
        const url = editingEventId 
            ? `http://localhost:3002/evento/${editingEventId}` 
            : 'http://localhost:3002/evento/criar-evento';
        const method = editingEventId ? 'PUT' : 'POST';

        const res = await fetch(url, {
            method,
            headers: getAuthHeaders(),
            body: JSON.stringify(eventData)
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.error || 'Erro ao salvar evento');
        }

        showToast('Evento salvo com sucesso!', 'success');
        closeEventModal();
        await loadEvents();
        editingEventId = null;

    } catch (err) {
        console.error('Erro ao salvar evento:', err);
        showToast(err.message, 'error');
    }
}


function editEvent(id) {
    const event = allEvents.find(e => e.id === id);
    if (!event) return;

    editingEventId = id;

    eventForm.name.value = event.nome;
    eventForm.description.value = event.descricao;
    eventForm.date.value = event.data.split('.')[0];
    eventForm.location.value = event.local;

    openEventModal();
}

async function confirmDelete() {
    if (!deleteEventId) return;
    try {
        await fetch(`http://localhost:3002/evento/${deleteEventId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        showToast('Evento excluído', 'success');
        closeDeleteModal();
        await loadEvents();
    } catch (err) {
        console.error(err);
        showToast('Erro ao excluir evento', 'error');
    }
}

// ------------------- UTILS -------------------
function logout() {
    sessionStorage.removeItem('user');
    window.location.href = 'login.html';
}

function showToast(msg, type='info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
}

function switchTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(`${tabName}-tab`).classList.add('active');
}

function updateStats() {
    document.getElementById('totalEvents').textContent = allEvents.length;
    document.getElementById('totalUsers').textContent = allUsers.length;
    document.getElementById('totalRegistrations').textContent = allRegistrations.length;
}

function populateEventFilter() {
    const filter = document.getElementById('eventFilter');
    filter.innerHTML = '<option value="">Todos os eventos</option>';
    allEvents.forEach(ev => {
        const option = document.createElement('option');
        option.value = ev.id;
        option.textContent = ev.nome;
        filter.appendChild(option);
    });
}

function filterUsers() {
    const query = searchUsers.value.toLowerCase();
    displayUsers(allUsers.filter(u => u.nome.toLowerCase().includes(query) || u.email.toLowerCase().includes(query)));
}

function filterRegistrations() {
    const eventId = eventFilter.value;
    if (!eventId) return displayRegistrations(allRegistrations);
    displayRegistrations(allRegistrations.filter(r => r.event.id.toString() === eventId));
}


//buscar inscricoes:
async function loadAllRegistrations() {
    try {
        const response = await fetch('http://localhost:3002/evento/inscricoes', {
            headers: getAuthHeaders()
        });
        if (response.status === 401) return redirectLogin();
        if (!response.ok) throw new Error('Erro ao buscar inscrições');

        const data = await response.json();
        allRegistrations = data || [];  // já vem no formato [{ id, user, event, createdAt }]
        displayRegistrations(allRegistrations);

    } catch (err) {
        console.error('Erro ao carregar inscrições:', err);
        allRegistrations = [];
        displayRegistrations([]);
        showToast('Erro ao carregar inscrições', 'error');
    }
}


// Auto-refresh
setInterval(loadDashboardData, 60000);
