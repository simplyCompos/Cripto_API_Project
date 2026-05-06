// Chart instances
let cryptoChart = null;
let stockChart = null;
let combinedChart = null;

// Color palette
const colors = {
    bitcoin: '#F7931A',
    ethereum: '#627EEA',
    cardano: '#0033AD',
    ripple: '#23292F',
    litecoin: '#345D9D',
    polkadot: '#E6007A',
    solana: '#00D4AA',
    dogecoin: '#BA9F33'
};

const chartColors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
    '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B88B', '#ABEBC6'
];

// Load stats on page load
document.addEventListener('DOMContentLoaded', loadStats);

// Load stats
async function loadStats() {
    try {
        const response = await fetch('/api/stats');
        const data = await response.json();
        
        if (data.status === 'ok') {
            document.getElementById('totalRequests').textContent = data.data.total_requests;
            document.getElementById('cacheHits').textContent = data.data.cache_hits;
            document.getElementById('cacheRate').textContent = 
                data.data.cache_rate.toFixed(1) + '%';
            document.getElementById('avgResponse').textContent = 
                data.data.avg_response_time.toFixed(0) + 'ms';
        }
    } catch (err) {
        console.error('Stats error:', err);
    }
}

// Load Crypto Prices
async function loadCryptoPrices() {
    const coins = document.getElementById('coins').value.trim();
    const days = document.getElementById('days').value;
    const currency = document.getElementById('currency').value;

    if (!coins) {
        showError('cryptoError', 'Please enter at least one cryptocurrency');
        return;
    }

    showLoading('cryptoLoading', true);
    hideMessages();

    try {
        const response = await fetch(
            `/api/prices?coins=${encodeURIComponent(coins)}&days=${days}&currency=${currency}`
        );
        const data = await response.json();

        if (data.status !== 'ok') {
            throw new Error(data.message || 'Failed to load data');
        }

        displayCryptoChart(data.data, currency.toUpperCase());
        displayCryptoTable(data.data, currency.toUpperCase());
        showSuccess('cryptoSuccess', '✅ Cryptocurrency data loaded successfully!');
        loadStats();
    } catch (err) {
        showError('cryptoError', '❌ Error: ' + err.message);
    } finally {
        showLoading('cryptoLoading', false);
    }
}

// Display Crypto Chart
function displayCryptoChart(data, currency) {
    const ctx = document.getElementById('cryptoChart').getContext('2d');
    
    const datasets = [];
    let colorIndex = 0;

    for (let coin in data) {
        if (data[coin].error) continue;
        
        const prices = data[coin];
        const dates = [];
        const values = [];

        prices.forEach(p => {
            const date = new Date(p.time).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            });
            dates.push(date);
            values.push(p.price);
        });

        const color = colors[coin] || chartColors[colorIndex % chartColors.length];
        datasets.push({
            label: coin.toUpperCase() + ` (${currency})`,
            data: values,
            borderColor: color,
            backgroundColor: color + '20',
            borderWidth: 2,
            fill: false,
            tension: 0.4,
            pointBackgroundColor: color,
            pointBorderColor: color,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBorderWidth: 2
        });
        colorIndex++;
    }

    if (cryptoChart) cryptoChart.destroy();

    const baselineDate = new Date();
    baselineDate.setDate(baselineDate.getDate() - parseInt(document.getElementById('days').value));

    cryptoChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: Object.values(data)[0].map(p => 
                new Date(p.time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            ),
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: { color: '#e0e0e0', usePointStyle: true, font: { size: 12 } }
                },
                zoom: {
                    zoom: {
                        wheel: { enabled: true, speed: 0.1 },
                        pinch: { enabled: true },
                        mode: 'x'
                    },
                    pan: {
                        enabled: true,
                        mode: 'x'
                    }
                }
            },
            scales: {
                x: {
                    grid: { color: 'rgba(76, 175, 80, 0.1)' },
                    ticks: { color: '#888' }
                },
                y: {
                    grid: { color: 'rgba(76, 175, 80, 0.1)' },
                    ticks: { color: '#888' }
                }
            }
        }
    });
}

// Display Crypto Table
function displayCryptoTable(data, currency) {
    const tbody = document.querySelector('#cryptoTable tbody');
    tbody.innerHTML = '';

    const tableRows = [];

    for (let coin in data) {
        if (data[coin].error) continue;
        
        data[coin].slice(0, 20).forEach(p => {
            const date = new Date(p.time).toLocaleDateString('en-US');
            const row = `
                <tr>
                    <td>${date}</td>
                    <td>${coin.toUpperCase()}</td>
                    <td>${p.price.toFixed(2)} ${currency}</td>
                    <td>-</td>
                </tr>
            `;
            tableRows.push(row);
        });
    }

    if (tableRows.length > 0) {
        tbody.innerHTML = tableRows.join('');
        document.getElementById('cryptoTable').style.display = 'table';
    }
}

// Load Stock Data
async function loadStockData() {
    const symbol = document.getElementById('symbol').value.trim().toUpperCase();

    if (!symbol) {
        showError('stockError', 'Please enter a stock symbol');
        return;
    }

    showLoading('stockLoading', true);
    hideMessages();

    try {
        const response = await fetch(`/api/stocks?symbol=${encodeURIComponent(symbol)}`);
        const data = await response.json();

        if (data.status !== 'ok') {
            throw new Error(data.message || 'Failed to load data');
        }

        displayStockChart(data.data, data.symbol);
        displayStockTable(data.data, data.symbol);
        showSuccess('stockSuccess', `✅ Stock data for ${data.symbol} loaded!`);
        loadStats();
    } catch (err) {
        showError('stockError', '❌ Error: ' + err.message);
    } finally {
        showLoading('stockLoading', false);
    }
}

// Display Stock Chart
function displayStockChart(data, symbol) {
    const ctx = document.getElementById('stockChart').getContext('2d');
    
    const dates = [];
    const opens = [];
    const highs = [];
    const lows = [];
    const closes = [];

    data.forEach(d => {
        dates.push(new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        opens.push(d.open);
        highs.push(d.high);
        lows.push(d.low);
        closes.push(d.close);
    });

    if (stockChart) stockChart.destroy();

    stockChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [
                {
                    label: symbol + ' - Close',
                    data: closes,
                    borderColor: '#4ECDC4',
                    backgroundColor: '#4ECDC420',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.4,
                    pointRadius: 3
                },
                {
                    label: symbol + ' - High',
                    data: highs,
                    borderColor: '#90EE90',
                    borderWidth: 1,
                    fill: false,
                    borderDash: [5, 5],
                    pointRadius: 2,
                    tension: 0.4
                },
                {
                    label: symbol + ' - Low',
                    data: lows,
                    borderColor: '#FF6B6B',
                    borderWidth: 1,
                    fill: false,
                    borderDash: [5, 5],
                    pointRadius: 2,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: { color: '#e0e0e0', usePointStyle: true, font: { size: 12 } }
                },
                zoom: {
                    zoom: {
                        wheel: { enabled: true, speed: 0.1 },
                        pinch: { enabled: true },
                        mode: 'x'
                    },
                    pan: {
                        enabled: true,
                        mode: 'x'
                    }
                }
            },
            scales: {
                x: {
                    grid: { color: 'rgba(76, 175, 80, 0.1)' },
                    ticks: { color: '#888' }
                },
                y: {
                    grid: { color: 'rgba(76, 175, 80, 0.1)' },
                    ticks: { color: '#888' }
                }
            }
        }
    });
}

// Display Stock Table
function displayStockTable(data, symbol) {
    const tbody = document.querySelector('#stockTable tbody');
    tbody.innerHTML = '';

    data.slice(0, 20).forEach(d => {
        const row = `
            <tr>
                <td>${new Date(d.date).toLocaleDateString('en-US')}</td>
                <td>${d.open.toFixed(2)}</td>
                <td>${d.high.toFixed(2)}</td>
                <td>${d.low.toFixed(2)}</td>
                <td>${d.close.toFixed(2)}</td>
                <td>${(d.volume / 1000000).toFixed(2)}M</td>
            </tr>
        `;
        tbody.innerHTML += row;
    });

    document.getElementById('stockTable').style.display = 'table';
}

// Load Combined Data
async function loadCombinedData() {
    const crypto = document.getElementById('comboCrypto').value.trim().toLowerCase();
    const stock = document.getElementById('comboStock').value.trim().toUpperCase();
    const currency = document.getElementById('comboCurrency').value;

    if (!crypto || !stock) {
        showError('combinedError', 'Please enter both cryptocurrency and stock symbol');
        return;
    }

    showLoading('combinedLoading', true);

    try {
        const response = await fetch(
            `/api/combined?crypto=${encodeURIComponent(crypto)}&stock=${encodeURIComponent(stock)}&currency=${currency}`
        );
        const data = await response.json();

        if (data.status !== 'ok') {
            throw new Error('Failed to load data');
        }

        displayCombinedChart(data.data, crypto, stock, currency);
    } catch (err) {
        showError('combinedError', '❌ Error: ' + err.message);
    } finally {
        showLoading('combinedLoading', false);
    }
}

// Display Combined Chart
function displayCombinedChart(data, crypto, stock, currency) {
    if (!data.crypto || !data.stocks) {
        showError('combinedError', 'Missing data for comparison');
        return;
    }

    const ctx = document.getElementById('combinedChart').getContext('2d');

    const cryptoData = data.crypto.prices || [];
    const stockData = data.stocks.prices || [];

    // Normalize data
    const cryptoPrices = cryptoData.map(p => p.price);
    const cryptoDates = cryptoData.map(p => 
        new Date(p.time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    );

    const stockPrices = stockData.map(p => p.close);
    const stockDates = stockData.map(p =>
        new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    );

    if (combinedChart) combinedChart.destroy();

    combinedChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: cryptoDates,
            datasets: [
                {
                    label: crypto.toUpperCase() + ` (${currency.toUpperCase()})`,
                    data: cryptoPrices,
                    borderColor: '#F7931A',
                    backgroundColor: '#F7931A20',
                    yAxisID: 'y',
                    borderWidth: 2,
                    tension: 0.4
                },
                {
                    label: stock,
                    data: stockPrices.slice(0, cryptoPrices.length),
                    borderColor: '#4ECDC4',
                    backgroundColor: '#4ECDC420',
                    yAxisID: 'y1',
                    borderWidth: 2,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                legend: {
                    labels: { color: '#e0e0e0', usePointStyle: true }
                },
                zoom: {
                    zoom: {
                        wheel: { enabled: true, speed: 0.1 },
                        mode: 'x'
                    },
                    pan: {
                        enabled: true,
                        mode: 'x'
                    }
                }
            },
            scales: {
                x: {
                    grid: { color: 'rgba(76, 175, 80, 0.1)' },
                    ticks: { color: '#888' }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    grid: { color: 'rgba(76, 175, 80, 0.1)' },
                    ticks: { color: '#888' },
                    title: { display: true, text: crypto.toUpperCase(), color: '#e0e0e0' }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    grid: { drawOnChartArea: false },
                    ticks: { color: '#888' },
                    title: { display: true, text: stock, color: '#e0e0e0' }
                }
            }
        }
    });
}

// Utility functions
function showLoading(elementId, show) {
    const element = document.getElementById(elementId);
    if (element) element.style.display = show ? 'block' : 'none';
}

function showError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.style.display = 'block';
    }
}

function showSuccess(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.style.display = 'block';
    }
}

function hideMessages() {
    document.querySelectorAll('.error-message, .success-message').forEach(el => {
        el.style.display = 'none';
    });
}

// Download CSV
function downloadCryptoData() {
    const coins = document.getElementById('coins').value.trim();
    const currency = document.getElementById('currency').value.toUpperCase();
    
    const table = document.querySelector('#cryptoTable');
    const rows = table.querySelectorAll('tbody tr');
    
    if (rows.length === 0) {
        alert('No data to download. Load data first!');
        return;
    }

    let csv = 'Date,Coin,Price,' + currency + '\n';
    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        csv += cells[0].textContent + ',' + cells[1].textContent + ',' + 
               cells[2].textContent + '\n';
    });

    downloadCSV(csv, 'crypto_data.csv');
}

function downloadStockData() {
    const symbol = document.getElementById('symbol').value.toUpperCase();
    const table = document.querySelector('#stockTable');
    const rows = table.querySelectorAll('tbody tr');
    
    if (rows.length === 0) {
        alert('No data to download. Load data first!');
        return;
    }

    let csv = 'Date,Open,High,Low,Close,Volume\n';
    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        csv += Array.from(cells).map(cell => cell.textContent).join(',') + '\n';
    });

    downloadCSV(csv, symbol + '_data.csv');
}

function downloadCSV(csv, filename) {
    const link = document.createElement('a');
    const blob = new Blob([csv], { type: 'text/csv' });
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
}

// Allow Enter key to submit
document.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        if (document.activeElement.id === 'coins' || 
            document.activeElement.id === 'days' ||
            document.activeElement.id === 'currency') {
            loadCryptoPrices();
        } else if (document.activeElement.id === 'symbol') {
            loadStockData();
        }
    }
});
