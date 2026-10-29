// Forgatas-katalogus. EZ AZ EGYETLEN HELY, ahol uj forgatast fel kell venni.
// A kategoria-oldalak innen listaznak, a forgatas.html innen validal.
//
//   mappa  : a Supabase Storage mappa neve a "Blanka pics" bucketben
//   cim    : ami az oldalon megjelenik
//   borito : a borito-kep alapneve kiterjesztes nelkul (ebbol lesz -thumb.jpg/webp)
//   szo    : opcionalis. A kep-feliratban hasznalt fotozas-tipus, ha a sorozat
//            mas tipusu, mint a kategoriaja (pl. paros sorozat a jegyes alatt).
//   w, h   : a BORITOKEP -medium valtozatanak pixelmerete. 2026-10-29 ota a
//            kategoria-oldali kartya a kep sajat aranyat veszi fel (nincs tobbe
//            vagas), es ez a ket szam foglalja le elore a helyet, hogy a lap ne
//            ugraljon toltes kozben. Uj forgatasnal merd meg (a feltoltott
//            -medium fajl merete), ne becsuld.
//
// A kepek SZAMA tudatosan nem szerepel itt: Blanka kerese, hogy a sorozat
// darabszama ne legyen kiirva sehol az oldalon.
window.FORGATASOK = {
  eskuvo: {
    cim: 'Esküvői Történetek',
    oldal: 'wedding-gallery.html',
    lista: [
      { mappa: 'saratamas_eskuvo',   cim: 'Sára és Tamás',  borito: 'Sara__Tamas_361', w: 1280, h: 1920 },
      { mappa: 'annaesbalint_eskuvo', cim: 'Anna és Bálint', borito: 'Anna_Balint_136', w: 1280, h: 1920 },
      { mappa: 'diaesakos_eskuvo',    cim: 'Dia és Ákos',    borito: 'Dia_Akos_106', w: 1280, h: 1920 }
    ]
  },
  // Jegyes es paros egy kategoria, Blanka kerese (2026-10-14).
  jegyes: {
    cim: 'Jegyes és Páros Fotózások',
    oldal: 'engagement-gallery.html',
    lista: [
      { mappa: 'arnikaeszsolt_jegyes', cim: 'Arnika és Zsolt', borito: 'jegyes_11', w: 1280, h: 1920 },
      { mappa: 'kiraesbence_jegyes',   cim: 'Kira és Bence',   borito: 'K_B_jegyes_105', w: 1280, h: 853 },
      { mappa: 'klauesakos_jegyes',    cim: 'Klau és Ákos',    borito: 'klau_akos12', w: 1280, h: 1920 },
      { mappa: 'saraespeti',           cim: 'Sára és Peti',    borito: 'S_P_11', w: 1280, h: 1920 },
      { mappa: 'sabatamas_paros',      cim: 'Sába és Tomó',    borito: 'saba_tomo_fani1', szo: 'páros', w: 1280, h: 1920 }
    ]
  },
  kismama: {
    cim: 'Kismama Fotózások',
    oldal: 'maternity-gallery.html',
    lista: [
      { mappa: 'saramarnagyonvarnak_kismama', cim: 'Sára',                  borito: 'Sara_66', w: 1280, h: 1920 },
      { mappa: 'nikimilaneszeteny_kismama',   cim: 'Niki, Milán és Zetény', borito: 'Zeteny_106', w: 1280, h: 853 },
      { mappa: 'petraestibi_kismama',         cim: 'Petra és Tibi',         borito: 'pocak_25', w: 1280, h: 853 }
    ]
  },
  // Uj kategoria, Blanka kerese. Az elso ket sorozat 2026-10-15-en kerult fel.
  csalad: {
    cim: 'Családi Fotózások',
    oldal: 'family-gallery.html',
    lista: [
      { mappa: 'csanad_csalad',      cim: 'Csanád is megérkezett', borito: 'Csanad_38', w: 1280, h: 1920 },
      { mappa: 'balikocsalad_csalad', cim: 'Balikó család',        borito: 'negyenlesznek98', w: 1280, h: 853 },
      { mappa: 'barnabas_csalad',     cim: 'Érkezik Barnabás',     borito: 'Petrikcsalad_36', w: 1280, h: 853 },
      { mappa: 'sari_csalad',         cim: 'Sári már nagyon várnak', borito: 'Sari_33', w: 1280, h: 1920 }
    ]
  }
};

// Mappanev -> forgatas visszakereses (a forgatas.html ezzel validal).
window.FORGATAS_MAPPAK = Object.fromEntries(
  Object.entries(window.FORGATASOK).flatMap(([kulcs, kat]) =>
    kat.lista.map(f => [f.mappa, Object.assign({ kategoria: kulcs, vissza: kat.oldal }, f)])
  )
);
