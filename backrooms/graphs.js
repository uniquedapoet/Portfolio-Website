const csvFile = "data.csv";

let parsedData = null;
let stocks = {};
let globalMinDate = null;
let globalMaxDate = null;
let globalMinValue = null;
let globalMaxValue = null;
let useGlobalMinMax = true; // Default state for using global min/max

// Calculate global date and value ranges for consistent scales
function calculateGlobalRanges(data) {
  const allDates = [];
  const allValues = [];

  data.forEach((stockData) => {
    stockData.forEach((row) => {
      const date = new Date(row.Date);
      const value = parseFloat(row.PortfolioValue);

      if (!isNaN(date) && !isNaN(value)) {
        allDates.push(date);
        allValues.push(value);
      }
    });
  });

  globalMinDate = new Date(Math.min(...allDates));
  globalMaxDate = new Date(Math.max(...allDates));
  globalMinValue = Math.min(...allValues);
  globalMaxValue = Math.max(...allValues);
}

// Treemap data for hierarchical structure
const treemapData = [
  { name: "AMZN", value: 54705.79, sector: "Consumer Cyclical" },
  { name: "EL", value: 3314.78, sector: "Consumer Defensive" },
  { name: "JNJ", value: 15098.49, sector: "Healthcare" },
  { name: "MCD", value: 32722.79, sector: "Consumer Cyclical" },
  { name: "META", value: 40858.68, sector: "Communication Services" },
  { name: "PARA", value: 3500.76, sector: "Communication Services" },
  { name: "PAYC", value: 64480.13, sector: "Technology" },
  { name: "PG", value: 22187.0, sector: "Consumer Defensive" },
  { name: "TGT", value: 20765.52, sector: "Consumer Defensive" },
  { name: "WMT", value: 33005.53, sector: "Consumer Defensive" },
];

// Convert treemap data to hierarchical format
const hierarchicalData = treemapData.reduce((acc, item) => {
  const sectorIndex = acc.findIndex((group) => group.id === item.sector);
  if (sectorIndex === -1) {
    acc.push({
      id: item.sector,
      name: item.sector,
      color: Highcharts.getOptions().colors[acc.length + 1],
    });
  }
  acc.push({
    parent: item.sector,
    name: item.name,
    value: item.value,
  });
  return acc;
}, []);

// Filter data by date range and stock name
function filterDataByDateAndStock(startDate, endDate, selectedStock = "all") {
  const filteredStocks = {};
  Object.keys(stocks).forEach((stockName) => {
    if (selectedStock !== "all" && stockName !== selectedStock) return;

    filteredStocks[stockName] = stocks[stockName].filter((row) => {
      const rowDate = new Date(row.Date);
      return (
        (!startDate || rowDate >= startDate) && (!endDate || rowDate <= endDate)
      );
    });
  });
  return filteredStocks;
}

// Update the line chart with dual-axis
function updateChart(filteredStocks, stockName = null) {
  const seriesData = [];
  let stockPriceData = null;

  Object.keys(filteredStocks).forEach((stockName) => {
    const stockData = filteredStocks[stockName];
    seriesData.push({
      name: `${stockName} Portfolio Value`,
      data: stockData.map((row) => parseFloat(row.PortfolioValue)),
      yAxis: 0, // Use the first y-axis
    });
  });

  // Add stock price series if a stock is selected
  if (stockName && stocks[stockName]) {
    stockPriceData = stocks[stockName].map((row) =>
      parseFloat(row.StockPrice)
    ); // Ensure "StockPrice" column exists

    seriesData.push({
      name: `${stockName} Stock Price`,
      data: stockPriceData,
      yAxis: 1, // Use the second y-axis
      tooltip: { valuePrefix: "$" },
    });
  }

  Highcharts.chart("portfolio-chart", {
    chart: { type: "line" },
    title: { text: "Portfolio Value and Stock Price" },
    xAxis: {
      title: { text: "Date" },
      categories:
        Object.values(filteredStocks)[0]?.map((row) => row.Date) || [],
      labels: { rotation: 90 },
    },
    yAxis: [
      {
        title: { text: "Portfolio Value ($)" },
        min: useGlobalMinMax ? globalMinValue : null,
        max: useGlobalMinMax ? globalMaxValue : null,
        opposite: false,
      },
      {
        title: { text: "Stock Price ($)" },
        opposite: true, // Stock price axis on the right side
      },
    ],
    tooltip: { shared: true, crosshairs: true },
    series: seriesData,
  });
}

// Update the treemap
function updateTreemap() {
  Highcharts.chart("treemap-container", {
    chart: { type: "treemap" },
    title: { text: "Final Portfolio Value Breakdown by Sector and Stock" },
    series: [
      {
        type: "treemap",
        layoutAlgorithm: "squarified",
        levels: [
          {
            level: 1,
            dataLabels: {
              enabled: true,
              align: "left",
              verticalAlign: "top",
              style: {
                fontSize: "16px",
                fontWeight: "bold",
                textOutline: "none",
              },
              padding: 5,
            },
            borderWidth: 3,
          },
          {
            level: 2,
            dataLabels: {
              enabled: true,
              format: "{point.name}: ${point.value:.2f}",
              style: { fontSize: "12px" },
            },
            borderWidth: 1,
          },
        ],
        data: hierarchicalData,
        events: {
          click: function (event) {
            const stockName = event.point.name;
            if (stocks[stockName]) {
              const filteredStocks = { [stockName]: stocks[stockName] };
              updateChart(filteredStocks, stockName); // Pass stockName for stock price
            }
          },
        },
      },
    ],
    tooltip: { pointFormat: "<b>{point.name}</b>: ${point.value:.2f}" },
  });
}

// Parse CSV and initialize charts
Papa.parse(csvFile, {
  download: true,
  header: true,
  complete: function (results) {
    parsedData = results.data;
    stocks = {};
    parsedData.forEach((row) => {
      const stockName = row.StockName;
      if (!stocks[stockName]) stocks[stockName] = [];
      stocks[stockName].push(row);
    });

    calculateGlobalRanges(Object.values(stocks));
    updateChart(stocks);
    updateTreemap();
  },
});

// Event listeners for controls
document.getElementById("update-chart").addEventListener("click", () => {
  const startDateInput = document.getElementById("start-date").value;
  const endDateInput = document.getElementById("end-date").value;
  const startDate = startDateInput ? new Date(startDateInput) : null;
  const endDate = endDateInput ? new Date(endDateInput) : null;
  const filteredStocks = filterDataByDateAndStock(startDate, endDate);
  calculateGlobalRanges(Object.values(filteredStocks));
  updateChart(filteredStocks);
});

document.getElementById("reset-chart").addEventListener("click", () => {
  document.getElementById("start-date").value = "";
  document.getElementById("end-date").value = "";
  updateChart(stocks);
});

document
  .getElementById("toggle-global-min-max")
  .addEventListener("click", () => {
    useGlobalMinMax = !useGlobalMinMax;

    calculateGlobalRanges(Object.values(stocks));
    updateChart(stocks);

    const button = document.getElementById("toggle-global-min-max");
    button.textContent = useGlobalMinMax
      ? "Disable Global Min/Max"
      : "Enable Global Min/Max";
  });
