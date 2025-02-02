
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
          <td><button class="stock-button" data-stock="${stockName}">${stockName}</button></td>
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
      createTreemap();
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
        tickInterval: 22, 
        labels: {
          formatter: function () {
            const date = new Date(this.value);
            return date.toLocaleString("default", { month: "short" });
          }
        }
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
  