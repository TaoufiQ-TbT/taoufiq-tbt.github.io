document.addEventListener("DOMContentLoaded", () => {
    const smokeBtn = document.getElementById("smokeBtn");
    const intervalSelector = document.getElementById("interval");
    const evolutionChartCtx = document.getElementById("evolutionChart").getContext("2d");
    const boxPlotChartCtx = document.getElementById("boxPlotChart").getContext("2d");
    const historyList = document.getElementById("historyList");

    const costPerCigarette = 8.5 / 20; // CHF per cigarette

    // Fetch JSON data from GitHub repository
    const fetchData = async () => {
        try {
            const response = await fetch('https://raw.githubusercontent.com/taoufiq-tbt/taoufiq-tbt.github.io/main/data.json');
            if (!response.ok) throw new Error("Could not fetch data.json");
            const jsonData = await response.json();
            localStorage.setItem("smokeData", JSON.stringify(jsonData));
            return jsonData;
        } catch (error) {
            console.error("Error fetching data:", error);
            return [];
        }
    };

    // Initialize smokeData from fetch or localStorage
    let smokeData = JSON.parse(localStorage.getItem("smokeData")) || [];
    fetchData().then(fetchedData => {
        smokeData = fetchedData;
        updateCharts();
        updateHistory();
    });

    // Save new smoking event with date and time
    smokeBtn.addEventListener("click", () => {
        const now = new Date();
        smokeData.push(now.toISOString());
        localStorage.setItem("smokeData", JSON.stringify(smokeData));
        updateCharts();
        updateHistory();
    });

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
