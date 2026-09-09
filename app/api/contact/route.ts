import { NextResponse } from "next/server";
import { db } from "@/app/lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    // 🛡️ honeypot کو ریکوئسٹ سے نکالا گیا ہے
    const { name, email, message, honeypot } = await req.json();

    // 🛡️ Security 1: Honeypot Check (اگر بوٹ نے فیلڈ بھری تو فوراً بلاک کریں)
    if (honeypot) {
      return NextResponse.json(
        { error: "Spam detected. Request blocked." },
        { status: 403 }
      );
    }

    // 🛡️ Security 2: Required Fields Check
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "تمام فیلڈز (نام، ای میل، میسج) پر کرنا ضروری ہیں۔" },
        { status: 400 }
      );
    }

    // 🛡️ Security 3: Input Length Validation (بہت لمبے میسجز سے سرور کو بچانے کے لیے)
    if (name.length > 100 || email.length > 150 || message.length > 2000) {
      return NextResponse.json(
        { error: "میسج یا نام کی لمبائی مقررہ حد سے زیادہ ہے۔" },
        { status: 400 }
      );
    }

    // 1. میسج کو Firebase Firestore کے "contacts" کلیکشن میں سیو کریں (Admin Dashboard کے لیے)
    await addDoc(collection(db, "contacts"), {
      name,
      email,
      message,
      status: "New", // 👈 Mini CRM کے لیے اسٹیٹس ایڈ کر دیا گیا
      createdAt: new Date().toISOString(),
    });

    // 2. جی میل پر آٹو ای میل الرٹ بھیجیں (Resend)
    if (process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: "Portfolio Contact <onboarding@resend.dev>",
        to: "mohsinshahzad4142@gmail.com",
        subject: `🔥 New Portfolio Lead from ${name}`,
        text: `You have a new message from your portfolio contact form:\n\nName: ${name}\nEmail: ${email}\nMessage: ${message}`,
      });
    }

    // 3. واٹس ایپ پر آٹو الرٹ بھیجیں (CallMeBot)
    if (process.env.WHATSAPP_API_KEY) {
      const whatsappMessage = `🚀 *New Portfolio Lead!*\n\n*Name:* ${name}\n*Email:* ${email}\n*Message:* ${message}`;
      const whatsappUrl = `https://api.callmebot.com/whatsapp.php?phone=923464301992&text=${encodeURIComponent(
        whatsappMessage
      )}&apikey=${process.env.WHATSAPP_API_KEY}`;

      await fetch(whatsappUrl).catch(err => console.error("WhatsApp Error:", err)); // ایرر ہینڈلنگ شامل کی گئی تاکہ سرور کریش نہ ہو
    }

    return NextResponse.json(
      { success: true, message: "آپ کا پیغام کامیابی سے موصول ہو گیا ہے!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Contact Route Error:", error);
    return NextResponse.json(
      { error: "سرور میں کوئی مسئلہ آیا ہے، دوبارہ کوشش کریں۔" },
      { status: 500 }
    );
  }
}