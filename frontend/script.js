const API_URL = 'https://desafio-tecnico-a6ex.onrender.com/api/participations';

// Elementos do DOM
const form = document.getElementById('participation-form');
const tableBody = document.getElementById('participacao-table-body');
const alertPlaceholder = document.getElementById('alert-placeholder');
const clearDataBtn = document.getElementById('clear-data-btn');
const submitButton = form.querySelector('button[type="submit"]');

// Variáveis de estado
let participationChart = null;
let isEditMode = false;
let currentEditId = null;
let currentParticipationData = [];

// Função para buscar os dados da API e atualizar a página.

async function fetchDataAndUpdate() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error('Falha ao buscar dados da API.');
        }
        const result = await response.json();
        
        currentParticipationData = result.data;

        // Passa os dados armazenados para as funções de atualização
        updateTable(currentParticipationData);
        updateChart(currentParticipationData);

    } catch (error) {
        console.error('Erro:', error);
        showAlert('Erro ao carregar os dados. Tente novamente mais tarde.', 'danger');
    }
}

function updateTable(data) {
    tableBody.innerHTML = '';

    if (data.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" style="text-align: center;">Nenhum dado encontrado.</td></tr>`;
        return;
    }

    data.forEach(item => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.id}</td>
            <td>${item.firstName}</td>
            <td>${item.lastName}</td>
            <td>${item.participation}%</td>
            <td>
                <button class="btn-action btn-edit" data-id="${item.id}" data-firstname="${item.firstName}" data-lastname="${item.lastName}" data-participation="${item.participation}">
                    Editar
                </button>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}


function updateChart(data) {
    const ctx = document.getElementById('grafico-rosca').getContext('2d');
    
    const labels = data.map(p => `${p.firstName} ${p.lastName}`);
    const participationData = data.map(p => p.participation);
    
    const backgroundColors = data.map(() => `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.7)`);

    if (participationChart) {
        participationChart.destroy();
    }

    participationChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                label: 'Participação (%)',
                data: participationData,
                backgroundColor: backgroundColors,
                borderColor: 'rgba(255, 255, 255, 0.2)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                }
            }
        }
    });
}


form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const participationValue = parseInt(document.getElementById('participacao').value);
    if (participationValue <= 0) {
        showAlert('O valor da participação deve ser um número positivo.', 'warning');
        return;
    }

    const participantData = {
        firstName: document.getElementById('nome').value,
        lastName: document.getElementById('sobrenome').value,
        participation: participationValue
    };

    if (isEditMode) {
        await updateParticipant(currentEditId, participantData);
    } else {
        await createParticipant(participantData);
    }
});

async function createParticipant(data) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error((await response.json()).error || 'Falha ao salvar.');
        
        form.reset();
        showAlert('Participante adicionado com sucesso!', 'success');
        fetchDataAndUpdate();
    } catch (error) {
        showAlert(error.message, 'danger');
    }
}

async function updateParticipant(id, data) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error((await response.json()).error || 'Falha ao atualizar.');
        
        showAlert('Participante atualizado com sucesso!', 'success');
        fetchDataAndUpdate();
    } catch (error) {
        showAlert(error.message, 'danger');
    } finally {
        resetEditMode();
    }
}

tableBody.addEventListener('click', (event) => {
    if (event.target.classList.contains('btn-edit')) {
        const button = event.target;
        const id = button.dataset.id;
        const firstName = button.dataset.firstname;
        const lastName = button.dataset.lastname;
        const participation = button.dataset.participation;

        enterEditMode(id, firstName, lastName, participation);
    }
});

function enterEditMode(id, firstName, lastName, participation) {
    isEditMode = true;
    currentEditId = id;

    document.getElementById('nome').value = firstName;
    document.getElementById('sobrenome').value = lastName;
    document.getElementById('participacao').value = participation;

    submitButton.textContent = 'Atualizar';
    submitButton.classList.add('btn-update'); 

    document.getElementById('nome').focus();
}

function resetEditMode() {
    isEditMode = false;
    currentEditId = null;

    form.reset();
    submitButton.textContent = 'Enviar';
    submitButton.classList.remove('btn-update');
}

function showAlert(message, type) {
    const wrapper = document.createElement('div');
    wrapper.className = `alert alert-${type}`;
    wrapper.innerHTML = `<div>${message}</div>`;
    
    alertPlaceholder.append(wrapper);
    setTimeout(() => wrapper.remove(), 5000);
}

clearDataBtn.addEventListener('click', async () => {
    if (currentParticipationData.length === 0) {
        showAlert('A tabela já está vazia. Não há dados para limpar.', 'warning');
        return; 
    }

    const userConfirmed = window.confirm(
        'Tem certeza que deseja apagar todos os dados da tabela?'
    );

    if (!userConfirmed) {
        return;
    }

    try {
        const response = await fetch(API_URL, {
            method: 'DELETE'
        });

        if(!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Falha ao limpar os dados.');
        }

        showAlert('Todos os dados foram limpos com sucesso!', 'success');
        fetchDataAndUpdate();
    } catch (error) {
        console.error('Erro ao limpar os dados:', error);
        showAlert(error.message, 'danger');
    }
});


document.addEventListener('DOMContentLoaded', fetchDataAndUpdate);