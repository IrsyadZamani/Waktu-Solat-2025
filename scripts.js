// Base path for the CSV files
const baseCsvPath = 'jadual_solat_malaysia_2025/';
const basePdfPath = 'jadual_solat_malaysia_2025/';

let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

// Function to handle timezone change
function handleTimezoneChange() {
    const timezoneSelector = document.getElementById('timezone');
    const selectedTimezone = timezoneSelector.value; // Get selected timezone value

    // Update the global CSV file path based on the selected timezone
    csvFilePath = `${baseCsvPath}${selectedTimezone}.csv`;
    pdfFilePath = `${basePdfPath}${selectedTimezone}.pdf`;

    const zoneLabel = document.getElementById("selected-zone-label");
    zoneLabel.innerText = `Waktu Solat Malaysia 2025 Bagi Zon ( ${selectedTimezone} )`;

    const tableContainer = document.getElementById('table-container');
    tableContainer.style.display = 'block';

    // Reload the CSV file to populate the table
    loadCSV();
    
}

// Fetch and load the CSV file
async function loadCSV() {
    try {
        const response = await fetch(csvFilePath);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const csvData = await response.text();
        populateTable(csvData);
    } catch (error) {
        console.error('Error loading CSV file:', error);
        document.getElementById('prayer-times-table').innerHTML =
            '<tr><td colspan="10">Failed to load data. Please select a valid timezone or check the file path.</td></tr>';
    }
}


// Populate the table with CSV data
function populateTable(csvData) {
    const rows = csvData.split('\n');
    const tableBody = document.getElementById('prayer-times-table');
    tableBody.innerHTML = ''; // Clear the table before populating

    rows.slice(1).forEach(row => {
        if (row.trim()) {
            const cols = row.split(',');
            const tableRow = document.createElement('tr');

            cols.forEach(col => {
                const tableCell = document.createElement('td');
                tableCell.textContent = col.trim();
                tableRow.appendChild(tableCell);
            });

            tableBody.appendChild(tableRow);
        }
    });

    filterTableByMonth(); // Filter table by the current month after loading
    highlightToday(); // Highlight today's date
}

// Highlight today's date in the table
function highlightToday() {
    // Get today's date
    const today = new Date();
    
    // Select all rows in the prayer times table
    const tableRows = document.querySelectorAll('#prayer-times-table tr');

    tableRows.forEach(row => {
        // Get the text content of the first column (the date)
        const dateCell = row.children[0]?.textContent?.trim();

        // Proceed if the date cell exists and has content
        if (dateCell) {
            // Split the date based on the format (either '/' or '-')
            const dateParts = dateCell.includes('/') ? dateCell.split('/') : dateCell.split('-');
            
            // Extract day, month, and year from the date parts
            const day = parseInt(dateParts[0]); // Day part
            const month = parseInt(dateParts[1]) - 1; // Month part (0-based index)
            const year = parseInt(dateParts[2]); // Year part

            // Create a Date object for the current row's date
            const rowDate = new Date(year, month, day);

            // Compare the row's date with today's date
            if (rowDate.toDateString() === today.toDateString()) {
                // Highlight the row if the dates match
                row.classList.add('highlight');
            }
        }
    });
}


// Filter table rows by the current month
function filterTableByMonth() {
    const tableRows = document.querySelectorAll('#prayer-times-table tr');
    const targetMonth = (currentMonth + 1).toString().padStart(2, '0'); // Format month as "01", "02", etc.

    tableRows.forEach(row => {
        const dateCell = row.children[0]?.textContent?.trim(); // Assumes the first cell contains the date
        if (dateCell) {
            let monthInRow = '';

            // Extract month from the date
            if (dateCell.includes('/')) {
                // Format: DD/MM/YYYY
                const dateParts = dateCell.split('/');
                monthInRow = dateParts[1]?.padStart(2, '0');
            } else if (dateCell.includes('-')) {
                // Format: YYYY-MM-DD
                const dateParts = dateCell.split('-');
                monthInRow = dateParts[1]?.padStart(2, '0');
            }

            // Show or hide the row based on the month
            if (monthInRow === targetMonth) {
                row.style.display = ''; // Show row
            } else {
                row.style.display = 'none'; // Hide row
            }
        } else {
            row.style.display = 'none'; // Hide rows with no date
        }
    });

    updateMonthLabel(); // Update the displayed month
}

// Navigate between months (restricted to 2025)
function navigateMonth(direction) {
    // Check if we're within the year 2025
    if (currentYear === 2025) {
        currentMonth += direction;

        // Prevent navigation before January 2025 or after December 2025
        if (currentMonth < 0) {
            currentMonth = 0; // Lock at January if trying to go back before January 2025
        } else if (currentMonth > 11) {
            currentMonth = 11; // Lock at December if trying to go beyond December 2025
        }

        // Update the displayed table and month label
        filterTableByMonth(); // Filter the table rows for the current month
        updateMonthLabel(); // Update the month label in the UI
    }
}

// Update the displayed month label
function updateMonthLabel() {
    const monthNames = [
        'Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun',
        'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember'
    ];

    const monthLabel = document.getElementById('month-label');
    const monthLabel2 = document.getElementById('month-label2');

    const formattedLabel = `${monthNames[currentMonth]} ${currentYear}`;
    if (monthLabel) monthLabel.textContent = formattedLabel;
    if (monthLabel2) monthLabel2.textContent = formattedLabel;
}

// Filter table rows based on search input
function filterTable() {
    const searchTerm = document.getElementById('search').value.toLowerCase();
    const tableRows = document.querySelectorAll('#prayer-times-table tr');

    tableRows.forEach(row => {
        const rowText = row.textContent.toLowerCase();
        if (rowText.includes(searchTerm)) {
            row.style.display = ''; // Show row
        } else {
            row.style.display = 'none'; // Hide row
        }
    });
}

// Download the table as a CSV file
async function downloadCSV() {
    try {
        const response = await fetch(csvFilePath);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const blob = await response.blob(); // Get the CSV file as a Blob
        const link = document.createElement('a'); // Create a link element

        link.href = URL.createObjectURL(blob);
        link.download = csvFilePath.split('/').pop(); // Use the file name from the path
        link.style.display = 'none';

        document.body.appendChild(link);
        link.click(); // Trigger the download
        document.body.removeChild(link); // Remove the link element
    } catch (error) {
        console.error('Error downloading CSV file:', error);
    }
}

// Function to fetch and download the PDF
function downloadPDF() {
    try {
        // Create a hidden link element
        const link = document.createElement('a');
        link.href = pdfFilePath;
        link.download = pdfFilePath.split('/').pop(); // Use the file name from the path
        link.style.display = 'none';
        // Append the link to the document and trigger a click
        document.body.appendChild(link);
        link.click();

        // Remove the link element after the download
        document.body.removeChild(link);
    } catch (error) {
        console.error('Error downloading PDF file:', error);
    }
}

function filterTable() {
    const searchTerm = document.getElementById('search').value.toLowerCase();
    const tableRows = document.querySelectorAll('#prayer-times-table tr');

    // If the search bar is empty, automatically refresh the table
    if (searchTerm === '') {
        loadCSV(); // This will reload the original CSV and refresh the table
    } else {
        tableRows.forEach(row => {
            const rowText = row.textContent.toLowerCase();
            if (rowText.includes(searchTerm)) {
                row.style.display = ''; // Show row
            } else {
                row.style.display = 'none'; // Hide row
            }
        });
    }
}

// Scroll to the top of the page
function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Show the "Scroll to Top" button when scrolling down
window.addEventListener('scroll', () => {
    const scrollToTopButton = document.getElementById('scrollToTop');
    if (window.scrollY > 300) {
        scrollToTopButton.style.display = 'block';
    } else {
        scrollToTopButton.style.display = 'none';
    }
});


let slideIndex = 0;
showSlides();

function showSlides() {
  let i;
  let slides = document.getElementsByClassName("slides");
  for (i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";  
  }
  slideIndex++;
  if (slideIndex > slides.length) {slideIndex = 1}    
  slides[slideIndex-1].style.display = "block";  
  setTimeout(showSlides, 5000); // tukar setiap 3 saat
}

// ==================== COUNTDOWN WAKTU SOLAT SETERUSNYA ====================
function startCountdown() {
    function updateCountdown() {
        const now = new Date();
        const today = now.toLocaleDateString("en-GB"); // format: dd/mm/yyyy
        const rows = document.querySelectorAll("#prayer-times-table tr");

        let upcomingPrayer = null;

        // Cari row untuk hari ini
        rows.forEach(row => {
            const cells = row.querySelectorAll("td");
            if (!cells.length) return;

            const dateCell = cells[0]?.textContent?.trim();
            if (!dateCell) return;

            let rowDateParts = dateCell.includes("/") ? dateCell.split("/") : dateCell.split("-");
            let rowDay, rowMonth, rowYear;

            if (dateCell.includes("/")) { // format DD/MM/YYYY
                rowDay = parseInt(rowDateParts[0]);
                rowMonth = parseInt(rowDateParts[1]) - 1;
                rowYear = parseInt(rowDateParts[2]);
            } else { // format YYYY-MM-DD
                rowYear = parseInt(rowDateParts[0]);
                rowMonth = parseInt(rowDateParts[1]) - 1;
                rowDay = parseInt(rowDateParts[2]);
            }

            const rowDate = new Date(rowYear, rowMonth, rowDay);
            if (rowDate.toDateString() === now.toDateString()) {
                const prayerNames = ["Imsak","Subuh","Syuruk","Zohor","Asar","Maghrib","Isyak"];
                
                for (let i = 0; i < prayerNames.length; i++) {
                    let t = cells[i+3]?.textContent?.trim(); // kolum waktu solat
                    if (!t) continue;

                    // tukar ke jam 24
                    let [time, ampm] = t.split(" ");
                    let [h, m] = time.split(":").map(Number);
                    if (ampm === "PM" && h < 12) h += 12;
                    if (ampm === "AM" && h === 12) h = 0;

                    let prayerTime = new Date(now);
                    prayerTime.setHours(h, m, 0, 0);

                    if (prayerTime > now) {
                        upcomingPrayer = { name: prayerNames[i], time: prayerTime };
                        break;
                    }
                }
            }
        });

        // Kalau semua dah habis -> ambil Imsak esok
        if (!upcomingPrayer) {
            let tomorrow = new Date();
            tomorrow.setDate(now.getDate() + 1);

            rows.forEach(row => {
                const cells = row.querySelectorAll("td");
                if (!cells.length) return;

                const dateCell = cells[0]?.textContent?.trim();
                if (!dateCell) return;

                let rowDateParts = dateCell.includes("/") ? dateCell.split("/") : dateCell.split("-");
                let rowDay, rowMonth, rowYear;

                if (dateCell.includes("/")) { 
                    rowDay = parseInt(rowDateParts[0]);
                    rowMonth = parseInt(rowDateParts[1]) - 1;
                    rowYear = parseInt(rowDateParts[2]);
                } else {
                    rowYear = parseInt(rowDateParts[0]);
                    rowMonth = parseInt(rowDateParts[1]) - 1;
                    rowDay = parseInt(rowDateParts[2]);
                }

                const rowDate = new Date(rowYear, rowMonth, rowDay);
                if (rowDate.toDateString() === tomorrow.toDateString()) {
                    let t = cells[4]?.textContent?.trim(); // Imsak esok
                    if (t) {
                        let [time, ampm] = t.split(" ");
                        let [h, m] = time.split(":").map(Number);
                        if (ampm === "PM" && h < 12) h += 12;
                        if (ampm === "AM" && h === 12) h = 0;

                        let prayerTime = new Date(tomorrow);
                        prayerTime.setHours(h, m, 0, 0);

                        upcomingPrayer = { name: "Imsak", time: prayerTime };
                    }
                }
            });
        }

        // Papar countdown
        const display = document.getElementById("next-prayer");
        if (upcomingPrayer) {
            let diff = upcomingPrayer.time - now;
            let hours = Math.floor(diff / (1000*60*60));
            let minutes = Math.floor((diff / (1000*60)) % 60);
            let seconds = Math.floor((diff / 1000) % 60);

            display.innerHTML = `⏳ Waktu Solat seterusnya: <span style="color:#B7C9E2">${upcomingPrayer.name}</span> dalam ${hours} jam ${minutes} minit ${seconds} saat`;
        }
    
        // ==================== Papar Waktu Semasa & Tempoh ====================
    if (upcomingPrayer) {
    let diff = upcomingPrayer.time - now;
    let hours = Math.floor(diff / (1000*60*60));
    let minutes = Math.floor((diff / (1000*60)) % 60);
    let seconds = Math.floor((diff / 1000) % 60);

    // Countdown solat seterusnya
    display.innerHTML = `⏳ Waktu seterusnya: 
        <span style="color:#B7C9E2">${upcomingPrayer.name}</span> 
        dalam ${hours} jam ${minutes} minit ${seconds} saat`;

// ✅ Sedang dalam waktu solat (sekarang)
const prayerNames = ["Imsak","Subuh","Syuruk","Zohor","Asar","Maghrib","Isyak"];
let currentPrayerIndex = prayerNames.indexOf(upcomingPrayer.name) - 1;
if (currentPrayerIndex < 0) currentPrayerIndex = prayerNames.length - 1;
let currentPrayer = prayerNames[currentPrayerIndex];

// ================= Tambah logik Dhuha =================
let todayRow = Array.from(document.querySelectorAll("#prayer-times-table tr")).find(row => {
    const dateCell = row.querySelector("td")?.textContent?.trim();
    return dateCell && new Date(dateCell.split("/").reverse().join("-")).toDateString() === now.toDateString();
});

if (todayRow) {
    const cells = todayRow.querySelectorAll("td");
    let syurukCell = cells[5]?.textContent?.trim(); // ikut susunan table awak
    let zohorCell  = cells[6]?.textContent?.trim();

    let syurukTime = parsePrayerTime(syurukCell, now);
    let zohorTime  = parsePrayerTime(zohorCell, now);

    if (syurukTime && zohorTime) {
        let dhuhaStart = new Date(syurukTime.getTime() + 10 * 60000); // 10 minit selepas syuruk
        if (now >= dhuhaStart && now < zohorTime) {
            currentPrayer = "Dhuha";
        }
    }
}
// =====================================================

document.getElementById("current-prayer").innerHTML = 
   `🕌 Sedang dalam waktu: <span style="color:#FFD700">${currentPrayer}</span>`;

    }
    
    }
   function parsePrayerTime(text, baseDate) {
    if (!text) return null;
    let [time, ampm] = text.split(" ");
    let [h, m] = time.split(":").map(Number);
    if (ampm === "PM" && h < 12) h += 12;
    if (ampm === "AM" && h === 12) h = 0;

    let prayerTime = new Date(baseDate);
    prayerTime.setHours(h, m, 0, 0);
    return prayerTime;
}
 
    // auto update setiap saat
    updateCountdown();
    setInterval(updateCountdown, 1000);
}
function populateTable(csvData) {
    const rows = csvData.split('\n');
    const tableBody = document.getElementById('prayer-times-table');
    tableBody.innerHTML = ''; // Clear the table before populating

    rows.slice(1).forEach(row => {
        if (row.trim()) {
            const cols = row.split(',');
            const tableRow = document.createElement('tr');

            cols.forEach(col => {
                const tableCell = document.createElement('td');
                tableCell.textContent = col.trim();
                tableRow.appendChild(tableCell);
            });

            tableBody.appendChild(tableRow);
        }
    });

    filterTableByMonth(); 
    highlightToday(); 
    startCountdown(); // 🔥 countdown mula bila table dah siap
}
// ================== JAM ANALOG REALISTIK DENGAN GRADIENT ==================
function drawClock() {
  const canvas = document.getElementById("analogClock");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const radius = canvas.height / 2;
  ctx.translate(radius, radius);

  function draw() {
    ctx.clearRect(-radius, -radius, canvas.width, canvas.height);

    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    const second = now.getSeconds();

    // ================== Latar Belakang Gradient & Bezel ==================
    let gradient = ctx.createRadialGradient(0, 0, radius * 0.1, 0, 0, radius * 0.95);
    gradient.addColorStop(0, "#ffffff"); // tengah putih
    gradient.addColorStop(1, "#e0e0e0"); // luar kelabu lembut

    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.95, 0, 2 * Math.PI);
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.lineWidth = 10;
    ctx.strokeStyle = "#2e7d32"; // bezel hijau
    ctx.stroke();

    // ================== Tick Marks ==================
    for (let i = 0; i < 60; i++) {
      let ang = (i * Math.PI) / 30;
      let inner = i % 5 === 0 ? radius * 0.8 : radius * 0.88;
      ctx.beginPath();
      ctx.moveTo(inner * Math.sin(ang), -inner * Math.cos(ang));
      ctx.lineTo(radius * 0.92 * Math.sin(ang), -radius * 0.92 * Math.cos(ang));
      ctx.lineWidth = i % 5 === 0 ? 3 : 1;
      ctx.strokeStyle = "#000";
      ctx.stroke();
    }

    // ================== Nombor Jam ==================
    ctx.font = radius * 0.18 + "px Arial";
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    for (let num = 1; num <= 12; num++) {
      let ang = (num * Math.PI) / 6;
      let x = radius * 0.7 * Math.sin(ang);
      let y = -radius * 0.7 * Math.cos(ang);
      ctx.fillStyle = "#000";
      ctx.fillText(num.toString(), x, y);
    }

    // ================== Jarum ==================
    let hourPos = (hour % 12) * Math.PI / 6 + minute * Math.PI / (6 * 60);
    drawHand(ctx, hourPos, radius * 0.5, 6, "#000");

    let minPos = minute * Math.PI / 30 + second * Math.PI / (30 * 60);
    drawHand(ctx, minPos, radius * 0.75, 4, "#000");

    let secPos = second * Math.PI / 30;
    drawHand(ctx, secPos, radius * 0.85, 2, "red");

    // Pin tengah
    ctx.beginPath();
    ctx.arc(0, 0, 6, 0, 2 * Math.PI);
    ctx.fillStyle = "#000";
    ctx.fill();
  }

  function drawHand(ctx, pos, length, width, color) {
    ctx.beginPath();
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.strokeStyle = color;
    ctx.moveTo(0, 0);
    ctx.rotate(pos);
    ctx.lineTo(0, -length);
    ctx.stroke();
    ctx.rotate(-pos);
  }

  setInterval(draw, 1000);
}
drawClock();

function updateDigitalClock() {
  const now = new Date();
  let hours = now.getHours().toString().padStart(2, "0");
  let minutes = now.getMinutes().toString().padStart(2, "0");
  let seconds = now.getSeconds().toString().padStart(2, "0");

  document.getElementById("digitalClock").textContent =
    `${hours}:${minutes}:${seconds}`;
}

setInterval(updateDigitalClock, 1000);
updateDigitalClock(); // panggil sekali masa load


// Load the CSV file when the page is ready
document.addEventListener('DOMContentLoaded', loadCSV);
