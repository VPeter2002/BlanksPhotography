// Egy kategoria-oldal forgatas-listajat rendereli a forgatasok.js katalogusabol.
// Ugyanazt a .category-card felepitest hasznalja, mint a gallery.html, hogy
// ne kelljen uj CSS.
(function () {
  const BUCKET_URL = 'https://lyagqwuqzurkkvcnjqtg.supabase.co/storage/v1/object/public/Blanka%20pics';

  function boritoUrl(mappa, borito, kiterjesztes) {
    return `${BUCKET_URL}/${encodeURIComponent(mappa)}/${encodeURIComponent(borito)}-thumb.${kiterjesztes}`;
  }

  function rendereld(kategoriaKulcs) {
    const kat = (window.FORGATASOK || {})[kategoriaKulcs];
    const cel = document.getElementById('forgatas-lista');
    if (!kat || !cel) return;

    const cimElem = document.getElementById('kategoria-cim');
    if (cimElem) cimElem.textContent = kat.cim;
    document.title = kat.cim + " | Blank's Photography";

    if (!kat.lista.length) {
      cel.innerHTML = '<p style="text-align:center;color:#888;">Hamarosan.</p>';
      return;
    }

    cel.innerHTML = '';
    kat.lista.forEach(f => {
      const jpg = boritoUrl(f.mappa, f.borito, 'jpg');
      const webp = boritoUrl(f.mappa, f.borito, 'webp');

      const kartya = document.createElement('a');
      kartya.className = 'category-card';
      kartya.href = 'forgatas.html?mappa=' + encodeURIComponent(f.mappa);

      const kep = document.createElement('div');
      kep.className = 'category-image';
      kep.style.backgroundImage = `url('${jpg}')`;
      // A masodik ertekadas felulirja az elsot ott, ahol az image-set tamogatott.
      kep.style.backgroundImage =
        `image-set(url('${webp}') type('image/webp'), url('${jpg}') type('image/jpeg'))`;
      if (!kep.style.backgroundImage) kep.style.backgroundImage = `url('${jpg}')`;

      const info = document.createElement('div');
      info.className = 'category-info';
      const h3 = document.createElement('h3');
      h3.style.color = 'rgb(49, 49, 49)';
      h3.textContent = f.cim;                 // textContent: nem HTML, nem injektalhato
      const p = document.createElement('p');
      p.textContent = f.db ? f.db + ' kép' : '';
      info.appendChild(h3);
      info.appendChild(p);

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
