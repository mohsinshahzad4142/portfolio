import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { clientEmail, clientName, serviceTitle, totalAmount, orderId } = await request.json();

    if (!clientEmail) {
      return NextResponse.json({ error: 'Client email is required' }, { status: 400 });
    }

    const data = await resend.emails.send({
      from: 'Mohsin Portfolio <onboarding@resend.dev>',
      to: [clientEmail],
      subject: `Order Confirmed & In Progress! (${orderId})`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 24px; color: #1f2937; max-width: 600px; margin: auto; border: 1px solid #e5e7eb; border-radius: 12px;">
          <h2 style="color: #059669; margin-top: 0;">🎉 Project Order Confirmed!</h2>
          <p>Hello <strong>${clientName}</strong>,</p>
          <p>Great news! Your payment for <strong>${serviceTitle}</strong> has been successfully verified, and your project status is now set to <strong>In Progress</strong>.</p>
          
          <div style="background: #f9fafb; padding: 16px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
            <p style="margin: 4px 0;"><strong>Order ID:</strong> <span style="font-family: monospace; color: #4b5563;">${orderId}</span></p>
            <p style="margin: 4px 0;"><strong>Service:</strong> ${serviceTitle}</p>
            <p style="margin: 4px 0;"><strong>Total Paid:</strong> <span style="color: #059669; font-weight: bold;">$${totalAmount}</span></p>
          </div>

          <p>We are already setting up your workspace and will keep you updated on the milestones.</p>
          <p style="margin-top: 30px;">Best regards,<br/><strong>Mohsin Shahzad</strong><br/><span style="color: #6b7280; font-size: 12px;">Full Stack Developer & Designer</span></p>
        </div>
      `,
    });

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Email sending error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}