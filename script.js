const balanceDisplay = document.getElementById('total-display');
const incomeDisplay = document.getElementById('income-display');
const expenseDisplay = document.getElementById('expense-display');
const monthlyNetDisplay = document.getElementById('monthly-net-display');
const recurringList = document.getElementById('recurring-list');
const variableList = document.getElementById('variable-list');
const form = document.getElementById('transaction-form');
const descriptionInput = document.getElementById('description');
const amountInput = document.getElementById('amount');
const isRecurringInput = document.getElementById('is-recurring');
const monthsProjectInput = document.getElementById('months-project');

const ctxDoughnut = document.getElementById('financeChart').getContext('2d');
const ctxBar = document.getElementById('projectionChart').getContext('2d');

// Dados iniciais baseados em um cenário comum
let transactions = [
    { id: 1, description: 'Bolsa Estágio', amount: 1200, isRecurring: true },
    { id: 2, description: 'Psicólogo', amount: -250, isRecurring: true },
    { id: 3, description: 'Streamings (Spotify/Netflix)', amount: -60, isRecurring: true },
    { id: 4, description: 'Combustível Sandero', amount: -200, isRecurring: true },
    { id: 5, description: 'Lanche', amount: -45, isRecurring: false }
];

let financeChart, projectionChart;

const formatCurrency = (value) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

// Adicionar transação nas listas corretas
const addTransactionDOM = (transaction) => {
    const sign = transaction.amount < 0 ? '-' : '+';
    const item = document.createElement('li');
    item.classList.add(transaction.amount < 0 ? 'minus' : 'plus');
    
    const recurringBadge = transaction.isRecurring ? '<span class="badge">Fixo</span>' : '';

    item.innerHTML = `
        <div>${transaction.description} ${recurringBadge}</div>
        <div>
            <span>${sign} ${formatCurrency(Math.abs(transaction.amount))}</span>
            <button class="delete-btn" onclick="removeTransaction(${transaction.id})">x</button>
        </div>
    `;

    if (transaction.isRecurring) recurringList.appendChild(item);
    else variableList.appendChild(item);
};

// Processar a matemática e atualizar tela
const updateValuesAndCharts = () => {
    // 1. Saldo Atual (Tudo misturado)
    const total = transactions.reduce((acc, t) => acc + t.amount, 0);
    const income = transactions.filter(t => t.amount > 0).reduce((acc, t) => acc + t.amount, 0);
    const expense = transactions.filter(t => t.amount < 0).reduce((acc, t) => acc + t.amount, 0);

    // 2. Balanço Fixo Mensal (Apenas Recorrentes)
    const fixedIncome = transactions.filter(t => t.amount > 0 && t.isRecurring).reduce((acc, t) => acc + t.amount, 0);
    const fixedExpense = transactions.filter(t => t.amount < 0 && t.isRecurring).reduce((acc, t) => acc + t.amount, 0);
    const monthlyNet = fixedIncome + fixedExpense; // Balanço estrutural

    // Atualiza Textos
    balanceDisplay.innerText = formatCurrency(total);
    incomeDisplay.innerText = formatCurrency(income);
    expenseDisplay.innerText = formatCurrency(Math.abs(expense));
    monthlyNetDisplay.innerText = formatCurrency(monthlyNet);
    monthlyNetDisplay.style.color = monthlyNet >= 0 ? 'var(--success-color)' : 'var(--danger-color)';

    // Atualiza Gráficos
    updateDoughnutChart(income, Math.abs(expense));
    updateProjectionChart(total, monthlyNet, parseInt(monthsProjectInput.value) || 6);
};

// Gráfico 1: Composição do Mês (Rosca)
const updateDoughnutChart = (income, expense) => {
    if (financeChart) financeChart.destroy();
    financeChart = new Chart(ctxDoughnut, {
        type: 'doughnut',
        data: {
            labels: ['Entradas', 'Saídas'],
            datasets: [{ data: [income, expense], backgroundColor: ['#2ecc71', '#e74c3c'], borderWidth: 0 }]
        },
        options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
    });
};

// Gráfico 2: Projeção Futura (Barras)
const updateProjectionChart = (currentBalance, monthlyNet, monthsToProject) => {
    if (projectionChart) projectionChart.destroy();

    const labels = ['Mês Atual'];
    const dataPoints = [currentBalance];
    
    let simulatedBalance = currentBalance;
    
    // Loop de especulação matemática
    for (let i = 1; i <= monthsToProject; i++) {
        labels.push(`Mês +${i}`);
        simulatedBalance += monthlyNet;
        dataPoints.push(simulatedBalance);
    }

    projectionChart = new Chart(ctxBar, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Especulação de Saldo (R$)',
                data: dataPoints,
                backgroundColor: dataPoints.map(val => val >= 0 ? '#3498db' : '#e74c3c'),
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            scales: { y: { beginAtZero: true } }
        }
    });
};

// Remover transação
const removeTransaction = (id) => {
    transactions = transactions.filter(transaction => transaction.id !== id);
    init();
};

// Enviar Formulário
form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!descriptionInput.value.trim() || !amountInput.value.trim()) return;

    const transaction = {
        id: Math.floor(Math.random() * 10000000),
        description: descriptionInput.value,
        amount: +amountInput.value,
        isRecurring: isRecurringInput.checked
    };

    transactions.push(transaction);
    descriptionInput.value = ''; amountInput.value = ''; isRecurringInput.checked = false;
    init();
});

// Recalcular projeção quando mudar o número de meses
monthsProjectInput.addEventListener('input', updateValuesAndCharts);

// Inicializar App
const init = () => {
    recurringList.innerHTML = '';
    variableList.innerHTML = '';
    transactions.forEach(addTransactionDOM);
    updateValuesAndCharts();
};

init();
