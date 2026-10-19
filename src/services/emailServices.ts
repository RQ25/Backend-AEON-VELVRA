import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendOrderNotificationEmail = async (orderData: any) => {
  console.log("--> [EMAIL SERVICE] Memproses pengiriman email via Resend API...");
  console.log("--> Config check - Receiver:", process.env.EMAIL_RECEIVER);

  try {
    const { customer, table_number, payment_method, total_price, id, orderList } = orderData;

    const itemsTableRows = Array.isArray(orderList)
      ? orderList
          .map(
            (item: any) => `
            <tr style="border-bottom: 1px solid #333;">
              <td style="padding: 10px; color: #ffffff;">${item.menu?.name || 'Menu'}</td>
              <td style="padding: 10px; color: #ffffff; text-align: center;">${item.quantity}x</td>
              <td style="padding: 10px; color: #f97316; text-align: right;">Rp ${(
                (item.menu?.price || 0) * item.quantity
              ).toLocaleString('id-ID')}</td>
            </tr>
            ${
              item.note
                ? `<tr><td colspan="3" style="padding: 0 10px 10px 10px; font-size: 11px; color: #aaa; font-style: italic;">Catatan: "${item.note}"</td></tr>`
                : ''
            }
          `
          )
          .join('')
      : '';

    // Kirim email via HTTP REST API (Tembus blokir port SMTP Railway)
    const { data, error } = await resend.emails.send({
      from: "AEON VELVRA System <onboarding@resend.dev>",
      to: [process.env.EMAIL_RECEIVER || "thoriqb30@gmail.com"],
      subject: `🚨 ORDER BARU MASUK! - Meja ${table_number} (#${id})`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 24px; background-color: #0c0812; color: #ffffff; border-radius: 12px; max-width: 600px; margin: 0 auto; border: 1px solid #222;">
          <h2 style="color: #f97316; margin-top: 0;">AEON VELVRA - Pesanan Baru</h2>
          <p style="font-size: 14px; color: #ccc;">Ada pesanan baru masuk dari Customer via Web Self-Service:</p>
          
          <div style="background-color: #161220; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
            <p style="margin: 4px 0; font-size: 13px;"><strong>ID Order:</strong> #${id}</p>
            <p style="margin: 4px 0; font-size: 13px;"><strong>Nama Pemesan:</strong> ${customer}</p>
            <p style="margin: 4px 0; font-size: 13px;"><strong>Nomor Meja:</strong> Meja ${table_number}</p>
            <p style="margin: 4px 0; font-size: 13px;"><strong>Metode Bayar:</strong> ${payment_method}</p>
          </div>

          <h3 style="color: #ffffff; font-size: 15px; border-bottom: 1px solid #333; padding-bottom: 8px;">Daftar Pesanan:</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 20px;">
            <thead>
              <tr style="background-color: #1f1a2e; color: #aaa; text-align: left;">
                <th style="padding: 8px 10px;">Item</th>
                <th style="padding: 8px 10px; text-align: center;">Qty</th>
                <th style="padding: 8px 10px; text-align: right;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${itemsTableRows}
            </tbody>
          </table>

          <div style="text-align: right; border-top: 2px solid #333; padding-top: 12px;">
            <p style="font-size: 16px; font-weight: bold; color: #f97316; margin: 0;">
              TOTAL TAGIHAN: Rp ${total_price?.toLocaleString("id-ID")}
            </p>
          </div>

          <hr style="border-color: #222; margin-top: 24px;" />
          <p style="font-size: 11px; color: #777; text-align: center; margin-bottom: 0;">
            Email ini dikirim otomatis oleh sistem AEON VELVRA. Silakan periksa Dashboard Kasir.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("❌ [EMAIL SERVICE] RESEND API ERROR:", error);
      return;
    }

    console.log("✅ [EMAIL SERVICE] EMAIL TERKIRIM VIA RESEND! ID:", data?.id);
  } catch (error) {
    console.error("❌ [EMAIL SERVICE] CRITICAL ERROR:", error);
  }
};