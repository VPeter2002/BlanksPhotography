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
          <div style="font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f4f5f7; padding: 40px 20px; margin: 0;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
              
              <div style="background-color: #1a1a1a; color: #ffffff; padding: 25px 30px; text-align: center;">
                <h2 style="margin: 0; font-size: 22px; font-weight: 400; letter-spacing: 1px;">Új megkeresés érkezett!</h2>
              </div>
              
              <div style="padding: 35px 30px; color: #333333;">
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #eeeeee; width: 80px;"><strong>Név:</strong></td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #eeeeee; font-size: 16px;">${nev}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; width: 80px;"><strong>E-mail:</strong></td>
                    <td style="padding: 10px 0; font-size: 16px;">
                      <a href="mailto:${email}" style="color: #1a1a1a; text-decoration: none; font-weight: bold;">${email}</a>
                    </td>
                  </tr>
                </table>
                
                <h3 style="margin: 0 0 15px 0; font-size: 14px; color: #888888; text-transform: uppercase; letter-spacing: 1px;">Üzenet:</h3>
                <div style="background-color: #f9f9f9; border-left: 4px solid #1a1a1a; padding: 20px; font-size: 15px; line-height: 1.6; border-radius: 0 4px 4px 0; color: #444444;">
                  ${uzenet.replace(/\n/g, '<br>')}
                </div>
              </div>
              
              <div style="background-color: #fefefe; padding: 20px; text-align: center; color: #aaaaaa; font-size: 12px; border-top: 1px solid #eeeeee;">
                Ezt az automatikus üzenetet a Blanka Photography weboldaladról küldték.
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