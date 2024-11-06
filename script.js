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
            const response = await fetch('https://raw.githubusercontent.com/yourusername/yourrepository/main/data.json');
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

    // Function to update charts and history
    const updateCharts = () => { /* Chart updating logic */ };
    const updateHistory = () => { /* History updating logic */ };

    // Other functions as needed, like filterDataByInterval, groupDataByDay, etc.
});
