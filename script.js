document.addEventListener("DOMContentLoaded", () => {
    const smokeBtn = document.getElementById("smokeBtn");
    const intervalSelector = document.getElementById("interval");
    const evolutionChartCtx = document.getElementById("evolutionChart").getContext("2d");
    const boxPlotChartCtx = document.getElementById("boxPlotChart").getContext("2d");
    const historyList = document.getElementById("historyList");

    const costPerCigarette = 8.5 / 20; // CHF per cigarette

    // Load data from localStorage or initialize an empty array
    let smokeData = JSON.parse(localStorage.getItem("smokeData")) || [];

    // Save new smoking event with date and time
    smokeBtn.addEventListener("click", () => {
        const now = new Date();
        smokeData.push(now.toISOString());
        localStorage.setItem("smokeData", JSON.stringify(smokeData));
        updateCharts();
        updateHistory();
    });

    // Create the evolution chart
    let evolutionChart = new Chart(evolutionChartCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Cigarettes Smoked',
                data: [],
                borderColor: 'rgb(255, 99, 132)',
                fill: false
            }]
        }
    });

    // Create the box plot chart with dual y-axes
    let boxPlotChart = new Chart(boxPlotChartCtx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Total Cigarettes per Day',
                    data: [],
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: 'rgb(54, 162, 235)',
                    borderWidth: 1,
                    yAxisID: 'yCigarettes'
                },
                {
                    label: 'Total Spent in CHF',
                    data: [],
                    type: 'line',
                    borderColor: 'rgba(255, 159, 64, 1)',
                    backgroundColor: 'rgba(255, 159, 64, 0.2)',
                    fill: false,
                    yAxisID: 'yCHF'
                }
            ]
        },
        options: {
            scales: {
                yCigarettes: {
                    type: 'linear',
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Cigarettes'
                    }
                },
                yCHF: {
                    type: 'linear',
                    position: 'right',
                    title: {
                        display: true,
                        text: 'CHF'
                    },
                    ticks: {
                        beginAtZero: true
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Days'
                    }
                }
            }
        }
    });

    intervalSelector.addEventListener("change", updateCharts);

    // Update charts based on selected interval
    function updateCharts() {
        const interval = intervalSelector.value;
        const filteredData = filterDataByInterval(smokeData, interval);
        const groupedData = groupDataByDay(filteredData);

        // Prepare data for cigarettes and price
        const dailyCounts = Object.values(groupedData);
        const totalCost = dailyCounts.map(count => count * costPerCigarette);

        // Update evolution chart
        evolutionChart.data.labels = Object.keys(groupedData);
        evolutionChart.data.datasets[0].data = dailyCounts;
        evolutionChart.update();

        // Update box plot chart with dual y-axes
        boxPlotChart.data.labels = Object.keys(groupedData);
        boxPlotChart.data.datasets[0].data = dailyCounts; // Cigarettes per day
        boxPlotChart.data.datasets[1].data = totalCost; // Total cost in CHF
        boxPlotChart.update();
    }

    // Update history list
    function updateHistory() {
        historyList.innerHTML = ''; // Clear current list
        smokeData.forEach((timestamp, index) => {
            const listItem = document.createElement('li');
            const date = new Date(timestamp);
            listItem.textContent = `${date.toLocaleString()}`;
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Delete';
            deleteBtn.addEventListener('click', () => {
                smokeData.splice(index, 1);
                localStorage.setItem("smokeData", JSON.stringify(smokeData));
                updateCharts();
                updateHistory();
            });
            listItem.appendChild(deleteBtn);
            historyList.appendChild(listItem);
        });
    }

    // Filter data by interval
    function filterDataByInterval(data, interval) {
        const now = new Date();
        return data.filter(dateStr => {
            const date = new Date(dateStr);
            if (interval === 'day') return now - date < 24 * 60 * 60 * 1000;
            if (interval === 'week') return now - date < 7 * 24 * 60 * 60 * 1000;
            if (interval === 'month') return now - date < 30 * 24 * 60 * 60 * 1000;
            return true;
        });
    }

    // Group data by day
    function groupDataByDay(data) {
        const grouped = {};
        data.forEach(dateStr => {
            const date = new Date(dateStr);
            const day = date.toISOString().split('T')[0];
            grouped[day] = (grouped[day] || 0) + 1;
        });
        return grouped;
    }

    updateCharts();
    updateHistory();
});