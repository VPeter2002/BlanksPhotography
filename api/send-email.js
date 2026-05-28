export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Csak POST kérés engedélyezett' });
  }

  const { nev, email, uzenet } = req.body;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'Blanka Photography <onboarding@resend.dev>', // A Resend ingyenes teszt címe
        to: ['A_TE_EMAIL_CIMED@GMAIL.COM'], // IDE ÍRD BE A SAJÁT EMAIL CÍMEDET!
        reply_to: email,
        subject: `Új megkeresés a weboldalról: ${nev}`,
        html: `
          <h3>Új üzenet érkezett a weboldalról!</h3>
          <p><strong>Név:</strong> ${nev}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Üzenet:</strong><br>${uzenet}</p>
        `
      })
    });

    const data = await response.json();

    if (response.ok) {
      return res.status(200).json({ success: true });
    } else {
      return res.status(400).json({ success: false, error: data });
    }
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}