// Játék állapota
let penz = 5000;
let maxRaktar = 20;
let raktar = [];
let jatekKonfig = {};

// Statisztikák
let statisztika = {
    bevetel: 0,
    kiadas: 0,
    sikeresEladas: 0,
    sikertelenEladas: 0,
    sikeresVetel: 0,
    sikertelenVetel: 0,
    eladasOsszeg: 0,
    vetelOsszeg: 0,
    partnerek: 0
};

// Kiválasztott termék
let kivalasztottTermekEladas = null;

// Aktuális oldal
let aktivOldal = 'eladas';

// Termékek és partnerek (betöltve JSON-ból)
let termekek = [];
let partnerek = [];
let szinek = [];

// Alkuk objektumok
let eladasAlku = {
    aktiv: false,
    partner: null,
    termek: null,
    kezdoAr: 0,
    jelenlegiAr: 0,
    alkukSzama: 0,
    maxAlkuk: 3
};

let vetelAlku = {
    aktiv: false,
    partner: null,
    termek: null,
    kezdoAr: 0,
    jelenlegiAr: 0,
    alkukSzama: 0,
    maxAlkuk: 3
};

// Konfiguráció betöltése JSON-ból
async function loadConfig() {
    try {
        const response = await fetch('data.json');
        const data = await response.json();
        
        // Játék beállítások
        jatekKonfig = data.game;
        penz = data.game.startPenz;
        maxRaktar = data.game.maxRaktar;
        
        // Termékek és partnerek
        termekek = data.termekek;
        partnerek = data.partnerek;
        szinek = data.colors;
        
        return data;
    } catch (error) {
        console.error('Hiba a konfiguráció betöltésekor:', error);
        return null;
    }
}

document.getElementById('sideBtn').addEventListener('click', function() {
    document.getElementById('sidenav').classList.toggle('hidden');
});

document.getElementById('closeNav').addEventListener('click', function() {
    document.getElementById('sidenav').classList.add('hidden');
});

function valtOldal(oldal) {
    aktivOldal = oldal;
    
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('aktiv');
    });
    
    let cim = '';
    switch(oldal) {
        case 'eladas':
            document.getElementById('menuEladas').classList.add('aktiv');
            cim = 'Eladás';
            break;
        case 'vetel':
            document.getElementById('menuVetel').classList.add('aktiv');
            cim = 'Vétel';
            break;
        case 'statisztika':
            document.getElementById('menuStatisztika').classList.add('aktiv');
            cim = 'Statisztika';
            frissitStatisztika();
            break;
        case 'bejelentkezes':
            document.getElementById('menuBejelentkezes').classList.add('aktiv');
            cim = 'Bejelentkezés';
            frissitBejelentkezesiOldal();
            break;
    }
    document.getElementById('aktualisOldalCim').textContent = cim;
    
    document.querySelectorAll('.oldal').forEach(o => {
        o.classList.remove('aktiv');
    });
    document.getElementById(oldal + 'Oldal').classList.add('aktiv');
    
    frissitKijelzo();
}

function frissitKijelzo() {
    document.getElementById('penz').textContent = penz;
    document.getElementById('menuPenz').textContent = penz + ' Ft';
    document.getElementById('raktarSzam').textContent = raktar.length + '/' + maxRaktar;
    document.getElementById('menuRaktar').textContent = raktar.length + '/' + maxRaktar;
    
    if (eladasAlku.aktiv) {
        let turelem = Math.max(0, eladasAlku.partner.turelem - (eladasAlku.alkukSzama * jatekKonfig.turelemCsokkenes));
        document.getElementById('eladasTurelemCsik').style.width = turelem + '%';
    }
    
    if (kivalasztottTermekEladas) {
        document.getElementById('kivalasztottTermekEladas').textContent = 
            kivalasztottTermekEladas.ikon + ' ' + kivalasztottTermekEladas.nev;
    } else {
        document.getElementById('kivalasztottTermekEladas').textContent = 'Nincs kiválasztva';
    }
    
    if (vetelAlku.aktiv) {
        let turelem = Math.max(0, vetelAlku.partner.turelem - (vetelAlku.alkukSzama * jatekKonfig.turelemCsokkenes));
        document.getElementById('vetelTurelemCsik').style.width = turelem + '%';
    }
}

function termekKivalasztasaEladas(termek) {
    kivalasztottTermekEladas = termek;
    document.getElementById('kivalasztottTermekEladas').textContent = 
        termek.ikon + ' ' + termek.nev;
    
    document.querySelectorAll('#eladasOldal .raktari-termek').forEach(e => {
        e.classList.remove('kivalasztva');
    });
    
    const elem = document.getElementById('raktar_' + termek.id);
    if (elem) elem.classList.add('kivalasztva');
    
    document.getElementById('eladasPartnerGomb').disabled = false;
}

function keresPartner(mod) {
    if (mod === 'eladas') {
        if (!kivalasztottTermekEladas) {
            mutatUzenet('Válassz ki egy terméket a raktárból!', 'info');
            return;
        }
        
        statisztika.partnerek++;
        
        let partner = partnerek[Math.floor(Math.random() * partnerek.length)];
        let termek = kivalasztottTermekEladas;
        let boltAr = termekek.find(t => t.nev === termek.nev).eladasiAr;
        let kezdoAr = Math.floor(boltAr * (0.4 + Math.random() * 0.4));
        
        eladasAlku = {
            aktiv: true,
            partner: partner,
            termek: termek,
            kezdoAr: kezdoAr,
            jelenlegiAr: kezdoAr,
            alkukSzama: 0,
            maxAlkuk: partner.alkukepesseg
        };
        
        document.getElementById('eladasPartnerTipus').textContent = partner.nev;
        frissitEladasAjanlat();
        
        document.getElementById('eladasAktivAlku').style.display = 'block';
        document.getElementById('eladasNincsAktiv').style.display = 'none';
        document.getElementById('eladasPartnerGomb').disabled = true;
        
    } else {
        statisztika.partnerek++;
        
        let partner = partnerek[Math.floor(Math.random() * partnerek.length)];
        let randomTermek = termekek[Math.floor(Math.random() * termekek.length)];
        let kezdoAr = Math.floor(randomTermek.vetelar * (0.6 + Math.random() * 0.6));
        
        let tempTermek = {
            id: 'temp_' + Date.now(),
            nev: randomTermek.nev,
            ikon: randomTermek.ikon,
            vetelar: randomTermek.vetelar
        };
        
        vetelAlku = {
            aktiv: true,
            partner: partner,
            termek: tempTermek,
            kezdoAr: kezdoAr,
            jelenlegiAr: kezdoAr,
            alkukSzama: 0,
            maxAlkuk: partner.alkukepesseg
        };
        
        document.getElementById('vetelPartnerTipus').textContent = partner.nev;
        frissitVetelAjanlat();
        
        document.getElementById('vetelAktivAlku').style.display = 'block';
        document.getElementById('vetelNincsAktiv').style.display = 'none';
    }
    
    frissitKijelzo();
}

function frissitEladasAjanlat() {
    document.getElementById('eladasAjanlatSzoveg').innerHTML = `
        <div class="font-bold text-xl">${eladasAlku.termek.ikon} ${eladasAlku.termek.nev}</div>
        <div class="mt-2">Ajánlat: <span class="font-bold text-xl">${eladasAlku.jelenlegiAr}</span> Ft</div>
    `;
    
    document.getElementById('eladasAlkuGombok').innerHTML = `
        <button class="bg-white text-green-600 px-4 py-2 rounded-lg font-bold hover:bg-gray-100 transition w-full" onclick="elfogadAlku('eladas')"> Elfogadom (${eladasAlku.jelenlegiAr} Ft)</button>
        <button class="bg-yellow-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-yellow-600 transition w-full" onclick="emelAjanlatot('eladas')"> Emelés +${jatekKonfig.alkuEmel} Ft</button>
        <button class="bg-red-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-600 transition w-full" onclick="utasitas('eladas')"> Elutasítom</button>
    `;
}

function frissitVetelAjanlat() {
    document.getElementById('vetelAjanlatSzoveg').innerHTML = `
        <div class="font-bold text-xl">${vetelAlku.termek.ikon} ${vetelAlku.termek.nev}</div>
        <div class="mt-2">Kéri: <span class="font-bold text-xl">${vetelAlku.jelenlegiAr}</span> Ft</div>
    `;
    
    document.getElementById('vetelAlkuGombok').innerHTML = `
        <button class="bg-white text-blue-600 px-4 py-2 rounded-lg font-bold hover:bg-gray-100 transition w-full" onclick="elfogadAlku('vetel')">Megveszem (${vetelAlku.jelenlegiAr} Ft)</button>
        <button class="bg-orange-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-orange-600 transition w-full" onclick="csokkentAjanlatot('vetel')">Alkudok -${jatekKonfig.alkuCsokkent} Ft</button>
        <button class="bg-red-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-600 transition w-full" onclick="utasitas('vetel')"> Nem kérem</button>
    `;
}

function emelAjanlatot(mod) {
    if (mod === 'eladas') {
        if (!eladasAlku.aktiv) return;
        
        eladasAlku.alkukSzama++;
        eladasAlku.jelenlegiAr += jatekKonfig.alkuEmel;
        
        let turelem = eladasAlku.partner.turelem - (eladasAlku.alkukSzama * jatekKonfig.turelemCsokkenes);
        
        if (turelem <= 0 || eladasAlku.alkukSzama > eladasAlku.maxAlkuk) {
            mutatUzenet(`${eladasAlku.partner.nev} megunta az alkudozást és elment!`, 'sikertelen');
            statisztika.sikertelenEladas++;
            eladasAlku.aktiv = false;
            document.getElementById('eladasAktivAlku').style.display = 'none';
            document.getElementById('eladasNincsAktiv').style.display = 'block';
            document.getElementById('eladasPartnerGomb').disabled = false;
            frissitKijelzo();
            return;
        }
        
        frissitEladasAjanlat();
        mutatUzenet(`Emeltél az áron. Új ajánlat: ${eladasAlku.jelenlegiAr} Ft`, 'sikeres');
        frissitKijelzo();
    }
}

function csokkentAjanlatot(mod) {
    if (mod === 'vetel') {
        if (!vetelAlku.aktiv) return;
        
        vetelAlku.alkukSzama++;
        vetelAlku.jelenlegiAr -= jatekKonfig.alkuCsokkent;
        
        let turelem = vetelAlku.partner.turelem - (vetelAlku.alkukSzama * jatekKonfig.turelemCsokkenes);
        
        if (turelem <= 0 || vetelAlku.alkukSzama > vetelAlku.maxAlkuk || vetelAlku.jelenlegiAr < jatekKonfig.minVetelAr) {
            mutatUzenet(`${vetelAlku.partner.nev} megunta az alkudozást és elment!`, 'sikertelen');
            statisztika.sikertelenVetel++;
            vetelAlku.aktiv = false;
            document.getElementById('vetelAktivAlku').style.display = 'none';
            document.getElementById('vetelNincsAktiv').style.display = 'block';
            frissitKijelzo();
            return;
        }
        
        frissitVetelAjanlat();
        mutatUzenet(`Alkudtál az árból. Új ajánlat: ${vetelAlku.jelenlegiAr} Ft`, 'sikeres');
        frissitKijelzo();
    }
}

function elfogadAlku(mod) {
    if (mod === 'eladas') {
        if (!eladasAlku.aktiv) return;
        
        penz += eladasAlku.jelenlegiAr;
        statisztika.bevetel += eladasAlku.jelenlegiAr;
        statisztika.sikeresEladas++;
        statisztika.eladasOsszeg += eladasAlku.jelenlegiAr;
        
        const index = raktar.findIndex(t => t.id === eladasAlku.termek.id);
        if (index !== -1) {
            raktar.splice(index, 1);
            torolTermekPolcrol(eladasAlku.termek.id);
        }
        
        mutatUzenet(`Eladtad ${eladasAlku.termek.nev}-t ${eladasAlku.jelenlegiAr} Ft-ért!`, 'sikeres');
        
        eladasAlku.aktiv = false;
        kivalasztottTermekEladas = null;
        document.getElementById('eladasAktivAlku').style.display = 'none';
        document.getElementById('eladasNincsAktiv').style.display = 'block';
        document.getElementById('eladasPartnerGomb').disabled = true;
        
    } else {
        if (!vetelAlku.aktiv) return;
        
        if (penz < vetelAlku.jelenlegiAr) {
            mutatUzenet('Nincs elég pénzed!', 'sikertelen');
            return;
        }
        
        if (raktar.length >= maxRaktar) {
            mutatUzenet('A raktár megtelt!', 'sikertelen');
            return;
        }
        
        penz -= vetelAlku.jelenlegiAr;
        statisztika.kiadas += vetelAlku.jelenlegiAr;
        statisztika.sikeresVetel++;
        statisztika.vetelOsszeg += vetelAlku.jelenlegiAr;
        
        const ujTermek = {
            id: Date.now() + Math.random(),
            nev: vetelAlku.termek.nev,
            ikon: vetelAlku.termek.ikon,
            vetelar: vetelAlku.termek.vetelar
        };
        
        raktar.push(ujTermek);
        megjelenitRaktarban(ujTermek);
        
        mutatUzenet(`Megvetted ${vetelAlku.termek.nev}-t ${vetelAlku.jelenlegiAr} Ft-ért!`, 'sikeres');
        
        vetelAlku.aktiv = false;
        document.getElementById('vetelAktivAlku').style.display = 'none';
        document.getElementById('vetelNincsAktiv').style.display = 'block';
    }
    
    frissitKijelzo();
}

function utasitas(mod) {
    if (mod === 'eladas') {
        if (!eladasAlku.aktiv) return;
        mutatUzenet(`Nem fogadtad el az ajánlatot. ${eladasAlku.partner.nev} elment.`, 'info');
        statisztika.sikertelenEladas++;
        
        eladasAlku.aktiv = false;
        document.getElementById('eladasAktivAlku').style.display = 'none';
        document.getElementById('eladasNincsAktiv').style.display = 'block';
        document.getElementById('eladasPartnerGomb').disabled = false;
        
    } else {
        if (!vetelAlku.aktiv) return;
        mutatUzenet(`Nem fogadtad el az ajánlatot. ${vetelAlku.partner.nev} elment.`, 'info');
        statisztika.sikertelenVetel++;
        
        vetelAlku.aktiv = false;
        document.getElementById('vetelAktivAlku').style.display = 'none';
        document.getElementById('vetelNincsAktiv').style.display = 'block';
    }
    
    frissitKijelzo();
}

function mutatUzenet(szoveg, tipus) {
    const uzenetDiv = document.getElementById('uzenet');
    uzenetDiv.textContent = szoveg;
    uzenetDiv.className = 'uzenet ' + tipus;
    uzenetDiv.style.display = 'block';
    
    setTimeout(() => {
        uzenetDiv.style.display = 'none';
    }, 3000);
}

function vasarolTermeket(index) {
    const termek = termekek[index];
    
    if (penz < termek.vetelar) {
        mutatUzenet('Nincs elég pénzed!', 'sikertelen');
        return;
    }
    
    if (raktar.length >= maxRaktar) {
        mutatUzenet('A raktár megtelt!', 'sikertelen');
        return;
    }
    
    penz -= termek.vetelar;
    statisztika.kiadas += termek.vetelar;
    
    const ujTermek = {
        id: Date.now() + Math.random(),
        nev: termek.nev,
        ikon: termek.ikon,
        vetelar: termek.vetelar
    };
    
    raktar.push(ujTermek);
    megjelenitRaktarban(ujTermek);
    frissitKijelzo();
    
    mutatUzenet(`Megvettél 1 ${termek.nev}-t ${termek.vetelar} Ft-ért!`, 'sikeres');
}

function megjelenitRaktarban(termek) {
    // ELADÁS oldalon - kattintható
    for (let i = 0; i < 4; i++) {
        const eladasPolc = document.getElementById('eladasPolc' + i);
        if (eladasPolc && eladasPolc.children.length < 5) {
            const termekDiv = document.createElement('div');
            termekDiv.className = 'raktari-termek';
            termekDiv.id = 'raktar_' + termek.id;
            termekDiv.dataset.termekId = termek.id;
            termekDiv.dataset.termekNev = termek.nev;
            termekDiv.innerHTML = `${termek.ikon} ${termek.nev} <span class="text-xs">${termek.vetelar}Ft</span>`;
            termekDiv.onclick = () => termekKivalasztasaEladas(termek);
            eladasPolc.appendChild(termekDiv);
            break;
        }
    }

    // VÉTEL oldalon - csak megtekintésre
    for (let i = 0; i < 4; i++) {
        const vetelPolc = document.getElementById('vetelPolc' + i);
        if (vetelPolc && vetelPolc.children.length < 5) {
            const termekDiv = document.createElement('div');
            termekDiv.className = 'raktari-termek opacity-60';
            termekDiv.innerHTML = `${termek.ikon} ${termek.nev} <span class="text-xs">${termek.vetelar}Ft</span>`;
            vetelPolc.appendChild(termekDiv);
            break;
        }
    }

    // INVENTORY oldalon
    for (let i = 0; i < 4; i++) {
        const inventoryPolc = document.getElementById('inventoryPolc' + i);
        if (inventoryPolc && inventoryPolc.children.length < 5) {
            const termekDiv = document.createElement('div');
            termekDiv.className = 'raktari-termek';
            termekDiv.innerHTML = `${termek.ikon} ${termek.nev} <span class="text-xs">${termek.vetelar}Ft</span>`;
            inventoryPolc.appendChild(termekDiv);
            break;
        }
    }
}

function torolTermekPolcrol(id) {
    const elem = document.getElementById('raktar_' + id);
    if (elem) {
        elem.remove();
    } 
}

function frissitStatisztika() {
    document.getElementById('statBevetel').textContent = statisztika.bevetel + ' Ft';
    document.getElementById('statKiadas').textContent = statisztika.kiadas + ' Ft';
    document.getElementById('statProfit').textContent = (statisztika.bevetel - statisztika.kiadas) + ' Ft';
    document.getElementById('statPartnerek').textContent = statisztika.partnerek;
    
    document.getElementById('statSikeresEladas').textContent = statisztika.sikeresEladas;
    document.getElementById('statSikertelenEladas').textContent = statisztika.sikertelenEladas;
    document.getElementById('statAtlagEladas').textContent = 
        statisztika.sikeresEladas > 0 ? Math.round(statisztika.eladasOsszeg / statisztika.sikeresEladas) + ' Ft' : '0 Ft';
    
    document.getElementById('statSikeresVetel').textContent = statisztika.sikeresVetel;
    document.getElementById('statSikertelenVetel').textContent = statisztika.sikertelenVetel;
    document.getElementById('statAtlagVetel').textContent = 
        statisztika.sikeresVetel > 0 ? Math.round(statisztika.vetelOsszeg / statisztika.sikeresVetel) + ' Ft' : '0 Ft';
}

function frissitInventory() {
    document.getElementById('inventoryOsszesen').textContent = raktar.length;
}

// Ellenőrizzük, hogy be van-e jelentkezve
function ellenorizBejelentkezest() {
    const stored = localStorage.getItem('aktualisFelhasznalo');
    if (!stored) {
        window.location.href = 'index.html';
        return false;
    }
    aktualisFelhasznalo = JSON.parse(stored);
    return true;
}

// Kijelentkezés
function kijelentkezes() {
    // Aktuális felhasználó lekérése
    const aktualisFelhasznalo = JSON.parse(localStorage.getItem('aktualisFelhasznalo') || '{}');
    
    // Aktív felhasználók frissítése
    if (aktualisFelhasznalo && aktualisFelhasznalo.email) {
        let aktivFelhasznalok = JSON.parse(localStorage.getItem('aktivFelhasznalok') || '[]');
        aktivFelhasznalok = aktivFelhasznalok.filter(f => f.email !== aktualisFelhasznalo.email);
        localStorage.setItem('aktivFelhasznalok', JSON.stringify(aktivFelhasznalok));
    }
    
    // Kilépés
    localStorage.removeItem('aktualisFelhasznalo');
    window.location.href = 'index.html';
}

// Ellenőrizzük, hogy be van-e jelentkezve
function ellenorizBejelentkezest() {
    const stored = localStorage.getItem('aktualisFelhasznalo');
    if (!stored) {
        window.location.href = 'index.html';
        return false;
    }
    aktualisFelhasznalo = JSON.parse(stored);
    return true;
}


// Felhasználó nevének megjelenítése
function frissitFelhasznaloInfo() {
    const felhasznaloInfo = document.getElementById('felhasznaloInfo');
    if (felhasznaloInfo && aktualisFelhasznalo) {
        const randomSzin = szinek[Math.floor(Math.random() * szinek.length)];
        
        felhasznaloInfo.innerHTML = `
            <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm" 
                     style="background-color: ${aktualisFelhasznalo.szin || randomSzin}">
                    ${aktualisFelhasznalo.nev.charAt(0).toUpperCase()}
                </div>
                <div class="hidden md:block">
                    <div class="text-xs text-gray-500">Felhasználó</div>
                    <div class="text-sm font-bold text-gray-700">${aktualisFelhasznalo.nev}</div>
                </div>
            </div>
        `;
    }
}

window.onload = async function() {
    // Konfiguráció betöltése
    await loadConfig();
    
    // Ellenőrizzük a bejelentkezést
    if (!ellenorizBejelentkezest()) return;
    
    // Kezdő termékek
    vasarolTermeket(0);
    vasarolTermeket(1);
    vasarolTermeket(2);
    vasarolTermeket(3);
    
    frissitFelhasznaloInfo();
    frissitKijelzo();
};