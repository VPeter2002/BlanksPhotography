// Forgatas-katalogus. EZ AZ EGYETLEN HELY, ahol uj forgatast fel kell venni.
// A kategoria-oldalak innen listaznak, a forgatas.html innen validal.
//
//   mappa  : a Supabase Storage mappa neve a "Blanka pics" bucketben
//   cim    : ami az oldalon megjelenik
//   borito : a borito-kep alapneve kiterjesztes nelkul (ebbol lesz -thumb.jpg/webp)
//   db     : hany kep van a forgatasban (a kartyan jelenik meg)
window.FORGATASOK = {
  eskuvo: {
    cim: 'Esküvői Történetek',
    oldal: 'wedding-gallery.html',
    lista: [
      { mappa: 'saratamas_eskuvo',   cim: 'Sára és Tamás',  borito: 'Sara__Tamas_361' , db: 213 },
      { mappa: 'annaesbalint_eskuvo', cim: 'Anna és Bálint', borito: 'Anna_Balint_136' , db: 56 },
      { mappa: 'diaesakos_eskuvo',    cim: 'Dia és Ákos',    borito: 'Dia_Akos_106' , db: 50 }
    ]
  },
  jegyes: {
    cim: 'Jegyes Fotózások',
    oldal: 'engagement-gallery.html',
    lista: [
      { mappa: 'arnikaeszsolt_jegyes', cim: 'Arnika és Zsolt', borito: 'jegyes_11' , db: 107 },
      { mappa: 'kiraesbence_jegyes',   cim: 'Kira és Bence',   borito: 'K_B_jegyes_105' , db: 25 },
      { mappa: 'klauesakos_jegyes',    cim: 'Klau és Ákos',    borito: 'klau_akos12' , db: 20 },
      { mappa: 'saraespeti',          cim: 'Sára és Peti',    borito: 'S_P_11', db: 25 }
    ]
  },
  kismama: {
    cim: 'Kismama Fotózások',
    oldal: 'maternity-gallery.html',
    lista: [
      { mappa: 'saramarnagyonvarnak_kismama', cim: 'Sára',               borito: 'Sara_66' , db: 139 },
      { mappa: 'nikimilaneszeteny_kismama',   cim: 'Niki, Milán és Zetény', borito: 'Zeteny_106' , db: 25 }
    ]
  },
  paros: {
    cim: 'Páros Fotózások',
    oldal: 'couple-gallery.html',
    lista: [
      { mappa: 'sabatamas_paros', cim: 'Tomó és Fani', borito: 'saba_tomo_fani1' , db: 154 }
    ]
  }
};

// Mappanev -> forgatas visszakereses (a forgatas.html ezzel validal).
window.FORGATAS_MAPPAK = Object.fromEntries(
  Object.entries(window.FORGATASOK).flatMap(([kulcs, kat]) =>
    kat.lista.map(f => [f.mappa, Object.assign({ kategoria: kulcs, vissza: kat.oldal }, f)])
  )
);
