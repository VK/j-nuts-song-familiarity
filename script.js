document.addEventListener("DOMContentLoaded", function () {
    const resultTable = document.getElementById("resultTable");

    // Function to process pasted data
    function processData() {
        const pastedData = document.getElementById("pasteData").value.trim();
        const rows = pastedData.split('\n');
        const membersData = [];
        const songsData = [];
        rows.forEach(row => {
            const cells = row.split('\t');
            if (cells.length === 2) {
                const name = cells[0].trim();
                const entryDate = cells[1].trim();
                const transformedDate = transformTermToDate(entryDate);
                if (entryDate && (entryDate.includes("SS") || entryDate.includes("WS"))) {
                    membersData.push({ name: name, entryDate: entryDate, transformedDate: transformedDate });
                }
            } else if (cells.length === 3) {
                const name = cells[0].trim();
                const lastPerformedDate = cells[2].trim();
                const transformedDate = transformTermToDate(lastPerformedDate);
                if (lastPerformedDate && (lastPerformedDate.includes("SS") || lastPerformedDate.includes("WS"))) {
                    songsData.push({ name: name, lastPerformedDate: lastPerformedDate, transformedDate: transformedDate });
                }
            }
        });


        // Calculate familiarity
        const resultData = calculateFamiliarity(membersData, songsData);
        // Populate result table
        populateResultTable(resultTable, resultData);

        return resultData;
    }

    // Attach processData function to the button click event
    document.getElementById("processButton").addEventListener("click", processData);

    // Function to populate result table
    function populateResultTable(table, data) {


        // Sort songs based on selected option
        const sortOption = document.querySelector('input[name="sortOption"]:checked').value;
        if (sortOption === "alphabetical") {
            data.sort((a, b) => (a.name > b.name) ? -1 : 1);
        } else if (sortOption === "year") {
            data.sort((a, b) => b.transformedDate - a.transformedDate);
        } else if (sortOption === "familiarity") {
            data.sort((a, b) => b.percentage - a.percentage);
        }


        table.innerHTML = "";
        table.innerHTML += `<thead><tr><th>Song</th><th>Last Performed</th><th>Familiarity Percentage</th></tr></thead>`;
        table.innerHTML += `<tbody>`;
        data.forEach(item => {

            const barWidth = Math.min(item.percentage, 100); // Limiting bar width to 100%
            const barColor = getColor(item.percentage) // Setting color based on percentage


            table.innerHTML += `<tr><td>${item.song}</td><td>${item.lastPerformedDate}</td>
                <td>
                <div class="progress">
                    <div class="progress-bar ${barColor}" role="progressbar" style="width: ${barWidth}%" aria-valuenow="${item.percentage}" aria-valuemin="0" aria-valuemax="100">${item.percentage}%</div>
                </div>
                </td>
            </tr>`;



        });
        table.innerHTML += `</tbody>`;
    }

    // Function to calculate familiarity
    function calculateFamiliarity(membersData, songsData) {
        const resultData = [];
        songsData.forEach(song => {
            let familiarityCount = 0;
            const lastPerformedDate = parseFloat(song.transformedDate);
            membersData.forEach(member => {
                const entryDate = parseFloat(member.transformedDate);
                if (lastPerformedDate >= entryDate) {
                    familiarityCount++;
                }
            });
            const familiarityPercentage = (familiarityCount / membersData.length) * 100;
            resultData.push({ song: song.name, lastPerformedDate: song.lastPerformedDate, transformedDate: song.transformedDate, percentage: familiarityPercentage.toFixed(2) });
        });
        return resultData;
    }


    // Function to transform term representation to floating-point date
    function transformTermToDate(term) {
        const parts = term.split(" ");
        if (parts.length === 2) {
            const year = parseInt(parts[1]);
            if (parts[0] === "WS") {
                return year + 0.5;
            } else if (parts[0] === "SS") {
                return year;
            }
        }
        return null; // Return null for invalid term representation
    }


    // Function to get color based on percentage
    function getColor(percentage) {
        if (percentage >= 0 && percentage < 33) {
            return "bg-danger"; // Red
        } else if (percentage >= 33 && percentage < 66) {
            return "bg-warning"; // Orange
        } else {
            return "bg-success"; // Green
        }
    }



    // Function to convert data to CSV format
    function convertToCSV(data) {
        const header = ["Song", "Last Performed", "Familiarity Percentage"];
        const filteredData = data.map(item => [
            item.song.replace(/[\r\n,]/g, ""),
            item.lastPerformedDate.replace(/[\r\n,]/g, ""),
            item.percentage + "%"
        ]);

        const csvContent = header.join(",") + "\n" +
        filteredData.map(item => Object.values(item).join(",")).join("\n");
        return "data:text/csv;charset=utf-8," + csvContent;
    }


    // Attach event listener to download button
    document.getElementById("downloadCsvBtn").addEventListener("click", function () {
        const resultData = processData();
        const csvContent = convertToCSV(resultData);
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "result.csv");
        document.body.appendChild(link); // Required for Firefox
        link.click();
    });




});