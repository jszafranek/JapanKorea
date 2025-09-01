// Inicjalizacja mapy
let map;
let markers = [];
let routeLine;

// Współrzędne lotnisk na Cyprze
const airports = {
    larnaca: { lat: 34.8751, lng: 33.6249, name: "Lotnisko Larnaka" },
    paphos: { lat: 34.7180, lng: 32.4857, name: "Lotnisko Pafos" }
};

// Inicjalizacja po załadowaniu strony
document.addEventListener('DOMContentLoaded', function() {
    initMap();
    setupEditableFields();
    loadSavedData();
    calculateTotals();
    setupMobileFeatures();
    setupNavigation(); // Obsługa nawigacji
    loadTripPlan(); // Ładowanie planu podróży z JSON
});

// Inicjalizacja mapy Leaflet
function initMap() {
    // Centrum Cypru
    const cyprusCenter = { lat: 35.1264, lng: 33.4299 };
    
    // Opcje mapy dla lepszej obsługi na mobile
    const mapOptions = {
        center: [cyprusCenter.lat, cyprusCenter.lng],
        zoom: 9,
        scrollWheelZoom: false, // Wyłącz scroll zoom
        dragging: !L.Browser.mobile, // Wyłącz przeciąganie na mobile początkowo
        tap: false // Wyłącz tap handler który powoduje problemy
    };
    
    map = L.map('map', mapOptions);
    
    // Dodanie warstwy mapy
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    
    // Dodanie markerów lotnisk
    const larnacaMarker = L.marker([airports.larnaca.lat, airports.larnaca.lng])
        .addTo(map)
        .bindPopup(`<strong>${airports.larnaca.name}</strong><br>Start podróży<br>16.10.2025`);
    
    const paphosMarker = L.marker([airports.paphos.lat, airports.paphos.lng])
        .addTo(map)
        .bindPopup(`<strong>${airports.paphos.name}</strong><br>Koniec podróży<br>27.10.2025`);
    
    markers.push(larnacaMarker, paphosMarker);
    
    // Przykładowa trasa
    const sampleRoute = [
        [airports.larnaca.lat, airports.larnaca.lng],
        [34.9823, 33.9989], // Ajia Napa
        [35.1725, 33.3614], // Nikozja
        [34.9250, 32.8653], // Troodos
        [34.7071, 33.0226], // Limassol
        [34.8553, 32.3680], // Coral Bay
        [airports.paphos.lat, airports.paphos.lng]
    ];
    
    routeLine = L.polyline(sampleRoute, {
        color: '#0066cc',
        weight: 3,
        opacity: 0.7,
        smoothFactor: 1
    }).addTo(map);
    
    // Dodanie punktów pośrednich
    const waypoints = [
        { name: "Ajia Napa", lat: 34.9823, lng: 33.9989 },
        { name: "Nikozja", lat: 35.1725, lng: 33.3614 },
        { name: "Góry Troodos", lat: 34.9250, lng: 32.8653 },
        { name: "Limassol", lat: 34.7071, lng: 33.0226 },
        { name: "Coral Bay", lat: 34.8553, lng: 32.3680 }
    ];
    
    waypoints.forEach(point => {
        const marker = L.circleMarker([point.lat, point.lng], {
            radius: 6,
            fillColor: "#ff9500",
            color: "#fff",
            weight: 2,
            opacity: 1,
            fillOpacity: 0.8
        }).addTo(map).bindPopup(point.name);
        markers.push(marker);
    });
    
    // Dopasowanie widoku do trasy
    map.fitBounds(routeLine.getBounds().pad(0.1));
}

// Obsługa edytowalnych pól - WYŁĄCZONA (dane są hardcoded)
function setupEditableFields() {
    // Funkcja wyłączona - wszystkie pola są tylko do odczytu
    // Dane są hardcoded i nie mogą być zmieniane przez użytkownika
    
    // Usunięcie kursora pointer z pól edytowalnych
    const editableFields = document.querySelectorAll('.editable');
    editableFields.forEach(field => {
        field.style.cursor = 'default';
        field.title = 'Pole tylko do odczytu';
    });
}

// Obliczanie sum - używa hardcoded wartości
function calculateTotals() {
    // Hardcoded wartości cen
    const rentalPrice = 2500;
    const hotel1Price = 1200;
    const hotel2Price = 1500;
    const hotel3Price = 1800;
    const insurancePrice = 450;
    
    // Suma za noclegi
    const accommodationTotal = hotel1Price + hotel2Price + hotel3Price;
    
    // Aktualizuj sumy w sekcjach
    document.getElementById('rental-total').innerText = rentalPrice + ' zł';
    document.getElementById('accommodation-total').innerText = accommodationTotal + ' zł';
    document.getElementById('insurance-total').innerText = insurancePrice + ' zł';
    
    // Aktualizuj podsumowanie
    document.getElementById('summary-rental').innerText = rentalPrice + ' zł';
    document.getElementById('summary-accommodation').innerText = accommodationTotal + ' zł';
    document.getElementById('summary-insurance').innerText = insurancePrice + ' zł';
    
    // Dodatkowe koszty - hardcoded
    const foodBudget = 3000;
    const fuelBudget = 600;
    const attractionsBudget = 1500;
    
    // Suma całkowita (loty są stałe: 2164 zł)
    const flightsTotal = 2164;
    const grandTotal = flightsTotal + rentalPrice + accommodationTotal + insurancePrice + 
                       foodBudget + fuelBudget + attractionsBudget;
    
    document.getElementById('grand-total').innerText = grandTotal + ' zł';
    document.getElementById('per-person-total').innerText = Math.round(grandTotal / 2) + ' zł';
}

// Funkcja zapisywania danych - wyłączona (dane hardcoded)
function saveData(field, value) {
    // Funkcja wyłączona - dane są hardcoded
}

// Wczytywanie danych - używa hardcoded wartości
function loadSavedData() {
    // Hardcoded dane podróży
    const travelData = {
        'rental-price': '2500',
        'hotel-1-price': '1200',
        'hotel-2-price': '1500',
        'hotel-3-price': '1800',
        'insurance-price': '450',
        'fuel-budget': '600',
        'food-budget': '3000',
        'attractions-budget': '1500'
    };
    
    Object.keys(travelData).forEach(field => {
        if (field === 'totals') return;
        
        const element = document.querySelector(`[data-field="${field}"]`);
        if (element) {
            const value = travelData[field];
            if (value && value !== 'Do uzupełnienia' && value !== '0') {
                element.innerText = value;
                element.classList.add('filled');
                
                // Dla cen, aktualizuj również data-price
                if (element.dataset.type === 'price') {
                    const priceTag = element.closest('.price-tag');
                    if (priceTag) {
                        priceTag.setAttribute('data-price', value);
                    }
                }
            }
        }
    });
}

// Funkcja do pokazywania/ukrywania biletów
function toggleTickets(type) {
    const ticketsDiv = document.getElementById(type + '-tickets');
    const button = event.target;
    
    if (ticketsDiv.style.display === 'none') {
        ticketsDiv.style.display = 'block';
        button.innerHTML = '🎫 Ukryj bilety';
        button.classList.add('active');
    } else {
        ticketsDiv.style.display = 'none';
        button.innerHTML = '🎫 Pokaż bilety';
        button.classList.remove('active');
    }
}

// Funkcje dla przycisków akcji - Wynajem samochodu
function openRentalComparison() {
    window.open('https://www.rentalcars.com/en/city/cy/larnaca/', '_blank');
}

function openRentalContract() {
    alert('📄 Umowa wynajmu zostanie wygenerowana po uzupełnieniu danych');
    // Tutaj można dodać generowanie PDF z umową
}

function openDrivingTips() {
    window.open('https://www.visitcyprus.com/index.php/en/practical-info/driving-in-cyprus', '_blank');
}

// Funkcje dla przycisków akcji - Noclegi
function openBookingConfirmation() {
    alert('📧 Potwierdzenia rezerwacji zostaną pobrane z emaila');
    // Tutaj można dodać funkcję do wyświetlania potwierdzeń
}

// Funkcje dla indywidualnych hoteli
function showHotelDetails(hotelNumber) {
    alert(`📧 Szczegóły rezerwacji dla Noclegu ${hotelNumber} zostaną wyświetlone`);
    // Tutaj można dodać wyświetlanie szczegółów konkretnego hotelu
}

function showHotelOnMap(hotelNumber) {
    const hotelLocations = {
        1: { lat: 34.9003, lng: 33.6232, name: 'Nocleg 1 - Larnaka' },
        2: { lat: 35.1856, lng: 33.3823, name: 'Nocleg 2 - Nikozja' },
        3: { lat: 34.7720, lng: 32.4297, name: 'Nocleg 3 - Pafos' }
    };
    
    const hotel = hotelLocations[hotelNumber];
    if (hotel) {
        // Przewiń do mapy
        document.getElementById('mapa').scrollIntoView({ behavior: 'smooth' });
        
        // Wycentruj mapę na hotelu
        setTimeout(() => {
            map.setView([hotel.lat, hotel.lng], 13);
            
            // Dodaj tymczasowy marker
            const tempMarker = L.marker([hotel.lat, hotel.lng])
                .addTo(map)
                .bindPopup(`<strong>${hotel.name}</strong>`)
                .openPopup();
            
            // Usuń marker po 5 sekundach
            setTimeout(() => {
                map.removeLayer(tempMarker);
            }, 5000);
        }, 500);
    }
}

function showHotelInstructions(hotelNumber) {
    const instructions = `
    📋 INSTRUKCJE DLA NOCLEGU ${hotelNumber}
    
    CHECK-IN:
    • Godzina: od 14:00
    • Wymagane dokumenty: paszport/dowód osobisty
    • Kaucja: może być wymagana (karta kredytowa)
    
    CHECK-OUT:
    • Godzina: do 11:00
    • Zdaj klucze w recepcji
    • Sprawdź czy niczego nie zostawiłeś
    
    KONTAKT DO HOTELU:
    • Telefon: +357 XX XXX XXX
    • Email: hotel${hotelNumber}@example.com
    
    UDOGODNIENIA:
    • WiFi: bezpłatne w całym obiekcie
    • Parking: dostępny
    • Śniadanie: 7:00-10:00
    
    W RAZIE PROBLEMÓW:
    • Recepcja 24h
    • Numer alarmowy: 112
    `;
    
    alert(instructions);
    // W przyszłości można to zastąpić modalem lub pobraniem PDF
}

function openHotelMap() {
    // Otwórz mapę z zaznaczonymi hotelami
    const hotels = [
        { name: 'Hotel 1', lat: 34.9003, lng: 33.6232 },
        { name: 'Hotel 2', lat: 35.1856, lng: 33.3823 },
        { name: 'Hotel 3', lat: 34.7720, lng: 32.4297 }
    ];
    alert('📍 Lokalizacje hoteli są widoczne na mapie poniżej');
    document.getElementById('mapa').scrollIntoView({ behavior: 'smooth' });
}

function openHotelReviews() {
    window.open('https://www.tripadvisor.com/Hotels-g190372-Cyprus-Hotels.html', '_blank');
}

// Funkcje dla przycisków akcji - Ubezpieczenie
function openInsurancePolicy() {
    alert('📋 Polisa ubezpieczenia - dokument PDF zostanie pobrany');
    // Tutaj można dodać pobieranie polisy
}

function openEmergencyContacts() {
    const contacts = `
    🆘 KONTAKTY ALARMOWE NA CYPRZE:
    
    • Pogotowie: 112 lub 199
    • Policja: 112 lub 199
    • Straż pożarna: 112 lub 199
    • Pomoc drogowa: 1111
    • Ambasada RP: +357 22 75 33 17
    • Generali Assistance: +48 22 522 28 60
    `;
    alert(contacts);
}

function openClaimForm() {
    window.open('https://www.generali.pl/zglos-szkode', '_blank');
}

// Funkcje dla przycisków akcji - Mapa
function openGoogleMaps() {
    // Otwórz trasę w Google Maps
    const route = 'https://www.google.com/maps/dir/Larnaca+Airport/Ayia+Napa/Nicosia/Troodos/Limassol/Paphos+Airport';
    window.open(route, '_blank');
}

function openAttractions() {
    window.open('https://www.visitcyprus.com/index.php/en/discovercyprus/sights-monuments', '_blank');
}

function openRouteDetails() {
    const routeDetails = `
    📍 SZCZEGÓŁOWA TRASA PODRÓŻY:
    
    Dzień 1-3: Larnaka i okolice
    • Kościół św. Łazarza
    • Słone Jezioro
    • Plaża Finikoudes
    
    Dzień 4-5: Ajia Napa
    • Nissi Beach
    • Blue Lagoon
    • Cape Greco
    
    Dzień 6-7: Nikozja
    • Stare miasto
    • Zielona linia
    • Muzea
    
    Dzień 8-9: Góry Troodos
    • Klasztor Kykkos
    • Wodospady
    • Wioski górskie
    
    Dzień 10-11: Limassol i Pafos
    • Kourion
    • Petra tou Romiou
    • Grobowce Królewskie
    `;
    alert(routeDetails);
}

// Funkcja do przełączania widoczności sekcji
function toggleSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.classList.toggle('collapsed');
    }
}

// Funkcje dla sekcji Plan Podróży
function showDay(dayNumber) {
    // Ukryj wszystkie dni
    const allDays = document.querySelectorAll('.day-content');
    allDays.forEach(day => {
        day.style.display = 'none';
    });
    
    // Usuń aktywną klasę ze wszystkich przycisków
    const allButtons = document.querySelectorAll('.day-btn');
    allButtons.forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Pokaż wybrany dzień
    const selectedDay = document.getElementById(`day-${dayNumber}`);
    if (selectedDay) {
        selectedDay.style.display = 'block';
    }
    
    // Zaznacz aktywny przycisk
    if (allButtons[dayNumber - 1]) {
        allButtons[dayNumber - 1].classList.add('active');
    }
}

function toggleAllDays() {
    const allDays = document.querySelectorAll('.day-content');
    const button = event.target;
    
    // Sprawdź czy wszystkie dni są widoczne
    const allVisible = Array.from(allDays).every(day => day.style.display !== 'none');
    
    if (allVisible) {
        // Pokaż tylko pierwszy dzień
        allDays.forEach((day, index) => {
            day.style.display = index === 0 ? 'block' : 'none';
        });
        button.textContent = '📋 Pokaż cały plan';
        
        // Aktywuj pierwszy przycisk
        showDay(1);
    } else {
        // Pokaż wszystkie dni
        allDays.forEach(day => {
            day.style.display = 'block';
        });
        button.textContent = '📌 Zwiń plan';
        
        // Usuń aktywną klasę ze wszystkich przycisków
        document.querySelectorAll('.day-btn').forEach(btn => {
            btn.classList.remove('active');
        });
    }
}

// Funkcja ładowania planu podróży z pliku JSON
async function loadTripPlan() {
    try {
        const response = await fetch('plajs.json');
        const data = await response.json();
        
        // Generuj HTML dla wszystkich dni
        generateAllDaysHTML(data);
        
        // Pokaż tylko pierwszy dzień na starcie
        showDay(1);
    } catch (error) {
        console.error('Błąd ładowania planu podróży:', error);
    }
}

// Funkcja generująca HTML dla wszystkich dni
function generateAllDaysHTML(data) {
    const planSection = document.getElementById('plan-podrozy');
    if (!planSection) return;
    
    // Znajdź miejsce na dni (po nawigacji)
    const daysNavigation = planSection.querySelector('.days-navigation');
    if (!daysNavigation) return;
    
    // Usuń istniejące dni
    const existingDays = planSection.querySelectorAll('.day-content');
    existingDays.forEach(day => day.remove());
    
    // Wygeneruj HTML dla każdego dnia
    data.days.forEach((day) => {
        // Dodaj informację o bazie na podstawie numeru dnia
        const dayWithBase = { ...day };
        if (data.trip_info && data.trip_info.bases) {
            // Określ bazę na podstawie numeru dnia
            if (day.day_number >= 1 && day.day_number <= 3) {
                dayWithBase.base = "Larnaka";
            } else if (day.day_number >= 4 && day.day_number <= 5) {
                dayWithBase.base = "Troodos";
            } else if (day.day_number >= 6 && day.day_number <= 12) {
                dayWithBase.base = "Pafos";
            }
        }
        
        const dayHTML = generateDayHTML(dayWithBase);
        // Wstaw po nawigacji
        daysNavigation.insertAdjacentHTML('afterend', dayHTML);
    });
}

// Funkcja generująca HTML dla pojedynczego dnia
function generateDayHTML(day) {
    // Obsługa mieszanych typów - activity i travel
    const activities = day.activities.map(item => {
        if (item.type === 'travel') {
            return generateTravelHTML(item);
        } else {
            // Domyślnie traktuj jako activity (dla kompatybilności wstecznej)
            return generateActivityHTML(item);
        }
    }).join('');
    
    return `
        <div class="day-content" id="day-${day.day_number}" style="display: none;">
            <div class="day-header">
                <h3>Dzień ${day.day_number} - ${day.day_name}, ${formatDate(day.date)}</h3>
                <p class="day-subtitle">${day.title}</p>
                <span class="day-theme">${day.day_theme || ''}</span>
                ${day.base ? `<span class="day-location">📍 ${day.base}</span>` : ''}
            </div>
            
            ${day.summary ? `
                <div class="day-summary">
                    ${day.summary.overview ? `
                        <div class="summary-overview">
                            <h4>📝 Podsumowanie dnia</h4>
                            <p>${day.summary.overview}</p>
                        </div>
                    ` : ''}
                    ${day.summary.logistics ? `
                        <div class="summary-logistics">
                            <h4>🚗 Logistyka</h4>
                            <p>${day.summary.logistics}</p>
                        </div>
                    ` : ''}
                </div>
            ` : ''}
            
            <div class="timeline">
                ${activities}
            </div>
            
            ${generateMealsHTML(day.daily_meals || day.meals)}
        </div>
    `;
}

// Funkcja generująca HTML dla segmentu podróży (travel)
function generateTravelHTML(travel) {
    const pointsOfInterest = travel.points_of_interest && travel.points_of_interest.length ? `
        <div class="travel-points-of-interest">
            <h5>📍 Warto zobaczyć po drodze:</h5>
            ${travel.points_of_interest.map(poi => `
                <div class="poi-item">
                    <strong>${poi.name}</strong>
                    <p>${poi.description}</p>
                </div>
            `).join('')}
        </div>
    ` : '';
    
    return `
        <div class="timeline-item timeline-travel">
            <div class="timeline-time">${travel.time}</div>
            <div class="timeline-content travel-content">
                <h4>🚗 ${travel.from} → ${travel.to}</h4>
                <div class="travel-details">
                    <span>⏱️ ${travel.duration}</span>
                    <span class="separator">•</span>
                    <span>📏 ${travel.distance}</span>
                </div>
                ${travel.description ? `<p class="travel-description">${travel.description}</p>` : ''}
                ${pointsOfInterest}
            </div>
        </div>
    `;
}

// Funkcja generująca HTML dla aktywności
function generateActivityHTML(activity) {
    // Użyj pierwszego tagu jako kategorii głównej dla stylowania
    const mainCategory = activity.tags && activity.tags.length > 0 ? activity.tags[0] : '';
    const categoryClass = getCategoryClass(mainCategory);
    const tags = activity.tags ? activity.tags.map(tag => `<span class="tag-small">${tag}</span>`).join(' ') : '';
    
    const details = [];
    if (activity.location?.distance) details.push(`📍 ${activity.location.distance}`);
    if (activity.duration) details.push(`⏱️ ${activity.duration}`);
    if (activity.details?.cost) details.push(`🎫 ${activity.details.cost}`);
    if (activity.details?.booking === 'wymagana') details.push(`📅 Rezerwacja wymagana`);
    
    return `
        <div class="timeline-item ${categoryClass}">
            <div class="timeline-time">${activity.time}</div>
            <div class="timeline-content">
                <h4>${getActivityIcon(mainCategory)} ${activity.title}</h4>
                <p>${activity.description}</p>
                ${tags ? `<div class="activity-tags">${tags}</div>` : ''}
                ${details.length ? `
                    <div class="activity-details">
                        ${details.join('<span class="separator"> • </span>')}
                    </div>
                ` : ''}
                ${activity.tips && activity.tips.length ? `
                    <div class="activity-tips">
                        💡 ${activity.tips[0]}
                    </div>
                ` : ''}
                ${activity.alternatives && activity.alternatives.length ? `
                    <div class="activity-alternatives">
                        <h5>🔄 Alternatywne opcje:</h5>
                        ${activity.alternatives.map(alt => `
                            <div class="alternative-item">
                                <strong>${alt.name}</strong>
                                <p>${alt.reason}</p>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

// Funkcja generująca HTML dla posiłków
function generateMealsHTML(meals) {
    if (!meals || (!meals.breakfast && !meals.lunch && !meals.dinner)) return '';
    
    const mealItems = [];
    
    // Obsługa nowej struktury z place i descrip
    if (meals.breakfast) {
        const breakfastText = meals.breakfast.descrip 
            ? `🥐 Śniadanie: ${meals.breakfast.place} - ${meals.breakfast.descrip}`
            : `🥐 Śniadanie: ${meals.breakfast.place || meals.breakfast}`;
        mealItems.push(breakfastText);
    }
    
    if (meals.lunch) {
        const lunchText = meals.lunch.descrip
            ? `🍽️ Lunch: ${meals.lunch.place} - ${meals.lunch.descrip}`
            : `🍽️ Lunch: ${meals.lunch.place || meals.lunch}${meals.lunch.cost ? ` (~${meals.lunch.cost})` : ''}`;
        mealItems.push(lunchText);
    }
    
    if (meals.dinner) {
        const dinnerText = meals.dinner.descrip
            ? `🍷 Kolacja: ${meals.dinner.place} - ${meals.dinner.descrip}`
            : `🍷 Kolacja: ${meals.dinner.place || meals.dinner}${meals.dinner.cost ? ` (~${meals.dinner.cost})` : ''}`;
        mealItems.push(dinnerText);
    }
    
    return `
        <div class="meals-summary">
            <h4>Posiłki dnia:</h4>
            ${mealItems.map(item => `<p>${item}</p>`).join('')}
        </div>
    `;
}

// Funkcje pomocnicze
function getCategoryClass(tag) {
    const classes = {
        'zwiedzanie': 'highlight-culture',
        'aktywność': 'highlight-activity',
        'trekking': 'highlight-activity',
        'relaks': 'highlight-relax',
        'transport': 'highlight-transport',
        'logistyka': 'highlight-transport',
        'posiłek': 'highlight-meal',
        'kuchnia lokalna': 'highlight-meal',
        'nocleg': 'highlight-accommodation',
        'historia': 'highlight-culture',
        'sztuka bizantyjska': 'highlight-culture',
        'historia starożytna': 'highlight-culture',
        'fotografia': 'highlight-culture',
        'miasto': 'highlight-culture',
        'plaża': 'highlight-relax',
        'zachód słońca': 'highlight-relax',
        'spacer': 'highlight-activity'
    };
    return classes[tag] || '';
}

function getActivityIcon(tag) {
    const icons = {
        'transport': '🚗',
        'logistyka': '📋',
        'zwiedzanie': '🏛️',
        'aktywność': '🥾',
        'trekking': '🥾',
        'relaks': '☕',
        'posiłek': '🍽️',
        'kuchnia lokalna': '🍽️',
        'nocleg': '🏨',
        'zakupy': '🛍️',
        'historia': '🏛️',
        'sztuka bizantyjska': '⛪',
        'historia starożytna': '🏺',
        'fotografia': '📸',
        'miasto': '🏙️',
        'plaża': '🏖️',
        'zachód słońca': '🌅',
        'spacer': '🚶'
    };
    return icons[tag] || '📍';
}

function formatDate(dateStr) {
    const months = ['stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca',
                   'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia'];
    const date = new Date(dateStr);
    return `${date.getDate()} ${months[date.getMonth()]}`;
}

// Funkcja do eksportu danych - wyłączona
function exportData() {
    // Funkcja wyłączona - dane są hardcoded
    alert('Eksport danych został wyłączony - wszystkie dane są hardcoded');
}

// Funkcja do importu danych - wyłączona
function importData(file) {
    // Funkcja wyłączona - dane są hardcoded
    alert('Import danych został wyłączony - wszystkie dane są hardcoded');
}

// Funkcja obsługi nawigacji
function setupNavigation() {
    const sections = document.querySelectorAll('section');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav a');
    const desktopNavLinks = document.querySelectorAll('.desktop-nav .nav-item');
    
    // Obsługa aktywnej sekcji podczas scrollowania
    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (scrollY >= (sectionTop - 200)) {
                current = section.getAttribute('id');
            }
        });
        
        // Update mobile nav
        mobileNavLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') && link.getAttribute('href').substring(1) === current) {
                link.classList.add('active');
            }
        });
        
        // Update desktop nav
        desktopNavLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') && link.getAttribute('href').substring(1) === current) {
                link.classList.add('active');
            }
        });
    });
    
    // Smooth scrolling z uwzględnieniem wysokości nawigacji
    document.querySelectorAll('.desktop-nav a, .mobile-nav a').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerHeight = document.querySelector('header').offsetHeight;
                const navHeight = window.innerWidth > 768 ? 
                    (document.querySelector('.desktop-nav') ? document.querySelector('.desktop-nav').offsetHeight : 0) :
                    (document.querySelector('.mobile-nav') ? document.querySelector('.mobile-nav').offsetHeight : 0);
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - navHeight - 10;
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Funkcje dla urządzeń mobilnych
function setupMobileFeatures() {
    // Smooth scrolling dla linków nawigacji
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerHeight = document.querySelector('header').offsetHeight;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerHeight - 10;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Lepsze doświadczenie edycji na mobile
    if ('ontouchstart' in window) {
        document.querySelectorAll('.editable').forEach(field => {
            field.addEventListener('touchstart', function(e) {
                e.preventDefault();
                this.click();
            });
        });
    }

    // Zapobieganie zoom przy double tap
    let lastTouchEnd = 0;
    document.addEventListener('touchend', function (e) {
        const now = Date.now();
        if (now - lastTouchEnd <= 300) {
            e.preventDefault();
        }
        lastTouchEnd = now;
    }, false);

    // Dostosowanie mapy dla mobile
    if (window.innerWidth <= 768) {
        map.setZoom(8);
        
        // Włącz kontrolkę fullscreen dla mobile
        addMapControls();
    }
    
    // Obsługa kliknięcia w mapę - włącz/wyłącz interakcję
    const mapContainer = document.getElementById('map');
    let mapFocused = false;
    
    mapContainer.addEventListener('click', function() {
        if (!mapFocused) {
            map.dragging.enable();
            map.scrollWheelZoom.enable();
            mapContainer.style.border = '2px solid var(--primary-color)';
            mapFocused = true;
        }
    });
    
    // Wyłącz interakcję gdy klikniemy poza mapą
    document.addEventListener('click', function(e) {
        if (!mapContainer.contains(e.target) && mapFocused) {
            map.dragging.disable();
            map.scrollWheelZoom.disable();
            mapContainer.style.border = '2px solid var(--border-color)';
            mapFocused = false;
        }
    });

    // Aktywna sekcja w nawigacji
    const observerOptions = {
        root: null,
        rootMargin: '-20% 0px -70% 0px',
        threshold: 0
    };

    const observerCallback = (entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                document.querySelectorAll('.mobile-nav a').forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    document.querySelectorAll('.section').forEach(section => {
        observer.observe(section);
    });
}

// Dodaj kontrolki do mapy
function addMapControls() {
    // Przycisk do centrowania mapy
    const centerButton = L.control({position: 'topright'});
    
    centerButton.onAdd = function() {
        const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
        div.innerHTML = '<a href="#" style="width: 30px; height: 30px; line-height: 30px; text-align: center;">🎯</a>';
        
        div.onclick = function(e) {
            e.preventDefault();
            map.fitBounds(routeLine.getBounds().pad(0.1));
            return false;
        };
        
        return div;
    };
    
    centerButton.addTo(map);
}