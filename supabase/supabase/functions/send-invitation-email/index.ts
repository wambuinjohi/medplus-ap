import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.2';
import { corsHeaders } from '../_shared/cors.ts';

interface SendInvitationRequest {
  email: string;
  invitationToken: string;
  invitedByEmail: string;
  role: string;
  appUrl: string;
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ success: false, error: 'Method not allowed' }),
        { status: 405, headers: corsHeaders }
      );
    }

    const body: SendInvitationRequest = await req.json();

    // Validate required fields
    if (!body.email || !body.invitationToken || !body.role) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields' }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Get Supabase credentials
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase environment variables');
      return new Response(
        JSON.stringify({ success: false, error: 'Server configuration error' }),
        { status: 500, headers: corsHeaders }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Generate invitation link
    const invitationLink = `${body.appUrl}/auth/accept-invitation?token=${body.invitationToken}`;

    // Create invitation email HTML
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #1a8917; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
            .button { display: inline-block; background-color: #1a8917; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { background-color: #f0f0f0; padding: 15px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 5px 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Medplus Africa</h1>
            </div>
            <div class="content">
              <p>Hello,</p>
              <p>You have been invited to join <strong>Medplus Africa</strong> as a <strong>${body.role.replace('_', ' ')}</strong>.</p>
              <p>To accept this invitation and create your account, please click the button below:</p>
              <center>
                <a href="${invitationLink}" class="button">Accept Invitation</a>
              </center>
              <p><strong>Or copy this link:</strong><br>
              <a href="${invitationLink}">${invitationLink}</a></p>
              <p>This invitation will expire in 7 days.</p>
              <p>If you did not expect this invitation, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>Medplus Africa Limited</p>
              <p>Tel: 0741 207 690 / 0780 165 490<br>
              Email: info@medplusafrica.com</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send email using Supabase's email service
    try {
      const { error: emailError } = await supabase.auth.admin.sendRawEmail({
        email: body.email,
        html: emailHtml,
        subject: 'Invitation to join Medplus Africa',
      });

      if (emailError) {
        console.error('Email sending error:', emailError);
        return new Response(
          JSON.stringify({
            success: false,
            error: `Failed to send email: ${emailError.message}`,
          }),
          { status: 400, headers: corsHeaders }
        );
      }
    } catch (emailErr) {
      console.error('Error calling email service:', emailErr);
      return new Response(
        JSON.stringify({
          success: false,
          error: `Failed to send email: ${emailErr instanceof Error ? emailErr.message : String(emailErr)}`,
        }),
        { status: 500, headers: corsHeaders }
      );
    }

    console.log('Invitation email sent successfully', { email: body.email });
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Invitation email sent successfully',
      }),
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: `Server error: ${error instanceof Error ? error.message : String(error)}`,
      }),
      { status: 500, headers: corsHeaders }
    );
  }
});
