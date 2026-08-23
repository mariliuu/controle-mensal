const balanceDisplay = document.getElementById('total-display');
const incomeDisplay = document.getElementById('income-display');
const expenseDisplay = document.getElementById('expense-display');
const list = document.getElementById('transaction-list');
const form = document.getElementById('transaction-form');
const descriptionInput = document.getElementById('description');
const amountInput = document.getElementById('amount');
const ctx = document.getElementById('financeChart').getContext('2d');

// Array para armazenar as transações (Estado inicial de exemplo)
let transactions = [
    { id: 1, description: 'Salário', amount: 3000 },
    { id: 2, description: 'Aluguel', amount: -1200 },
    { id: 3, description: 'Mercado', amount: -400 }
];

let financeChart;

// Formatar moeda (Real)
const formatCurrency = (value) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

// Adicionar transação ao DOM
const addTransactionDOM = (transaction) => {
    const sign = transaction.amount < 0 ? '-' : '+';
    const item = document.createElement('li');
    item.classList.add(transaction.amount < 0 ? 'minus' : 'plus');

    item.innerHTML = `
        ${transaction.description} 
        <span>${sign} ${formatCurrency(Math.abs(transaction.amount))}</span>
        <button class="delete-btn" onclick="removeTransaction(${transaction.id})">x</button>
    `;
    list.appendChild(item);
};

// Atualizar saldos e gráfico
const updateValuesAndChart = () => {
    const amounts = transactions.map(transaction => transaction.amount);
    
    const total = amounts.reduce((acc, item) => (acc += item), 0);
    const income = amounts.filter(item => item > 0).reduce((acc, item) => (acc += item), 0);
    const expense = amounts.filter(item => item < 0).reduce((acc, item) => (acc += item), 0) * -1;

    balanceDisplay.innerText = formatCurrency(total);
    incomeDisplay.innerText = formatCurrency(income);
    expenseDisplay.innerText = formatCurrency(expense);

    updateChart(income, expense);
};

// Remover transação
const removeTransaction = (id) => {
    transactions = transactions.filter(transaction => transaction.id !== id);
    init();
};

// Lidar com o envio do formulário
form.addEventListener('submit', (e) => {
    e.preventDefault();

    if (descriptionInput.value.trim() === '' || amountInput.value.trim() === '') {
        alert('Por favor, adicione uma descrição e um valor');
        return;
    }

    const transaction = {
        id: Math.floor(Math.random() * 100000000),
        description: descriptionInput.value,
        amount: +amountInput.value
    };

    transactions.push(transaction);
    init();

    descriptionInput.value = '';
    amountInput.value = '';
});

// Configurar e atualizar o Chart.js
const updateChart = (income, expense) => {
    if (financeChart) {
        financeChart.destroy();
    }

    financeChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Receitas', 'Despesas'],
            datasets: [{
                data: [income, expense],
                backgroundColor: ['#2ecc71', '#e74c3c'],
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });
};

// Inicializar o App
const init = () => {
    list.innerHTML = '';
    transactions.forEach(addTransactionDOM);
    updateValuesAndChart();
};

init();
