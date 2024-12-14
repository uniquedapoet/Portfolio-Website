const csvFile = "data.csv";

let parsedData = null;
let stocks = {};
let globalMinDate = null;
let globalMaxDate = null;
let globalMinValue = null;
let globalMaxValue = null;
let useGlobalMinMax = true; 

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
    tooltip: { shared: false, crosshairs: true },
    series: seriesData, // Add the prepared data series to the chart
  });
}

console.log(hierarchicalData);

// Update the treemap
function createTreemap() {
  Highcharts.chart("treemap-container", {
    chart: { type: "treemap" }, // Define the chart type as treemap
    title:  null , // Chart title
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
                fontSize: "14px", // Font size for sector labels
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
    // Safely initialize both charts
    try {
      updateChart(stocks);
    } catch (error) {
      console.error("Error updating chart:", error);
    }

    try {
      createTreemap();
    } catch (error) {
      console.error("Error creating treemap:", error);
    }
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

document.addEventListener("DOMContentLoaded", () => {
  const csvFile = "data.csv"; // Path to your CSV file
  const tableBody = document.getElementById("stock-table-body");
  const totalMarketValueElement = document.getElementById("total-market-value");
  const todaysChangeElement = document.getElementById("todays-change");
  const unrealizedGainElement = document.getElementById("unrealized-gain");

  // Function to calculate market value
  function calculateMarketValue(units, currentPrice) {
    return units * currentPrice;
  }

  // Function to update the total market value
  function updateTotalMarketValue(groupedData) {
    let totalMarketValue = 0;

    // Iterate over grouped data and calculate the total market value
    Object.keys(groupedData).forEach((stockName) => {
      const stockData = groupedData[stockName];
      const lastEntry = stockData[stockData.length - 1]; // Use the latest entry for each stock
      const units = parseFloat(lastEntry.SharesHeld || 0);
      const currentPrice = parseFloat(lastEntry.StockPrice || 0);
      totalMarketValue += calculateMarketValue(units, currentPrice);
    });

    totalMarketValueElement.textContent = totalMarketValue.toLocaleString(
      undefined,
      { minimumFractionDigits: 2, maximumFractionDigits: 2 }
    );
    unrealizedGainElement.textContent = '$'+(totalMarketValue - Object.keys(groupedData).length * 10000).toFixed(2);
  }

  function updateTodaysChange(groupedData) {
    let dailyChangeMonetary = 0;
    let totalPreviousMarketValue = 0;
  
    // Iterate over grouped data and calculate the total market value
    Object.keys(groupedData).forEach((stockName) => {
      const stockData = groupedData[stockName];
      const lastEntry = stockData[stockData.length - 1]; // Latest entry for each stock
      const units = parseFloat(lastEntry.SharesHeld || 0);
      const currentPrice = parseFloat(lastEntry.StockPrice || 0);
      const marketValue = calculateMarketValue(units, currentPrice);
  
      const previousPrice = parseFloat(stockData[stockData.length - 2]?.StockPrice || 0);
      const previousMarketValue = calculateMarketValue(units, previousPrice);
  
      if (previousMarketValue) { // Avoid division by zero
        const dailyChange = marketValue - previousMarketValue;
        dailyChangeMonetary += dailyChange;
        totalPreviousMarketValue += previousMarketValue;
      }
    });
  
    // Calculate daily change percentage
    const dailyChangePercentage = totalPreviousMarketValue
      ? (dailyChangeMonetary / totalPreviousMarketValue) * 100
      : 0;
    
    const arrow = dailyChangeMonetary > 0 
    ? '<span style="color: green;">▲</span>' // Green up arrow
    : dailyChangeMonetary < 0
    ? '<span style="color: red;">▼</span>'   // Red down arrow
    : '';

    // Update the DOM
    todaysChangeElement.innerHTML = `
    ${dailyChangeMonetary >= 0 ? "+" : ""}${dailyChangeMonetary.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} (${dailyChangePercentage.toFixed(2)}%) 
    ${arrow}
    `;

    
  }
  

  // Function to populate the table
  function populateTable(data) {
    // Group data by StockName
    const groupedData = data.reduce((acc, row) => {
      const stockName = row.StockName;
      if (!acc[stockName]) acc[stockName] = [];
      acc[stockName].push(row);
      return acc;
    }, {});
    console.log("Grouped Data:", groupedData);

    // Iterate over grouped data
    Object.keys(groupedData).forEach((stockName, index) => {
      const stockData = groupedData[stockName];
      const firstEntry = stockData[0]; // Use the first row as a reference
      const industry = firstEntry.Sector;
      const units = parseFloat(stockData[stockData.length - 1].SharesHeld); // Latest price
      const currentPrice = parseFloat(
        stockData[stockData.length - 1].StockPrice
      ); // Latest price
      const marketValue = calculateMarketValue(units, currentPrice);

      // Create a new row
      const tr = document.createElement("tr");

      const todayChange = (
        currentPrice - parseFloat(stockData[stockData.length - 2].StockPrice)
      ).toFixed(2);
      
      const gainLoss = (
        (marketValue - 10000) / 100
      ).toFixed(2);
      
      // Calculate total market value
      let totalMarketValue = 0;

      // Iterate over grouped data and calculate the total market value
      Object.keys(groupedData).forEach((stockName) => {
        const stockData = groupedData[stockName];
        const lastEntry = stockData[stockData.length - 1]; // Use the latest entry for each stock
        const units = parseFloat(lastEntry.SharesHeld || 0);
        const currentPrice = parseFloat(lastEntry.StockPrice || 0);
        totalMarketValue += calculateMarketValue(units, currentPrice);
      });

      // Inside the row generation loop
      const percentageOfTotal = ((marketValue / totalMarketValue) * 100).toFixed(2);

      // Determine arrow color based on todayChange
      const arrow = todayChange > 0 
        ? '<span style="color: green;">▲</span>' // Green up arrow
        : todayChange < 0
        ? '<span style="color: red;">▼</span>'   // Red down arrow
        : ''; // No arrow for zero change
    
      
        tr.innerHTML = `
        <td>${stockName}</td>
        <td>${industry}</td>
        <td>${units.toFixed(2)}</td>
        <td>$${currentPrice.toFixed(2)}</td>
        <td style="
          background: linear-gradient(to right, #3b5f7f ${percentageOfTotal}%, #f4f4f4 ${percentageOfTotal}%);
          text-align: right;
          padding-right: 10px;
          color: #000;
          height: 40px; /* Fix the cell height */
          line-height: 40px; /* Vertically center text */
        ">
          $${marketValue.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </td>
        <td>$${todayChange} ${arrow}</td>
        <td>${gainLoss}%</td>
        <td style="height: 40px;"><div id="chart-${index}" style="width: 200px; height: 40px;"></div></td>
      `;
      

      

      // Append the row to the table body
      tableBody.appendChild(tr);

      // Generate the graph for the last column
      const chartContainer = document.getElementById(`chart-${index}`);
      const chartData = stockData.slice(-256); // Get the last 256 rows
      if (chartContainer) {
        Highcharts.chart(chartContainer, {
          chart: {
            type: "line",
            height: 45, // Set fixed chart height to fit smaller container
            width: 200,  // Set fixed chart width to fit smaller container
          },
          title: { text: null }, // No title to save space
          xAxis: {
            categories: chartData.map((row) => row.Date),
            visible: false, // Hide x-axis labels
          },
          yAxis: {
            visible: false, 

          },
          series: [
            {
              name: "Stock Price",
              data: chartData.map((row) => parseFloat(row.StockPrice)),
              borderColor: "#3b5f7f",
              lineWidth: 1, // Thinner lines for smaller chart
            },
          ],
          credits: { enabled: false }, // Disable Highcharts credits
          legend: { enabled: false }, // Hide legend
          exporting: { enabled: false }, // Disable the dropdown menu
          tooltip: { enabled: false }, // Disable tooltip
          hover: { enabled: false }, // Disable chart interaction
        });        
      } else {
        console.error(`Chart container #chart-${index} not found.`);
      }
    });

    // Update the total market value after populating the table
    updateTotalMarketValue(groupedData);
    updateTodaysChange(groupedData);
    createStockChart(); // Defaults to TOTAL

  }

  // Parse the CSV file using Papa Parse
  Papa.parse(csvFile, {
    download: true,
    header: true, // Treat the first row as column headers
    skipEmptyLines: true, // Skip empty rows
    complete: function (results) {
      const parsedData = results.data;
      console.log("Parsed Data:", parsedData); // Debugging output
      populateTable(parsedData);
    },
    error: function (error) {
      console.error("Error parsing CSV:", error);
    },
  });
});


function createStockChart(stockName = "TOTAL") {
  let dataToPlot;

  if (stockName === "TOTAL") {
    // Calculate total portfolio value over time
    const dateMap = new Map();

    Object.keys(stocks).forEach((stock) => {
      stocks[stock].forEach((row) => {
        const date = row.Date;
        const portfolioValue = parseFloat(row.PortfolioValue);

        if (!dateMap.has(date)) {
          dateMap.set(date, 0);
        }
        dateMap.set(date, dateMap.get(date) + portfolioValue);
      });
    });

    // Convert Map to sorted array for plotting
    const totalPortfolioData = Array.from(dateMap.entries())
      .sort((a, b) => new Date(a[0]) - new Date(b[0])) // Sort by date
      .map(([date, totalValue]) => ({
        date,
        totalValue,
      }));

    dataToPlot = {
      title: "Total Portfolio Value Over Time",
      xAxisCategories: totalPortfolioData.map((item) => item.date).slice(-256),
      seriesData: totalPortfolioData.map((item) => item.totalValue).slice(-256),
    };
  } else {
    // Plot single stock
    if (!stocks[stockName] || stocks[stockName].length === 0) {
      console.error(`No data available for stock: ${stockName}`);
      return;
    }

    const stockData = stocks[stockName].slice(-256); // Use the last 256 entries

    dataToPlot = {
      title: `${stockName} Stock Price`,
      xAxisCategories: stockData.map((row) => row.Date),
      seriesData: stockData.map((row) => parseFloat(row.StockPrice)),
    };
  }

  // Render the chart using Highcharts
  Highcharts.chart("stock-chart", {
    chart: { type: "line" },
    title: { text: dataToPlot.title },
    xAxis: {
      categories: dataToPlot.xAxisCategories,
      tickInterval: 30, 
    },
    yAxis: {
      title: { text: stockName === "TOTAL" ? "Portfolio Value ($)" : "Stock Price ($)" },
    },
    series: [
      {
        name: stockName === "TOTAL" ? "Total Portfolio Value" : `${stockName} Stock Price`,
        data: dataToPlot.seriesData,
      },
    ],
    legend: { enabled: false }, // Hide legend
  });
}


// Render stock-specific chart when a button is clicked
document.addEventListener("click", (event) => {
  if (event.target && event.target.classList.contains("stock-button")) {
    const stockName = event.target.dataset.stock;
    console.log("Stock Name:", stockName);
    createStockChart(stockName);
  }
});
