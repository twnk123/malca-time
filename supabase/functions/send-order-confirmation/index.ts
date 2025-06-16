import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface OrderEmailRequest {
  orderId: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log('Send-order-confirmation function called');
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.text();
    console.log('Request body:', body);
    const { orderId }: OrderEmailRequest = JSON.parse(body);
    console.log('Processing order ID:', orderId);

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Fetch order details with all related data
    const { data: order, error } = await supabase
      .from('narocila')
      .select(`
        *,
        postavke_narocila (
          *,
          jedi (id, ime, cena)
        ),
        restavracije (naziv, email, kontakt),
        profili (ime, priimek, email)
      `)
      .eq('id', orderId)
      .single();

    if (error || !order) {
      console.error('Order not found:', error);
      throw new Error(`Order not found: ${error?.message || 'Unknown error'}`);
    }

    // Fetch discounts for all food items in the order
    const foodIds = order.postavke_narocila.map(item => item.jedi.id);
    const { data: discounts } = await supabase
      .from('popusti')
      .select('*')
      .in('jed_id', foodIds)
      .eq('aktiven', true);
    
    console.log('Order found:', order.id, 'User:', order.profili.email);

    const orderDate = new Date(order.created_at).toLocaleString('sl-SI', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const pickupTime = new Date(order.cas_prevzema).toLocaleString('sl-SI', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Generate order items HTML with discount information
    const orderItemsHtml = order.postavke_narocila
      .map(item => {
        const discount = discounts?.find(d => d.jed_id === item.jedi.id);
        let priceInfo = `${(item.cena_na_kos * item.kolicina).toFixed(2)}€`;
        
        if (discount) {
          // Calculate original price
          let originalPricePerItem: number;
          if (discount.tip_popusta === 'procent') {
            originalPricePerItem = item.cena_na_kos / (1 - discount.vrednost / 100);
          } else {
            originalPricePerItem = item.cena_na_kos + discount.vrednost;
          }
          const originalTotal = originalPricePerItem * item.kolicina;
          const discountText = discount.tip_popusta === 'procent' ? `${discount.vrednost}%` : `${discount.vrednost}€`;
          
          priceInfo = `
            <div>
              <span style="text-decoration: line-through; color: #999; font-size: 12px;">${originalTotal.toFixed(2)}€</span>
              <span style="background: #dc2626; color: white; padding: 1px 4px; border-radius: 3px; font-size: 10px; margin: 0 4px;">-${discountText}</span>
              <br>
              <strong>${(item.cena_na_kos * item.kolicina).toFixed(2)}€</strong>
            </div>
          `;
        }
        
        return `
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 8px; text-align: left;">${item.kolicina}x ${item.jedi.ime}</td>
            <td style="padding: 8px; text-align: right;">${priceInfo}</td>
          </tr>
        `;
      }).join('');

    // Email template for user
    const userEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #333; border-bottom: 2px solid #000; padding-bottom: 10px;">Potrditev naročila</h1>
        
        <p>Pozdravljeni ${order.profili.ime} ${order.profili.priimek},</p>
        
        <p>Vaše naročilo je bilo uspešno oddano!</p>
        
        <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Podrobnosti naročila</h3>
          <p><strong>Številka naročila:</strong> #${order.id.slice(-6)}</p>
          <p><strong>Restavracija:</strong> ${order.restavracije.naziv}</p>
          <p><strong>Datum naročila:</strong> ${orderDate}</p>
          <p><strong>Čas prevzema:</strong> ${pickupTime}</p>
        </div>
        
        <h3>Naročene jedi</h3>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background: #f5f5f5;">
              <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Jed</th>
              <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Cena</th>
            </tr>
          </thead>
          <tbody>
            ${orderItemsHtml}
          </tbody>
        </table>
        
        <div style="text-align: right; font-size: 18px; font-weight: bold; margin: 20px 0;">
          <strong>Skupaj: ${order.skupna_cena.toFixed(2)}€</strong>
        </div>
        
        ${order.opomba ? `<p><strong>Opomba:</strong> ${order.opomba}</p>` : ''}
        
        <p>Hvala za vaše naročilo!</p>
      </div>
    `;

    // Email template for restaurant
    const restaurantEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #333; border-bottom: 2px solid #000; padding-bottom: 10px;">Novo naročilo</h1>
        
        <p>Prejeli ste novo naročilo!</p>
        
        <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Podrobnosti naročila</h3>
          <p><strong>Številka naročila:</strong> #${order.id.slice(-6)}</p>
          <p><strong>Uporabnik:</strong> ${order.profili.ime} ${order.profili.priimek}</p>
          <p><strong>E-mail uporabnika:</strong> ${order.profili.email}</p>
          <p><strong>Datum naročila:</strong> ${orderDate}</p>
          <p><strong>Čas prevzema:</strong> ${pickupTime}</p>
        </div>
        
        <h3>Naročene jedi</h3>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background: #f5f5f5;">
              <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Jed</th>
              <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Cena</th>
            </tr>
          </thead>
          <tbody>
            ${orderItemsHtml}
          </tbody>
        </table>
        
        <div style="text-align: right; font-size: 18px; font-weight: bold; margin: 20px 0;">
          <strong>Skupaj: ${order.skupna_cena.toFixed(2)}€</strong>
        </div>
        
        ${order.opomba ? `<p><strong>Opomba:</strong> ${order.opomba}</p>` : ''}
        
        <p>Prosimo, pripravite naročilo do časa prevzema.</p>
      </div>
    `;

    // Send email to user
    console.log('Sending email to user:', order.profili.email);
    const userEmailResponse = await resend.emails.send({
      from: "Naročila <onboarding@resend.dev>",
      to: [order.profili.email],
      subject: `Potrditev naročila #${order.id.slice(-6)}`,
      html: userEmailHtml,
    });
    console.log('User email sent:', userEmailResponse);

    // Send email to restaurant (if restaurant has email)
    let restaurantEmailResponse = null;
    if (order.restavracije.email) {
      console.log('Sending email to restaurant:', order.restavracije.email);
      restaurantEmailResponse = await resend.emails.send({
        from: "Naročila <onboarding@resend.dev>",
        to: [order.restavracije.email],
        subject: `Novo naročilo #${order.id.slice(-6)} - ${order.restavracije.naziv}`,
        html: restaurantEmailHtml,
      });
      console.log('Restaurant email sent:', restaurantEmailResponse);
    }

    console.log("Emails sent successfully:", { userEmailResponse, restaurantEmailResponse });

    return new Response(
      JSON.stringify({ 
        success: true, 
        userEmailSent: !!userEmailResponse,
        restaurantEmailSent: !!restaurantEmailResponse 
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Detailed error in send-order-confirmation function:", {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);