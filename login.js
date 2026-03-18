// Felhasználók tárolása
let felhasznalok = [];
let aktivFelhasznalok = [];
let demoNevek = [];
let demoUsers = [];

// Konfiguráció betöltése JSON-ból
async function loadConfig() {
    try {
        const response = await fetch('data.json');
        const data = await response.json();
        
        demoUsers = data.demoUsers;
        demoNevek = data.demoNames;
        
        // Alapértelmezett felhasználók beállítása
        felhasznalok = demoUsers;
        
        return data;
    } catch (error) {
        console.error('Hiba a konfiguráció betöltésekor:', error);
        return null;
    }
}

// Felhasználók betöltése localStorage-ból
function betoltFelhasznalok() {
    const stored = localStorage.getItem('felhasznalok');
    if (stored) {
        felhasznalok = JSON.parse(stored);
    } else {
        // Alapértelmezett felhasználók használata
        felhasznalok = demoUsers;
        mentFelhasznalok();
    }
}

// Aktív felhasználók betöltése - MOST TÖRÖLJÜK A RÉGIEKET
function betoltAktivFelhasznalok() {
    // Töröljük a régi aktív felhasználókat
    localStorage.removeItem('aktivFelhasznalok');
    aktivFelhasznalok = [];
    frissitAktivFelhasznaloKijelzot();
}

// Aktív felhasználók mentése
function mentAktivFelhasznalok() {
    localStorage.setItem('aktivFelhasznalok', JSON.stringify(aktivFelhasznalok));
}

// Felhasználók mentése localStorage-ba
function mentFelhasznalok() {
    localStorage.setItem('felhasznalok', JSON.stringify(felhasznalok));
}

// Regisztráció
function regisztracio() {
    const nev = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const jelszo = document.getElementById('regPassword').value;
    const jelszoConfirm = document.getElementById('regPasswordConfirm').value;
    
    // Ellenőrzések
    if (!nev || !email || !jelszo || !jelszoConfirm) {
        alert('Minden mezőt ki kell tölteni!');
        return;
    }
    
    if (!email.includes('@')) {
        alert('Az email címnek tartalmaznia kell a @ karaktert!');
        return;
    }
    
    if (jelszo.length < 8) {
        alert('A jelszónak legalább 8 karakter hosszúnak kell lennie!');
        return;
    }
    
    if (jelszo !== jelszoConfirm) {
        alert('A jelszavak nem egyeznek!');
        return;
    }
    
    if (felhasznalok.some(f => f.email === email)) {
        alert('Ezzel az email címmel már regisztráltak!');
        return;
    }
    
    // Új felhasználó hozzáadása
    const ujFelhasznalo = {
        nev: nev,
        email: email,
        jelszo: jelszo
    };
    
    felhasznalok.push(ujFelhasznalo);
    mentFelhasznalok();
    
    alert('Sikeres regisztráció! Most már bejelentkezhetsz.');
    
    // Űrlap ürítése és panel bezárása
    document.getElementById('regName').value = '';
    document.getElementById('regEmail').value = '';
    document.getElementById('regPassword').value = '';
    document.getElementById('regPasswordConfirm').value = '';
    
    // Panel bezárása
    const panel = document.getElementById('registerPanel');
    const arrow = document.getElementById('registerArrow');
    panel.classList.remove('open');
    arrow.style.transform = 'rotate(0deg)';
}

// Bejelentkezés
function bejelentkezes() {
    const email = document.getElementById('loginEmail').value.trim();
    const jelszo = document.getElementById('loginPassword').value;
    
    if (!email || !jelszo) {
        alert('Minden mezőt ki kell tölteni!');
        return;
    }
    
    // Felhasználó keresése
    const felhasznalo = felhasznalok.find(f => f.email === email && f.jelszo === jelszo);
    
    if (felhasznalo) {
        // Hozzáadás az aktív felhasználókhoz
        if (!aktivFelhasznalok.some(f => f.email === email)) {
            aktivFelhasznalok.push({
                nev: felhasznalo.nev,
                email: felhasznalo.email,
                bejelentkezesIdo: new Date().toISOString()
            });
            mentAktivFelhasznalok();
        }
        
        // Felhasználó mentése localStorage-be
        localStorage.setItem('aktualisFelhasznalo', JSON.stringify(felhasznalo));
        
        // Átirányítás a játék oldalára
        window.location.href = 'jatek.html';
    } else {
        alert('Hibás email cím vagy jelszó!');
    }
}

// Kijelentkezés
function kijelentkezes() {
    const aktualisFelhasznalo = JSON.parse(localStorage.getItem('aktualisFelhasznalo') || '{}');
    
    if (aktualisFelhasznalo && aktualisFelhasznalo.email) {
        // Eltávolítás az aktív felhasználók közül
        aktivFelhasznalok = aktivFelhasznalok.filter(f => f.email !== aktualisFelhasznalo.email);
        mentAktivFelhasznalok();
    }
    
    localStorage.removeItem('aktualisFelhasznalo');
    window.location.href = 'index.html';
}

// Vendégként belépés
function vendegBelépés() {
    const vendegNev = 'Vendég_' + Math.floor(Math.random() * 1000);
    
    const vendeg = {
        nev: vendegNev,
        email: 'vendeg_' + Date.now() + '@vendeg.hu',
        jelszo: 'vendeg'
    };
    
    // Hozzáadás az aktív felhasználókhoz
    aktivFelhasznalok.push({
        nev: vendeg.nev,
        email: vendeg.email,
        bejelentkezesIdo: new Date().toISOString()
    });
    mentAktivFelhasznalok();
    
    localStorage.setItem('aktualisFelhasznalo', JSON.stringify(vendeg));
    window.location.href = 'jatek.html';
}

// Aktív felhasználók kijelzőjének frissítése
function frissitAktivFelhasznaloKijelzot() {
    const szamElem = document.getElementById('aktivFelhasznaloSzam');
    const avatarokElem = document.getElementById('aktivFelhasznaloAvaterek');
    
    if (szamElem) {
        szamElem.textContent = aktivFelhasznalok.length;
    }
    
    if (avatarokElem) {
        avatarokElem.innerHTML = '';
        
        // Csak akkor jelenítünk meg avatárokat, ha van aktív felhasználó
        if (aktivFelhasznalok.length > 0) {
            // Maximum 5 avatár megjelenítése
            const megjelenitendo = aktivFelhasznalok.slice(-5);
            
            megjelenitendo.forEach((user, index) => {
                const avatar = document.createElement('div');
                avatar.className = 'user-avatar border-2 border-white';
                avatar.style.backgroundColor = '#667eea';
                avatar.style.zIndex = 10 - index;
                avatar.textContent = user.nev.charAt(0).toUpperCase();
                avatar.title = user.nev;
                avatarokElem.appendChild(avatar);
            });
            
            // Ha több mint 5 aktív felhasználó van
            if (aktivFelhasznalok.length > 5) {
                const plusz = document.createElement('div');
                plusz.className = 'user-avatar border-2 border-white bg-gray-600';
                plusz.style.zIndex = 5;
                plusz.textContent = '+' + (aktivFelhasznalok.length - 5);
                plusz.title = 'További ' + (aktivFelhasznalok.length - 5) + ' felhasználó';
                avatarokElem.appendChild(plusz);
            }
        } else {
            // Ha nincs aktív felhasználó, ne jelenítsünk meg semmit
            // Vagy opcionálisan egy üres helyőrzőt
            const ures = document.createElement('div');
            ures.className = 'text-xs text-gray-400';
            ures.textContent = '0';
            avatarokElem.appendChild(ures);
        }
    }
}

// Regisztrációs panel lenyitása/zárása
function toggleRegister() {
    const panel = document.getElementById('registerPanel');
    const arrow = document.getElementById('registerArrow');
    
    panel.classList.toggle('open');
    
    if (panel.classList.contains('open')) {
        arrow.style.transform = 'rotate(180deg)';
    } else {
        arrow.style.transform = 'rotate(0deg)';
    }
}

// Oldal betöltésekor
window.onload = async function() {
    // Először töröljük a localStorage összes régi adatát
    // localStorage.clear(); // Ezt használd, ha mindent törölni akarsz
    
    // Vagy csak specifikusan:
    localStorage.removeItem('aktivFelhasznalok');
    localStorage.removeItem('aktualisFelhasznalo');
    
    await loadConfig();
    betoltFelhasznalok();
    betoltAktivFelhasznalok();
    
    // Ha már be van jelentkezve, átirányítjuk a játékba
    const aktualisFelhasznalo = localStorage.getItem('aktualisFelhasznalo');
    if (aktualisFelhasznalo) {
        window.location.href = 'jatek.html';
    }
};