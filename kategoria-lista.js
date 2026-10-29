// Egy kategoria-oldal forgatas-listajat rendereli a forgatasok.js katalogusabol.
// Ugyanazt a .category-card felepitest hasznalja, mint a gallery.html, hogy
// ne kelljen uj CSS.
(function () {
  const BUCKET_URL = 'https://lyagqwuqzurkkvcnjqtg.supabase.co/storage/v1/object/public/Blanka%20pics';

  // A kartyak egy hasabban, teljes szelessegben allnak, ezert a -thumb (480px)
  // kevés lenne hozzá: a -medium (1280px) valtozatot toltjuk.
  function boritoUrl(mappa, borito, kiterjesztes) {
    return `${BUCKET_URL}/${encodeURIComponent(mappa)}/${encodeURIComponent(borito)}-medium.${kiterjesztes}`;
  }

  // Ugyanaz a szohasznalat, mint a forgatas.html kep-feliratainal: az alt-szoveg
  // a valodi fotozas-tipust mondja, nem altalanos "fotó"-t.
  const SZO = { eskuvo: 'esküvői', jegyes: 'jegyes', kismama: 'kismama', csalad: 'családi' };

  function rendereld(kategoriaKulcs) {
    const kat = (window.FORGATASOK || {})[kategoriaKulcs];
    const cel = document.getElementById('forgatas-lista');
    if (!kat || !cel) return;

    const cimElem = document.getElementById('kategoria-cim');
    if (cimElem) cimElem.textContent = kat.cim;
    document.title = kat.cim + " | Blank's Photography";

    if (!kat.lista.length) {
      cel.innerHTML = '<p style="text-align:center;padding:40px 0 120px;">Ez a galéria épp készül, hamarosan itt lesznek az első sorozatok.</p>';
      return;
    }

    cel.innerHTML = '';
    kat.lista.forEach(f => {
      const jpg = boritoUrl(f.mappa, f.borito, 'jpg');
      const webp = boritoUrl(f.mappa, f.borito, 'webp');

      const kartya = document.createElement('a');
      kartya.className = 'category-card';
      kartya.href = 'forgatas.html?mappa=' + encodeURIComponent(f.mappa);

      // Valodi <img>, nem hatterkep: a kartya a kep aranyat veszi fel, tehat
      // semmit nem vagunk le belole (2026-10-29, Peti kerese). A w/h a
      // katalogusbol jon, hogy a hely elore le legyen foglalva.
      const kep = document.createElement('picture');
      const forras = document.createElement('source');
      forras.type = 'image/webp';
      forras.srcset = webp;
      const img = document.createElement('img');
      img.className = 'category-image';
      img.src = jpg;
      // A sorozat sajat `szo` erteke eros a kategoriajanal (pl. paros sorozat a
      // jegyes kategoriaban) -- ugyanaz a szabaly, mint a forgatas.html-ben.
      const szo = f.szo || SZO[kategoriaKulcs];
      img.alt = f.cim + (szo ? ', ' + szo + ' fotózás' : '');
      img.loading = 'lazy';
      img.decoding = 'async';
      if (f.w && f.h) { img.width = f.w; img.height = f.h; }
      kep.appendChild(forras);
      kep.appendChild(img);

      const info = document.createElement('div');
      info.className = 'category-info';
      const h3 = document.createElement('h3');
      h3.textContent = f.cim;                 // textContent: nem HTML, nem injektalhato
      info.appendChild(h3);
      // Darabszam tudatosan nincs: Blanka kerese, hogy ne legyen kiirva,
      // hany kep van egy sorozatban.

      kartya.appendChild(kep);
      kartya.appendChild(info);
      cel.appendChild(kartya);
    });
  }

  window.rendereldKategoria = rendereld;
  document.addEventListener('DOMContentLoaded', function () {
    const kulcs = document.body.getAttribute('data-kategoria');
    if (kulcs) rendereld(kulcs);
  });
})();
