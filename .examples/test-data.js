/**
 * ПРИМЕРЫ ТЕСТОВЫХ ДАННЫХ
 * 
 * Используйте эти данные для быстрого тестирования приложения
 * Выполните код в консоли браузера (F12 → Console)
 */

// ================================================================
// ВСТАВИТЬ ТЕСТОВЫЕ РЕЛИЗЫ
// ================================================================

// Скопируйте и выполните этот код в консоли браузера:

const testReleases = [
    {
        id: "1",
        title: "Midnight Dreams",
        artist: "Luna",
        slug: "midnight-dreams",
        description: "Дебютный альбом, погружающий слушателя в атмосферу ночных размышлений и мечтаний.",
        year: 2024,
        primaryColor: "#8a2be2",
        secondaryColor: "#ff6b8b",
        cover: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Crect fill='%238a2be2' width='300' height='300'/%3E%3Ctext x='50%25' y='50%25' font-size='40' fill='white' text-anchor='middle' dominant-baseline='middle'%3EMidnight Dreams%3C/text%3E%3C/svg%3E",
        services: [
            { type: "spotify", url: "https://open.spotify.com/album/example1" },
            { type: "apple", url: "https://music.apple.com/album/example1" },
            { type: "youtube", url: "https://music.youtube.com/browse/example1" }
        ],
        createdAt: new Date().toISOString(),
        views: 150
    },
    {
        id: "2",
        title: "Urban Nights",
        artist: "City Lights",
        slug: "urban-nights",
        description: "Второй альбом исследует ритмы современного города и энергию ночных улиц.",
        year: 2024,
        primaryColor: "#ff6b8b",
        secondaryColor: "#ffa500",
        cover: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Crect fill='%23ff6b8b' width='300' height='300'/%3E%3Ctext x='50%25' y='50%25' font-size='40' fill='white' text-anchor='middle' dominant-baseline='middle'%3EUrban Nights%3C/text%3E%3C/svg%3E",
        services: [
            { type: "spotify", url: "https://open.spotify.com/album/example2" },
            { type: "yandex", url: "https://music.yandex.ru/album/example2" },
            { type: "soundcloud", url: "https://soundcloud.com/example2" }
        ],
        createdAt: new Date().toISOString(),
        views: 89
    },
    {
        id: "3",
        title: "Crystal Waves",
        artist: "Ocean Echo",
        slug: "crystal-waves",
        description: "Волшебное путешествие через кристальные звуки и эхо океана.",
        year: 2023,
        primaryColor: "#667eea",
        secondaryColor: "#764ba2",
        cover: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Crect fill='%23667eea' width='300' height='300'/%3E%3Ctext x='50%25' y='50%25' font-size='40' fill='white' text-anchor='middle' dominant-baseline='middle'%3ECrystal Waves%3C/text%3E%3C/svg%3E",
        services: [
            { type: "apple", url: "https://music.apple.com/album/example3" },
            { type: "bandcamp", url: "https://bandcamp.com/example3" },
            { type: "tidal", url: "https://tidal.com/album/example3" }
        ],
        createdAt: new Date().toISOString(),
        views: 234
    },
    {
        id: "4",
        title: "Sunset Boulevard",
        artist: "Retro Vibes",
        slug: "sunset-boulevard",
        description: "Ностальгический альбом, вдохновленный эстетикой 80-х и 90-х годов.",
        year: 2023,
        primaryColor: "#ffa500",
        secondaryColor: "#ff4500",
        cover: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Crect fill='%23ffa500' width='300' height='300'/%3E%3Ctext x='50%25' y='50%25' font-size='30' fill='white' text-anchor='middle' dominant-baseline='middle'%3ESunset Boulevard%3C/text%3E%3C/svg%3E",
        services: [
            { type: "spotify", url: "https://open.spotify.com/album/example4" },
            { type: "deezer", url: "https://deezer.com/album/example4" }
        ],
        createdAt: new Date().toISOString(),
        views: 412
    },
    {
        id: "5",
        title: "Forest Whispers",
        artist: "Nature Sounds",
        slug: "forest-whispers",
        description: "Погружающий альбом со звуками природы и амбиентной музыкой.",
        year: 2024,
        primaryColor: "#11998e",
        secondaryColor: "#38ef7d",
        cover: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Crect fill='%2311998e' width='300' height='300'/%3E%3Ctext x='50%25' y='50%25' font-size='35' fill='white' text-anchor='middle' dominant-baseline='middle'%3EForest%3C/text%3E%3C/svg%3E",
        services: [
            { type: "spotify", url: "https://open.spotify.com/album/example5" },
            { type: "apple", url: "https://music.apple.com/album/example5" },
            { type: "soundcloud", url: "https://soundcloud.com/example5" },
            { type: "youtube", url: "https://music.youtube.com/browse/example5" }
        ],
        createdAt: new Date().toISOString(),
        views: 567
    }
];

// Выполнить загрузку
localStorage.setItem('musiclink_releases', JSON.stringify(testReleases));
console.log('✅ Тестовые данные загружены! Перезагрузите страницу.');

// ================================================================
// АЛЬТЕРНАТИВНАЯ ЗАГРУЗКА - ОДНА ЗА ОДНОЙ
// ================================================================

// Если вы хотите добавить данные постепенно:

function addTestRelease(title, artist, color1, color2) {
    const release = {
        id: Date.now().toString(),
        title: title,
        artist: artist,
        slug: title.toLowerCase().replace(/\s+/g, '-'),
        description: `${title} - новый альбом от ${artist}`,
        year: 2024,
        primaryColor: color1,
        secondaryColor: color2,
        cover: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Crect fill='${encodeURIComponent(color1)}' width='300' height='300'/%3E%3Ctext x='50%25' y='50%25' font-size='30' fill='white' text-anchor='middle' dominant-baseline='middle'%3E${title}%3C/text%3E%3C/svg%3E`,
        services: [
            { type: "spotify", url: `https://open.spotify.com/album/${Date.now()}` }
        ],
        createdAt: new Date().toISOString(),
        views: Math.floor(Math.random() * 500)
    };
    
    let releases = JSON.parse(localStorage.getItem('musiclink_releases') || '[]');
    releases.push(release);
    localStorage.setItem('musiclink_releases', JSON.stringify(releases));
    console.log(`✅ Добавлен: ${title}`);
}

// Примеры использования:
// addTestRelease('Night Echoes', 'Luna', '#9b59b6', '#e74c3c');
// addTestRelease('Digital Dreams', 'Synth Wave', '#3498db', '#2ecc71');

// ================================================================
// БЫСТРЫЕ КОМАНДЫ ДЛЯ КОНСОЛИ
// ================================================================

// Просмотреть все релизы
console.log(JSON.parse(localStorage.getItem('musiclink_releases')));

// Очистить все данные
// localStorage.removeItem('musiclink_releases');

// Получить статистику
function getStats() {
    const releases = JSON.parse(localStorage.getItem('musiclink_releases') || '[]');
    console.log('📊 СТАТИСТИКА:');
    console.log('  Релизов:', releases.length);
    console.log('  Ссылок:', releases.reduce((s, r) => s + (r.services?.length || 0), 0));
    console.log('  Просмотров:', releases.reduce((s, r) => s + (r.views || 0), 0));
}

// getStats();

// ================================================================
// HTML ДЛЯ БЫСТРОГО ИМПОРТА
// ================================================================

/*
Если вы хотите создать форму для импорта:

<textarea id="importData" placeholder="Вставьте JSON данные сюда" style="width: 100%; height: 200px;"></textarea>
<button onclick="importTestData()">Импортировать</button>

<script>
function importTestData() {
    try {
        const data = JSON.parse(document.getElementById('importData').value);
        localStorage.setItem('musiclink_releases', JSON.stringify(data));
        location.reload();
    } catch(e) {
        alert('Ошибка: неверный JSON');
    }
}
</script>
*/

// ================================================================
// ГЕНЕРАТОР РАНДОМНЫХ РЕЛИЗОВ
// ================================================================

function generateRandomReleases(count = 5) {
    const genres = ['Electronic', 'Ambient', 'Hip-Hop', 'Indie', 'Experimental', 'Jazz', 'Rock'];
    const adjectives = ['Dark', 'Bright', 'Crystal', 'Digital', 'Analog', 'Sonic', 'Ethereal'];
    const nouns = ['Dreams', 'Waves', 'Echoes', 'Vibes', 'Nights', 'Journey', 'Realm'];
    
    const artists = ['Luna', 'Void', 'Stellar', 'Echo', 'Neon', 'Pulse', 'Drift', 'Flux'];
    
    const colors = [
        ['#8a2be2', '#ff6b8b'],
        ['#ff6b8b', '#ffa500'],
        ['#667eea', '#764ba2'],
        ['#ffa500', '#ff4500'],
        ['#11998e', '#38ef7d'],
        ['#00d95f', '#0099ff'],
        ['#ff0080', '#ff8c00']
    ];
    
    const releases = [];
    
    for (let i = 0; i < count; i++) {
        const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
        const noun = nouns[Math.floor(Math.random() * nouns.length)];
        const title = `${adj} ${noun}`;
        const artist = artists[Math.floor(Math.random() * artists.length)];
        const colorPair = colors[Math.floor(Math.random() * colors.length)];
        
        releases.push({
            id: Date.now().toString() + i,
            title: title,
            artist: artist,
            slug: title.toLowerCase().replace(/\s+/g, '-'),
            description: `${title} - альбом в стиле ${genres[Math.floor(Math.random() * genres.length)]}`,
            year: 2024,
            primaryColor: colorPair[0],
            secondaryColor: colorPair[1],
            cover: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Crect fill='${encodeURIComponent(colorPair[0])}' width='300' height='300'/%3E%3Ctext x='50%25' y='50%25' font-size='28' fill='white' text-anchor='middle' dominant-baseline='middle'%3E${title}%3C/text%3E%3C/svg%3E`,
            services: [
                { type: "spotify", url: `https://open.spotify.com/album/${Math.random()}` },
                { type: "apple", url: `https://music.apple.com/album/${Math.random()}` }
            ],
            createdAt: new Date().toISOString(),
            views: Math.floor(Math.random() * 1000)
        });
    }
    
    localStorage.setItem('musiclink_releases', JSON.stringify(releases));
    console.log(`✅ Создано ${count} рандомных релизов!`);
    location.reload();
}

// generateRandomReleases(10);

// ================================================================
// ЭКСПОРТ ДАННЫХ В CSV
// ================================================================

function exportToCSV() {
    const releases = JSON.parse(localStorage.getItem('musiclink_releases') || '[]');
    
    let csv = 'Название,Исполнитель,Год,Просмотры,Ссылок,Цвет\n';
    releases.forEach(r => {
        csv += `"${r.title}","${r.artist}",${r.year},${r.views || 0},${r.services?.length || 0},"${r.primaryColor}"\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `musiclink-export-${Date.now()}.csv`;
    a.click();
}

// exportToCSV();

// ================================================================
// РАСШИРЕННАЯ СТАТИСТИКА
// ================================================================

function advancedStats() {
    const releases = JSON.parse(localStorage.getItem('musiclink_releases') || '[]');
    
    console.log('📊 РАСШИРЕННАЯ СТАТИСТИКА');
    console.log('============================');
    console.log(`Всего релизов: ${releases.length}`);
    console.log(`Всего просмотров: ${releases.reduce((s, r) => s + (r.views || 0), 0)}`);
    console.log(`Среднее просмотров: ${Math.round(releases.reduce((s, r) => s + (r.views || 0), 0) / releases.length)}`);
    console.log(`Самый просматриваемый: ${releases.reduce((a, b) => (b.views || 0) > (a.views || 0) ? b : a).title}`);
    
    // По платформам
    const platforms = {};
    releases.forEach(r => {
        (r.services || []).forEach(s => {
            platforms[s.type] = (platforms[s.type] || 0) + 1;
        });
    });
    console.log('Платформы:');
    Object.entries(platforms).forEach(([p, c]) => console.log(`  ${p}: ${c}`));
}

// advancedStats();

// ================================================================
// ОЧИСТКА И СБРОС
// ================================================================

function resetAllData() {
    if (confirm('Вы уверены? Все данные будут удалены!')) {
        localStorage.removeItem('musiclink_releases');
        localStorage.removeItem('musiclink_settings');
        localStorage.removeItem('musiclink_auth');
        console.log('✅ Все данные удалены');
        location.reload();
    }
}

// resetAllData();
