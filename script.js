document.addEventListener("DOMContentLoaded", function () {
  const tableBody = document.querySelector(".container tbody");
  const tabContainer = document.getElementById("tabContainer");

  // Initial unsorted file list
  let files = [
    "data-2022-GE.json",
    "data-2020-GE.json",
    "data-10-31-2024.json",
    "data-11-01-2024.json",
    "data-11-02-2024.json",
    "data-11-03-2024.json",
    "data-11-04-2024.json",
  ];

  // Single sorting function for date-based and GE files
  function sortFiles(files) {
    const geFiles = files.filter((file) => file.includes("GE"));
    const dateFiles = files
      .filter((file) => /\d{2}-\d{2}-\d{4}/.test(file))
      .map((file) => {
        const [month, day, year] = file
          .match(/\d{2}-\d{2}-\d{4}/)[0]
          .split("-");
        return { filename: file, date: new Date(year, month - 1, day) };
      })
      .sort((a, b) => b.date - a.date) // Sort in descending order
      .map((fileObj) => fileObj.filename); // Map back to filenames

    return [...dateFiles, ...geFiles];
  }

  // Sort files initially and store them in sortedFiles
  const sortedFiles = sortFiles(files);

  // Function to create tabs based on sorted files
  function createTabs() {
    sortedFiles.forEach((file, index) => {
      const dateMatch = file.match(/\d{2}-\d{2}-\d{4}/);
      const label = dateMatch
        ? dateMatch[0]
        : file.replace("data-", "").replace(".json", "");
      const tab = document.createElement("button");
      tab.classList.add("tab");
      tab.innerText = label;
      if (index === 0) tab.classList.add("active");
      tab.onclick = () => loadReport(file, label, index);
      tabContainer.appendChild(tab);
    });
  }

  function loadReport(file, label, fileIndex) {
    document
      .querySelectorAll(".tab")
      .forEach((tab) => tab.classList.remove("active"));
    const activeTab = Array.from(document.querySelectorAll(".tab")).find(
      (tab) => tab.innerText === label
    );
    activeTab.classList.add("active");

    fetch(file)
      .then((response) => response.json())
      .then((data) => {
        tableBody.innerHTML = "";
        const totals = data.find((entry) => entry.County === "TOTAL");

        // Fetch previous report data if available
        if (
          fileIndex + 1 < sortedFiles.length &&
          !sortedFiles[fileIndex + 1].includes("GE")
        ) {
          fetch(sortedFiles[fileIndex + 1])
            .then((response) => response.json())
            .then((prevDataArray) => {
              const prevTotals = prevDataArray.find(
                (entry) => entry.County === "TOTAL"
              );
              insertTotalsRowWithDiff(totals, prevTotals);

              const prevDataMap = {};
              prevDataArray.forEach((entry) => {
                prevDataMap[entry.County] = entry;
              });

              const countyRows = data.filter(
                (entry) => entry.County !== "TOTAL"
              );
              countyRows.sort((a, b) => a.County.localeCompare(b.County));
              countyRows.forEach((row) => {
                const prevRow = prevDataMap[row.County] || null;
                insertRowWithDiff(row, prevRow);
              });
            });
        } else {
          insertTotalsRowWithDiff(totals, null);
          const countyRows = data.filter((entry) => entry.County !== "TOTAL");
          countyRows.sort((a, b) => a.County.localeCompare(b.County));
          countyRows.forEach((row) => insertRowWithDiff(row, null));
        }
      })
      .catch((error) => console.error("Error loading data:", error));
  }

  function insertTotalsRowWithDiff(totals, prevTotals) {
    const totalsRow = document.createElement("tr");
    totalsRow.classList.add("totals-row");

    function formatCell(value, prevValue) {
      if (prevValue === null) return `${value.toLocaleString()}`;
      const diff = value - prevValue;
      const diffDisplay =
        diff > 0 ? `+${diff.toLocaleString()}` : diff.toLocaleString();
      return `${value.toLocaleString()}<br><span style="font-size: 0.85em; color: ${diff >= 0 ? "green" : "red"};">(${diffDisplay})</span>`;
    }

    function formatCellWithPercentage(value, prevValue) {
      if (prevValue === null) return `${value.toFixed(2)}%`;
      const diff = value - prevValue;
      const diffDisplay =
        diff > 0 ? `+${diff.toFixed(2)}` : `${diff.toFixed(2)}`;
      return `${value.toFixed(
        2
      )}%<br><span style="font-size: 0.85em; color: ${diff >= 0 ? "green" : "red"};">(${diffDisplay})</span>`;
    }

    totalsRow.innerHTML = `
      <td><strong>Totals</strong></td>
      <td>${formatCell(
        totals.Total_Approved,
        prevTotals ? prevTotals.Total_Approved : null
      )}</td>
      <td>${formatCell(
        totals.Total_Returned,
        prevTotals ? prevTotals.Total_Returned : null
      )}</td>
      <td>${formatCell(
        totals.Raw_Dem_Approved,
        prevTotals ? prevTotals.Raw_Dem_Approved : null
      )}</td>
      <td>${formatCell(
        totals.Raw_Rep_Approved,
        prevTotals ? prevTotals.Raw_Rep_Approved : null
      )}</td>
      <td>${formatCell(
        totals.Raw_Oth_Approved,
        prevTotals ? prevTotals.Raw_Oth_Approved : null
      )}</td>
      <td>${formatCell(
        totals.Raw_Dem_Returned,
        prevTotals ? prevTotals.Raw_Dem_Returned : null
      )}</td>
      <td>${formatCell(
        totals.Raw_Rep_Returned,
        prevTotals ? prevTotals.Raw_Rep_Returned : null
      )}</td>
      <td>${formatCell(
        totals.Raw_Oth_Returned,
        prevTotals ? prevTotals.Raw_Oth_Returned : null
      )}</td>
      <td>${formatCellWithPercentage(
        totals.Request_Share_Dem,
        prevTotals ? prevTotals.Request_Share_Dem : null
      )}</td>
      <td>${formatCellWithPercentage(
        totals.Request_Share_Rep,
        prevTotals ? prevTotals.Request_Share_Rep : null
      )}</td>
      <td>${formatCellWithPercentage(
        totals.Return_Share_Dem,
        prevTotals ? prevTotals.Return_Share_Dem : null
      )}</td>
      <td>${formatCellWithPercentage(
        totals.Return_Share_Rep,
        prevTotals ? prevTotals.Return_Share_Rep : null
      )}</td>
    `;
    tableBody.prepend(totalsRow);
  }

  function insertRowWithDiff(row, prevData) {
    const tr = document.createElement("tr");

    function formatCell(value, prevValue) {
      if (prevValue === null) return `${value.toLocaleString()}`;
      const diff = value - prevValue;
      const diffDisplay =
        diff > 0 ? `+${diff.toLocaleString()}` : diff.toLocaleString();
      return `${value.toLocaleString()}<br><span style="font-size: 0.85em; color: ${diff >= 0 ? "green" : "red"};">(${diffDisplay})</span>`;
    }

    function formatCellWithPercentage(value, prevValue) {
      if (prevValue === null) return `${value.toFixed(2)}%`;
      const diff = value - prevValue;
      const diffDisplay =
        diff > 0 ? `+${diff.toFixed(2)}` : `${diff.toFixed(2)}`;
      return `${value.toFixed(
        2
      )}%<br><span style="font-size: 0.85em; color: ${diff >= 0 ? "green" : "red"};">(${diffDisplay})</span>`;
    }

    tr.innerHTML = `
      <td>${row.County}</td>
      <td>${formatCell(
        row.Total_Approved,
        prevData ? prevData.Total_Approved : null
      )}</td>
      <td>${formatCell(
        row.Total_Returned,
        prevData ? prevData.Total_Returned : null
      )}</td>
      <td>${formatCell(
        row.Raw_Dem_Approved,
        prevData ? prevData.Raw_Dem_Approved : null
      )}</td>
      <td>${formatCell(
        row.Raw_Rep_Approved,
        prevData ? prevData.Raw_Rep_Approved : null
      )}</td>
      <td>${formatCell(
        row.Raw_Oth_Approved,
        prevData ? prevData.Raw_Oth_Approved : null
      )}</td>
      <td>${formatCell(
        row.Raw_Dem_Returned,
        prevData ? prevData.Raw_Dem_Returned : null
      )}</td>
      <td>${formatCell(
        row.Raw_Rep_Returned,
        prevData ? prevData.Raw_Rep_Returned : null
      )}</td>
      <td>${formatCell(
        row.Raw_Oth_Returned,
        prevData ? prevData.Raw_Oth_Returned : null
      )}</td>
      <td>${formatCellWithPercentage(
        row.Request_Share_Dem,
        prevData ? prevData.Request_Share_Dem : null
      )}</td>
      <td>${formatCellWithPercentage(
        row.Request_Share_Rep,
        prevData ? prevData.Request_Share_Rep : null
      )}</td>
      <td>${formatCellWithPercentage(
        row.Return_Share_Dem,
        prevData ? prevData.Return_Share_Dem : null
      )}</td>
      <td>${formatCellWithPercentage(
        row.Return_Share_Rep,
        prevData ? prevData.Return_Share_Rep : null
      )}</td>
    `;
    tableBody.appendChild(tr);
  }

  // Initialize tabs and load the most recent report
  createTabs();
  loadReport(
    sortedFiles[0],
    sortedFiles[0].match(/\d{2}-\d{2}-\d{4}/)
      ? sortedFiles[0].match(/\d{2}-\d{2}-\d{4}/)[0]
      : sortedFiles[0].replace("data-", "").replace(".json", ""),
    0
  );
});

let dateFiles = [];

// Define dateFiles at a global level
document.addEventListener("DOMContentLoaded", function () {
  const tableBody = document.querySelector(".container tbody");
  const tabContainer = document.getElementById("tabContainer");
  const dailySummaryContainer = document.getElementById(
    "dailySummaryContainer"
  ); // Moved inside DOMContentLoaded

  let files = [
    "data-2022-GE.json",
    "data-2020-GE.json",
    "data-10-31-2024.json",
    "data-11-01-2024.json",
    "data-11-02-2024.json",
    "data-11-03-2024.json",
    "data-11-04-2024.json",
  ];

  // Separate GE files and sort date-based files
  const geFiles = files.filter((file) => file.includes("GE"));
  let dateFiles = files.filter((file) => /\d{2}-\d{2}-\d{4}/.test(file));

  dateFiles.sort((a, b) => {
    const [monthA, dayA, yearA] = a.match(/\d{2}-\d{2}-\d{4}/)[0].split("-");
    const [monthB, dayB, yearB] = b.match(/\d{2}-\d{2}-\d{4}/)[0].split("-");
    return (
      new Date(yearB, monthB - 1, dayB) - new Date(yearA, monthA - 1, dayA)
    );
  });

  files = [...dateFiles, ...geFiles]; // Merged and sorted list

  function loadData() {
    Promise.all(files.map((file) => fetch(file).then((res) => res.json())))
      .then((data) => {
        const totalData = data.map((report, i) => {
          const entry = report.find((entry) => entry.County === "TOTAL");

          // Get date from filename
          const dateMatch = files[i].match(/\d{2}-\d{2}-\d{4}/);
          const date = dateMatch
            ? dateMatch[0]
            : files[i].replace("data-", "").replace(".json", "");

          return { ...entry, date };
        });

        // Separate GE 2022 and GE 2020 data for baseline
        const ge2022 = totalData.find((entry) => entry.date.includes("2022"));
        const ge2020 = totalData.find((entry) => entry.date.includes("2020"));

        // Sort `totalData` in descending date order for recent reports
        const recentData = totalData
          .filter((entry) => !entry.date.includes("GE"))
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 3); // Get the three most recent entries

        const [latest, previous, secondPrevious] = recentData;

        // Use the latest two comparisons for daily summary calculations
        renderDailySummary(calculateDailySummary(latest, previous));

        // Render the chart with the last three reports and the GE baselines
        renderReturnShareTrendChart(recentData, ge2022, ge2020);
      })
      .catch((error) => console.error("Error loading data:", error));
  }

  function calculateDailySummary(latest, previous) {
    const calcChange = (a, b) => (a - b).toFixed(1);
    const projectedAdvantage = Math.abs(
      latest.Dem_Approved - latest.Rep_Approved
    ).toLocaleString();

    return {
      date: latest.date,
      demReturnShare: latest.Return_Share_Dem.toFixed(1),
      repReturnShare: latest.Return_Share_Rep.toFixed(1),
      demReturnShareChange: calcChange(
        latest.Return_Share_Dem,
        previous.Return_Share_Dem
      ),
      repReturnShareChange: calcChange(
        latest.Return_Share_Rep,
        previous.Return_Share_Rep
      ),
      demTotalReturns: latest.Dem_Returned.toLocaleString(),
      repTotalReturns: latest.Rep_Returned.toLocaleString(),
      demReturnChange: (
        latest.Dem_Returned - previous.Dem_Returned
      ).toLocaleString(),
      repReturnChange: (
        latest.Rep_Returned - previous.Rep_Returned
      ).toLocaleString(),

      // Net difference in return share
      netReturnShareDifference: (
        latest.Return_Share_Dem - latest.Return_Share_Rep
      ).toFixed(1),
      netReturnShareChange: calcChange(
        latest.Return_Share_Dem - latest.Return_Share_Rep,
        previous.Return_Share_Dem - previous.Return_Share_Rep
      ),

      // Net total returns difference
      netTotalReturnsDifference: (
        latest.Dem_Returned - latest.Rep_Returned
      ).toLocaleString(),
      netTotalReturnsChange: (
        latest.Dem_Returned -
        previous.Dem_Returned -
        (latest.Rep_Returned - previous.Rep_Returned)
      ).toLocaleString(),

      netAdvantage: (
        latest.Dem_Returned -
        previous.Dem_Returned -
        (latest.Rep_Returned - previous.Rep_Returned)
      ).toLocaleString(),
      totalAdvantage: (
        latest.Dem_Returned - latest.Rep_Returned
      ).toLocaleString(),
      projectedAdvantage,
    };
  }

  function renderDailySummary(summary) {
    const demReturnShareElem = document.getElementById("demReturnShare");
    const demReturnShareChangeElem = document.getElementById(
      "demReturnShareChange"
    );
    const repReturnShareElem = document.getElementById("repReturnShare");
    const repReturnShareChangeElem = document.getElementById(
      "repReturnShareChange"
    );
    const demTotalReturnsElem = document.getElementById("demTotalReturns");
    const demReturnChangeElem = document.getElementById("demReturnChange");
    const repTotalReturnsElem = document.getElementById("repTotalReturns");
    const repReturnChangeElem = document.getElementById("repReturnChange");
    const netAdvantageElem = document.getElementById("netAdvantage");
    const totalAdvantageElem = document.getElementById("totalAdvantage");
    const projectedAdvantageElem =
      document.getElementById("projectedAdvantage");

    if (demReturnShareElem)
      demReturnShareElem.textContent = `${summary.demReturnShare} (${summary.demReturnShareChange})`;
    if (repReturnShareElem)
      repReturnShareElem.textContent = `${summary.repReturnShare} (${summary.repReturnShareChange})`;
    if (demTotalReturnsElem)
      demTotalReturnsElem.textContent = `${summary.demTotalReturns} (+${summary.demReturnChange})`;
    if (repTotalReturnsElem)
      repTotalReturnsElem.textContent = `${summary.repTotalReturns} (+${summary.repReturnChange})`;

    if (netAdvantageElem) netAdvantageElem.textContent = summary.netAdvantage;
    if (totalAdvantageElem)
      totalAdvantageElem.textContent = summary.totalAdvantage;
    if (projectedAdvantageElem)
      projectedAdvantageElem.textContent = summary.projectedAdvantage;

    // Display the net differences in a separate section
    const netReturnShareDifferenceElem = document.getElementById(
      "netReturnShareDifference"
    );
    const netTotalReturnsDifferenceElem = document.getElementById(
      "netTotalReturnsDifference"
    );

    // Ensure values are valid numbers to avoid NaN
    const netReturnShareDifference = !isNaN(summary.netReturnShareDifference)
      ? summary.netReturnShareDifference
      : 0;
    const netTotalReturnsDifference = !isNaN(summary.netTotalReturnsDifference)
      ? summary.netTotalReturnsDifference
      : 0;
    const netReturnShareChange = !isNaN(summary.netReturnShareChange)
      ? summary.netReturnShareChange
      : 0;

    if (netReturnShareDifferenceElem) {
      const prefix = netReturnShareDifference > 0 ? "D +" : "R +";
      netReturnShareDifferenceElem.textContent = `${prefix}${Math.abs(
        netReturnShareDifference
      )} (${netReturnShareChange})`;
    }
    if (netTotalReturnsDifferenceElem) {
      const prefix = netTotalReturnsDifference > 0 ? "D +" : "R +";
      netTotalReturnsDifferenceElem.textContent = `${prefix}${Math.abs(
        netTotalReturnsDifference
      )}`;
    }
  }

  function renderReturnShareTrendChart(recentData, ge2022, ge2020) {
    const ctx = document.getElementById("shareTrendChart").getContext("2d");

    new Chart(ctx, {
      type: "line",
      data: {
        labels: recentData.map((entry) => entry.date),
        datasets: [
          {
            label: "Democratic Return Share",
            data: recentData.map((e) => e.Return_Share_Dem),
            borderColor: "#218ad7ed",
            fill: false,
          },
          {
            label: "Republican Return Share",
            data: recentData.map((e) => e.Return_Share_Rep),
            borderColor: "#fb3232",
            fill: false,
          },
          {
            label: "2022 GE - D",
            data: Array(recentData.length).fill(ge2022.Return_Share_Dem),
            borderColor: "#218ad7",
            borderDash: [5, 5],
            pointRadius: 0,
          },
          {
            label: "2022 GE - R",
            data: Array(recentData.length).fill(ge2022.Return_Share_Rep),
            borderColor: "#fb3232",
            borderDash: [5, 5],
            pointRadius: 0,
          },
          {
            label: "2020 GE - D",
            data: Array(recentData.length).fill(ge2020.Return_Share_Dem),
            borderColor: "#0d4b8d",
            borderDash: [5, 5],
            pointRadius: 0,
          },
          {
            label: "2020 GE - R",
            data: Array(recentData.length).fill(ge2020.Return_Share_Rep),
            borderColor: "#c22121",
            borderDash: [5, 5],
            pointRadius: 0,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => value + "%",
            },
          },
        },
        plugins: {
          legend: {
            labels: {
              usePointStyle: true,
            },
          },
        },
      },
    });
  }

  loadData(); // Load data on DOMContentLoaded
});

document.addEventListener("DOMContentLoaded", function () {
  const tableWrapper = document.querySelector(".table-wrapper");
  const table = document.querySelector(".container");
  const originalThead = table.querySelector("thead");

  // Create and style the cloned header for sticky effect
  //const stickyHeader = originalThead.cloneNode(true);
  //stickyHeader.classList.add("sticky-header");
  //tableWrapper.appendChild(stickyHeader);

  // Sync column widths between original and sticky header
  // function syncHeaderWidths() {
  //   const originalThs = originalThead.querySelectorAll("th");
  //   //const stickyThs = stickyHeader.querySelectorAll("th");
  //   stickyThs.forEach((th, index) => {
  //     th.style.width = `${originalThs[index].offsetWidth}px`;
  //   });
  // }

  // Update widths when the window is resized
  window.addEventListener("resize", syncHeaderWidths);
});
