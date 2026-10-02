// Kapcsolati urlap -> email (Resend).
//
// A cimzett es a feladó KORNYEZETI VALTOZOBOL jon, hogy ne kelljen kodot irni,
// amikor eldol, hova menjenek a leadek:
//   LEAD_TO_EMAIL  -- ide erkeznek a megkeresesek
//   MAIL_FROM      -- feladó; sajat, hitelesitett domain kell ide, kulonben a
//                     level nagyobb esellyel landol a spam mappaban
const ALAP_CIMZETT = 'peter.veszpremi2002@gmail.com';
const ALAP_FELADO = "Blank's Photography <onboarding@resend.dev>";

const MEZO_HOSSZ = { nev: 100, email: 150, telefon: 40, uzenet: 4000 };

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function tisztit(ertek, max) {
  if (typeof ertek !== 'string') return '';
  return ertek.trim().slice(0, max);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Csak POST kérés engedélyezett' });
  }

  const test = req.body || {};

  // Honeypot: valodi latogato ezt sosem tolti ki, bot viszont igen.
  // Nem arulunk el semmit, 200-at adunk vissza, de nem kuldunk levelet.
  if (tisztit(test.website, 200)) {
    return res.status(200).json({ success: true });
  }

  const nev = tisztit(test.nev, MEZO_HOSSZ.nev);
  const email = tisztit(test.email, MEZO_HOSSZ.email);
  const telefon = tisztit(test.telefon, MEZO_HOSSZ.telefon);
  const uzenet = tisztit(test.uzenet, MEZO_HOSSZ.uzenet);

  // Validacio. Enelkul egy hianyzo mezo 500-as osszeomlast okozott.
  const hianyzik = [];
  if (!nev) hianyzik.push('név');
  if (!email) hianyzik.push('e-mail cím');
  if (!uzenet) hianyzik.push('üzenet');
  if (hianyzik.length) {
    return res.status(400).json({
      success: false,
      error: 'Hiányzó mező: ' + hianyzik.join(', '),
    });
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return res.status(400).json({ success: false, error: 'Az e-mail cím formátuma nem megfelelő.' });
  }

  if (!process.env.RESEND_API_KEY) {
    console.error('Hiányzik a RESEND_API_KEY, a levél nem ment ki.');
    return res.status(500).json({ success: false, error: 'A küldés átmenetileg nem elérhető.' });
  }

  const n = escapeHtml(nev);
  const e = escapeHtml(email);
  const t = telefon ? escapeHtml(telefon) : null;
  const u = escapeHtml(uzenet).replace(/\n/g, '<br>');

  const sor = (cimke, tartalom) => `
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #E5D7C8; width: 90px; color: #96644A; font-weight: bold;">${cimke}</td>
                    <td style="padding: 12px 0; border-bottom: 1px solid #E5D7C8; font-size: 16px;">${tartalom}</td>
                  </tr>`;

  const html = `
          <div style="font-family: 'Inter', Helvetica, Arial, sans-serif; background-color: #FBF9F6; padding: 40px 20px; margin: 0; color: #5A534A;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(90, 83, 74, 0.08); border: 1px solid #E5D7C8;">
              <div style="background-color: #FBF9F6; border-bottom: 1px solid #E5D7C8; padding: 30px; text-align: center;">
                <h2 style="margin: 0; font-size: 24px; font-weight: 400; color: #96644A; font-family: 'Playfair Display', Georgia, serif; font-style: italic;">Új megkeresés érkezett!</h2>
              </div>
              <div style="padding: 35px 30px; color: #5A534A;">
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
                  ${sor('Név:', n)}
                  ${sor('E-mail:', `<a href="mailto:${e}" style="color: #5A534A; text-decoration: none; border-bottom: 1px solid #C49A81;">${e}</a>`)}
                  ${t ? sor('Telefon:', `<a href="tel:${t.replace(/[^0-9+]/g, '')}" style="color: #5A534A; text-decoration: none; border-bottom: 1px solid #C49A81;">${t}</a>`) : ''}
                </table>
                <h3 style="margin: 0 0 15px 0; font-size: 14px; color: #96644A; text-transform: uppercase; letter-spacing: 1.5px;">Üzenet:</h3>
                <div style="background-color: #FBF9F6; border-left: 4px solid #C49A81; padding: 20px; font-size: 15px; line-height: 1.8; border-radius: 0 8px 8px 0; color: #5A534A;">
                  ${u}
                </div>
              </div>
            </div>
          </div>`;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: process.env.MAIL_FROM || ALAP_FELADO,
        to: [process.env.LEAD_TO_EMAIL || ALAP_CIMZETT],
        reply_to: email,
        subject: `Új megkeresés a weboldalról: ${nev}`,
        html,
      }),
    });

    if (response.ok) {
      return res.status(200).json({ success: true });
    }
    const data = await response.json().catch(() => ({}));
    console.error('Resend hiba:', data);
    return res.status(502).json({ success: false, error: 'A levelet nem sikerült elküldeni.' });
  } catch (error) {
    console.error('Küldési hiba:', error.message);
    return res.status(500).json({ success: false, error: 'A küldés átmenetileg nem elérhető.' });
  }
}
