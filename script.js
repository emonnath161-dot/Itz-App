/**
 * NexGen App Store - Google Sheets Integrated System
 */

// আপনার গুগল শিট আইডিটি এখানে বসান
const SHEET_ID = '1nIO19n20c6h8_B9S1OL5d2GhCKjRlneaIKxP1XPg3vw'; 
const sheetURL = `https://docs.google.com/spreadsheets/d/1nIO19n20c6h8_B9S1OL5d2GhCKjRlneaIKxP1XPg3vw/export?format=csv`;

let allApps = [];
let filteredApps = [];
const appsPerPage = 20;
let currentPage = 1;

// ডাটা লোড করার ফাংশন
async function fetchSheetData() {
    try {
        const response = await fetch(sheetURL);
        if (!response.ok) throw new Error('Network response was not ok');
        
        const csvText = await response.text();
        const rows = csvText.split('\n').map(row => {
            // CSV এর কমা হ্যান্ডেল করার জন্য লজিক
            return row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        });
        
        // হেডার বাদ দিয়ে ডাটা ফরম্যাট
        allApps = rows.slice(1).map(col => ({
            name: col[0]?.replace(/^"|"$/g, '').trim(),
            desc: col[1]?.replace(/^"|"$/g, '').trim(),
            icon: col[2]?.replace(/^"|"$/g, '').trim(),
            link: col[3]?.replace(/^"|"$/g, '').trim(),
            badge: col[4]?.replace(/^"|"$/g, '').trim() || "NEW"
        })).filter(app => app.name && app.name.length > 1);

        filteredApps = [...allApps];
        displayApps(currentPage);
    } catch (error) {
        console.error("Error fetching data:", error);
        document.getElementById('appGrid').innerHTML = "<p style='color:red; text-align:center;'>ডাটা লোড করতে ব্যর্থ! শিট আইডি চেক করুন।</p>";
    }
}

function displayApps(page) {
    const appGrid = document.getElementById('appGrid');
    if(!appGrid) return;
    appGrid.innerHTML = "";
    page--;

    let start = appsPerPage * page;
    let end = start + appsPerPage;
    let paginatedItems = filteredApps.slice(start, end);

    if (paginatedItems.length === 0) {
        appGrid.innerHTML = "<p style='grid-column: 1/-1; text-align: center; color: #66fcf1;'>কোনো অ্যাপ পাওয়া যায়নি!</p>";
        return;
    }

    paginatedItems.forEach(app => {
        const card = document.createElement('div');
        card.className = 'app-card';
        card.innerHTML = `
            <span class="badge ${app.badge.includes('HOT') ? 'badge-hot' : 'badge-new'}">${app.badge}</span>
            <div class="app-icon">
                <img src="${app.icon}" alt="${app.name}" onerror="this.src='https://cdn-icons-png.flaticon.com/512/252/252232.png'" style="width: 50px; height: 50px; border-radius: 10px;">
            </div>
            <div class="app-title">${app.name}</div>
            <div class="app-desc">${app.desc}</div>
            <a href="${app.link}" class="download-btn" download target="_blank">DOWNLOAD</a>
        `;
        appGrid.appendChild(card);
    });

    document.getElementById('pageNumber').innerText = `Page ${currentPage}`;
    document.getElementById('prevBtn').disabled = currentPage === 1;
    document.getElementById('nextBtn').disabled = end >= filteredApps.length;
}

// সার্চ ফাংশন
const searchInput = document.getElementById('searchInput');
if(searchInput) {
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        filteredApps = allApps.filter(app => 
            app.name.toLowerCase().includes(query) || 
            app.desc.toLowerCase().includes(query)
        );
        currentPage = 1;
        displayApps(currentPage);
    });
}

// পেজিনেশন বাটন ক্লিক
document.getElementById('nextBtn').addEventListener('click', () => {
    currentPage++;
    displayApps(currentPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

document.getElementById('prevBtn').addEventListener('click', () => {
    currentPage--;
    displayApps(currentPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

document.addEventListener('DOMContentLoaded', fetchSheetData);
