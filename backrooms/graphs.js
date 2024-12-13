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
// Parent Node
// color: "#544fc5"
// id : "Consumer Cyclical"
// name : "Consumer Cyclical"

// Child Node
// name : "AMZN"
// parent : "Consumer Cyclical"
// value : 54705.79
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

// Function to create and update the line graph
function updateChart(filteredStocks, stockName = null) {
  // Initialize an array to hold the data series for the chart
  const seriesData = [];
  let stockPriceData = null; // Variable to hold stock price data if a specific stock is selected

  // Loop through the filteredStocks
  Object.keys(filteredStocks).forEach((stockName) => {
    const stockData = filteredStocks[stockName]; // Extract data for the current stock
    seriesData.push({
      name: `${stockName} Portfolio Value`,
      data: stockData.map((row) => parseFloat(row.PortfolioValue)), // Extract and parse portfolio values
      yAxis: 0, // Use left y-axis
    });
  });

  // If a specific stock is selected and its data exists
  if (stockName && stocks[stockName]) {
    // Extract and parse stock price data
    stockPriceData = stocks[stockName].map((row) => parseFloat(row.StockPrice));

    // Add the stock price data as a new series
    seriesData.push({
      name: `${stockName} Stock Price`, // Label for the stock price series
      data: stockPriceData, // Stock price values
      yAxis: 1, // Use right y-axis
      tooltip: { valuePrefix: "$" }, // Add a dollar sign prefix to the tooltip values
    });
  }

  // Configure and render the Highcharts chart
  Highcharts.chart("portfolio-chart", {
    chart: { type: "line" }, // Specify the chart type as a line chart
    title: { text: "Portfolio Value and Stock Price" }, // Chart title
    xAxis: {
      title: { text: "Date" }, // Label for the x-axis
      categories:
        Object.values(filteredStocks)[0]?.map((row) => row.Date) || [], // Extract dates for the x-axis
      labels: { rotation: 90 }, // Rotate x-axis labels for better visibility
    },
    yAxis: [
      {
        title: { text: "Portfolio Value ($)" }, // Title for the first y-axis
        min: useGlobalMinMax ? globalMinValue : null, // Use global min value if enabled
        max: useGlobalMinMax ? globalMaxValue : null, // Use global max value if enabled
        opposite: false, // Place this axis on the left side
      },
      {
        title: { text: "Stock Price ($)" }, // Title for the second y-axis
        opposite: true, // Place this axis on the right side
      },
    ],
    tooltip: { shared: false, crosshairs: true},
    series: seriesData, // Add the prepared data series to the chart
  });
}

console.log(hierarchicalData);

// Update the treemap
function createTreemap() {
  Highcharts.chart("treemap-container", {
    chart: { type: "treemap" }, // Define the chart type as treemap
    title: { text: "Holding Market Value By Industry" }, // Chart title
    series: [
      {
        type: "treemap", // Define series type as treemap for hierarchical data
        layoutAlgorithm: "squarified", // Algorithm to arrange the treemap tiles
        levels: [
          {
            level: 1, // Configuration for parent nodes (sectors)
            dataLabels: {
              enabled: true, // Enable data labels for sectors
              align: "left", // Align data labels to the left
              verticalAlign: "top", // Align data labels to the top
              style: {
                fontSize: "16px", // Font size for sector labels
                fontWeight: "bold", // Bold sector labels
                textOutline: "none", // Remove text outline for cleaner look
              },
              padding: 5, // Add padding around sector labels
            },
            borderWidth: 3, // Border width for sector tiles
          },
          {
            level: 2, // Configuration for child nodes (stocks)
            dataLabels: {
              enabled: true, // Enable data labels for stocks
              format: "{point.name}: ${point.value:.2f}", // Format labels to show stock name and value
              style: { fontSize: "12px" }, // Font size for stock labels
            },
            borderWidth: 1, // Border width for stock tiles
          },
        ],
        data: hierarchicalData, // Data for the treemap (sector and stock hierarchy)
        events: {
          click: function (event) {
            const stockName = event.point.name; // Capture the stock name from the clicked point
            if (stocks[stockName]) {
              const filteredStocks = { [stockName]: stocks[stockName] }; // Filter data for the selected stock
              updateChart(filteredStocks, stockName); // Update the chart with the selected stock
            }
          },
        },
      },
    ],
    tooltip: { pointFormat: "<b>{point.name}</b>: ${point.value:.2f}" }, // Tooltip format showing stock name and value
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
    createTreemap();
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
