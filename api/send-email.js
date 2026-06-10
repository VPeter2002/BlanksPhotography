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
        from: 'Blanka Photography <onboarding@resend.dev>',
        to: ['peter.veszpremi2002@gmail.com'], // Ide megy a levél
        reply_to: email,
        subject: `Új megkeresés a weboldalról: ${nev}`,
       html: `
          <div style="font-family: 'Inter', Helvetica, Arial, sans-serif; background-color: #FBF9F6; padding: 40px 20px; margin: 0; color: #5A534A;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(90, 83, 74, 0.08); border: 1px solid #E5D7C8;">
              
              <div style="background-color: #FBF9F6; border-bottom: 1px solid #E5D7C8; padding: 30px; text-align: center;">
                <h2 style="margin: 0; font-size: 24px; font-weight: 400; color: #C49A81; font-family: 'Playfair Display', Georgia, serif; font-style: italic;">Új megkeresés érkezett!</h2>
              </div>
              
              <div style="padding: 35px 30px; color: #5A534A;">
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #E5D7C8; width: 80px; color: #C49A81; font-weight: bold;">Név:</td>
                    <td style="padding: 12px 0; border-bottom: 1px solid #E5D7C8; font-size: 16px;">${nev}</td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; width: 80px; color: #C49A81; font-weight: bold;">E-mail:</td>
                    <td style="padding: 12px 0; font-size: 16px;">
                      <a href="mailto:${email}" style="color: #5A534A; text-decoration: none; border-bottom: 1px solid #C49A81;">${email}</a>
                    </td>
                  </tr>
                </table>
                
                <h3 style="margin: 0 0 15px 0; font-size: 14px; color: #C49A81; text-transform: uppercase; letter-spacing: 1.5px;">Üzenet:</h3>
                <div style="background-color: #FBF9F6; border-left: 4px solid #C49A81; padding: 20px; font-size: 15px; line-height: 1.8; border-radius: 0 8px 8px 0; color: #5A534A;">
                  ${uzenet.replace(/\n/g, '<br>')}
                </div>
              </div>
              
              <div style="background-color: #FBF9F6; padding: 20px; text-align: center; color: #5A534A; font-size: 12px; border-top: 1px solid #E5D7C8;">
                Ezt az automatikus üzenetet a <span style="color: #C49A81; font-family: 'Playfair Display', Georgia, serif; font-style: italic;">Blank's Photography</span> weboldaladról küldték.
              </div>
              
            </div>
          </div>
        `
      })
      })
    ;

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