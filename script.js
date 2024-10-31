document.addEventListener("DOMContentLoaded", function () {
  const tableBody = document.querySelector(".container tbody");
  const tabContainer = document.getElementById("tabContainer");

  let files = [
    "data-2022-GE.json",
    "data-2020-GE.json",
    "data-10-29-2024.json",
    "data-10-30-2024.json",
    "data-10-31-2024.json",
  ];

  // Separate GE files from date-based files
  const geFiles = files.filter((file) => file.includes("GE"));
  const dateFiles = files.filter((file) => file.match(/\d{2}-\d{2}-\d{4}/));

  // Sort date-based files by descending date (latest to oldest)
  dateFiles.sort((a, b) => {
    const dateA = new Date(a.match(/\d{2}-\d{2}-\d{4}/)[0]);
    const dateB = new Date(b.match(/\d{2}-\d{2}-\d{4}/)[0]);
    return dateB - dateA;
  });

  // Merge sorted date files with GE files
  files = [...dateFiles, ...geFiles];

  // Create tabs dynamically based on sorted files
  function createTabs() {
    files.forEach((file, index) => {
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

  // Function to load and display report data based on file selection
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
        let prevTotals = null;

        // Conditions for general election files
        const isGeneralElection = label.includes("GE");
        if (isGeneralElection) {
          fetch(files[0]) // Get latest report for comparison
            .then((response) => response.json())
            .then((latestDataArray) => {
              prevTotals = latestDataArray.find(
                (entry) => entry.County === "TOTAL"
              );
              insertTotalsRowWithDiff(totals, prevTotals);
            });
        } else if (
          fileIndex + 1 < files.length &&
          !files[fileIndex + 1].includes("GE")
        ) {
          fetch(files[fileIndex + 1])
            .then((response) => response.json())
            .then((prevDataArray) => {
              prevTotals = prevDataArray.find(
                (entry) => entry.County === "TOTAL"
              );
              insertTotalsRowWithDiff(totals, prevTotals);
            });
        } else {
          insertTotalsRowWithDiff(totals, null);
        }

        // Populate each row with or without differences based on the file
        data.forEach((row, index) => {
          if (row.County !== "TOTAL") {
            let prevData = null;
            if (isGeneralElection) {
              fetch(files[0])
                .then((response) => response.json())
                .then((latestDataArray) => {
                  prevData = latestDataArray[index];
                  insertRowWithDiff(row, prevData);
                });
            } else if (
              fileIndex + 1 < files.length &&
              !files[fileIndex + 1].includes("GE")
            ) {
              fetch(files[fileIndex + 1])
                .then((response) => response.json())
                .then((prevDataArray) => {
                  prevData = prevDataArray[index];
                  insertRowWithDiff(row, prevData);
                });
            } else {
              insertRowWithDiff(row, null);
            }
          }
        });
      })
      .catch((error) => console.error("Error loading data:", error));
  }

  // Insert totals row with or without differences
  function insertTotalsRowWithDiff(totals, prevTotals) {
    const totalsRow = document.createElement("tr");
    totalsRow.classList.add("totals-row");

    function formatCell(value, prevValue) {
      if (prevValue === null) return `${value.toLocaleString()}`;
      const diff = value - prevValue;
      const diffDisplay =
        diff > 0 ? `+${diff.toLocaleString()}` : diff.toLocaleString();
      return `${value.toLocaleString()}<br><span style="font-size: 0.7em; color: ${diff >= 0 ? "green" : "red"};">(${diffDisplay})</span>`;
    }

    function formatCellWithPercentage(value, prevValue) {
      if (prevValue === null) return `${value.toFixed(2)}%`;
      const diff = value - prevValue;
      const diffDisplay =
        diff > 0 ? `+${diff.toFixed(2)}` : `${diff.toFixed(2)}`;
      return `${value.toFixed(
        2
      )}%<br><span style="font-size: 0.7em; color: ${diff >= 0 ? "green" : "red"};">(${diffDisplay})</span>`;
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

    tableBody.prepend(totalsRow); // Use prepend instead of appendChild
  }

  // Insert row for each county with or without differences
  function insertRowWithDiff(row, prevData) {
    const tr = document.createElement("tr");

    function formatCell(value, prevValue) {
      if (prevValue === null) return `${value.toLocaleString()}`;
      const diff = value - prevValue;
      const diffDisplay =
        diff > 0 ? `+${diff.toLocaleString()}` : diff.toLocaleString();
      return `${value.toLocaleString()}<br><span style="font-size: 0.7em; color: ${diff >= 0 ? "green" : "red"};">(${diffDisplay})</span>`;
    }

    function formatCellWithPercentage(value, prevValue) {
      if (prevValue === null) return `${value.toFixed(2)}%`;
      const diff = value - prevValue;
      const diffDisplay =
        diff > 0 ? `+${diff.toFixed(2)}` : `${diff.toFixed(2)}`;
      return `${value.toFixed(
        2
      )}%<br><span style="font-size: 0.7em; color: ${diff >= 0 ? "green" : "red"};">(${diffDisplay})</span>`;
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
    files[0],
    files[0].match(/\d{2}-\d{2}-\d{4}/)
      ? files[0].match(/\d{2}-\d{2}-\d{4}/)[0]
      : files[0].replace("data-", "").replace(".json", ""),
    0
  );
});

document.addEventListener("DOMContentLoaded", function () {
  const tableBody = document.querySelector(".container tbody");
  const tabContainer = document.getElementById("tabContainer");
  const dailySummaryContainer = document.getElementById("daily-share-summary");

  const files = [
    "data-2022-GE.json",
    "data-2020-GE.json",
    "data-10-29-2024.json",
    "data-10-30-2024.json",
    "data-10-31-2024.json",
  ].sort((a, b) => {
    const dateA = a.match(/\d{2}-\d{2}-\d{4}/) || a.match(/data-(\d{4})-GE/);
    const dateB = b.match(/\d{2}-\d{2}-\d{4}/) || b.match(/data-(\d{4})-GE/);
    return new Date(dateA[0]) - new Date(dateB[0]);
  });

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
    dailySummaryContainer.innerHTML = `
      <div class="daily-summary">
        <h3>Returns Share</h3>
        <p>🔵 ${summary.demReturnShare}% (${summary.demReturnShareChange})</p>
        <p>🔴 ${summary.repReturnShare}% (${summary.repReturnShareChange})</p>
        <h3>Total Returns</h3>
        <p>🔵 ${summary.demTotalReturns} (+${summary.demReturnChange})</p>
        <p>🔴 ${summary.repTotalReturns} (+${summary.repReturnChange})</p>
        <h3>Daily Net Advantage</h3>
        <p>🔵 ${summary.netAdvantage}</p>
        <h3>Total Advantage</h3>
        <p>🔵 ${summary.totalAdvantage}</p>
        <h3>If 100% of Outstanding Ballots Returned</h3>
        <p>🔵 ${summary.projectedAdvantage}</p>
      </div>
    `;
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
            data: Array(3).fill(ge2022.Return_Share_Dem),
            borderColor: "#218ad7",
            borderDash: [5, 5],
            pointRadius: 0,
          },
          {
            label: "2022 GE - R",
            data: Array(3).fill(ge2022.Return_Share_Rep),
            borderColor: "#fb3232",
            borderDash: [5, 5],
            pointRadius: 0,
          },
          {
            label: "2020 GE - D",
            data: Array(3).fill(ge2020.Return_Share_Dem),
            borderColor: "#0d4b8d",
            borderDash: [5, 5],
            pointRadius: 0,
          },
          {
            label: "2020 GE - R",
            data: Array(3).fill(ge2020.Return_Share_Rep),
            borderColor: "#c22121",
            borderDash: [5, 5],
            pointRadius: 0,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true, ticks: { callback: (value) => value + "%" } },
        },
        plugins: { legend: { labels: { usePointStyle: true } } },
      },
    });
  }

  function loadData() {
    Promise.all(files.map((file) => fetch(file).then((res) => res.json())))
      .then((data) => {
        const totalData = data.map((report, i) => ({
          ...report.find((entry) => entry.County === "TOTAL"),
          date: files[i].match(/\d{2}-\d{2}-\d{4}/)
            ? files[i].match(/\d{2}-\d{2}-\d{4}/)[0]
            : files[i].match(/data-(\d{4})-GE/)[0],
        }));

        const recentData = totalData
          .filter((entry) => !entry.date.includes("GE"))
          .slice(-3);
        const [ge2022, ge2020] = [
          totalData.find((e) => e.date.includes("2022")),
          totalData.find((e) => e.date.includes("2020")),
        ];

        renderDailySummary(calculateDailySummary(recentData[2], recentData[1]));
        renderReturnShareTrendChart(recentData, ge2022, ge2020);
      })
      .catch((error) => console.error("Error loading data:", error));
  }

  function renderDailySummary(summary) {
    document.getElementById("demReturnShare").textContent =
      summary.demReturnShare;
    document.getElementById("demReturnShareChange").textContent =
      summary.demReturnShareChange;
    document.getElementById("repReturnShare").textContent =
      summary.repReturnShare;
    document.getElementById("repReturnShareChange").textContent =
      summary.repReturnShareChange;

    document.getElementById("demTotalReturns").textContent =
      summary.demTotalReturns;
    document.getElementById("demReturnChange").textContent =
      summary.demReturnChange;
    document.getElementById("repTotalReturns").textContent =
      summary.repTotalReturns;
    document.getElementById("repReturnChange").textContent =
      summary.repReturnChange;

    document.getElementById("netAdvantage").textContent = summary.netAdvantage;
    document.getElementById("totalAdvantage").textContent =
      summary.totalAdvantage;
    document.getElementById("projectedAdvantage").textContent =
      summary.projectedAdvantage;
  }

  loadData();
});

function renderDailySummary(summary) {
  document.getElementById("demReturnShare").textContent =
    summary.demReturnShare;
  document.getElementById("demReturnShareChange").textContent =
    summary.demReturnShareChange;
  document.getElementById("repReturnShare").textContent =
    summary.repReturnShare;
  document.getElementById("repReturnShareChange").textContent =
    summary.repReturnShareChange;

  document.getElementById("demTotalReturns").textContent =
    summary.demTotalReturns;
  document.getElementById("demReturnChange").textContent =
    summary.demReturnChange;
  document.getElementById("repTotalReturns").textContent =
    summary.repTotalReturns;
  document.getElementById("repReturnChange").textContent =
    summary.repReturnChange;

  document.getElementById("netAdvantage").textContent = summary.netAdvantage;
  document.getElementById("totalAdvantage").textContent =
    summary.totalAdvantage;
  document.getElementById("projectedAdvantage").textContent =
    summary.projectedAdvantage;
}
