import { NextResponse } from 'next/server';
import { db } from '../../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export async function GET(request: Request) {
  const authHeader = request.headers.get('x-admin-password');
  const adminPassword = process.env.ADMIN_PASSWORD || 'mohsin123';

  if (authHeader !== adminPassword) {
    return NextResponse.json({ error: 'غیر مجاز رسائی! غلط پاس ورڈ۔' }, { status: 401 });
  }

  try {
    const querySnapshot = await getDocs(collection(db, 'contacts'));
    const messages: any[] = [];
    querySnapshot.forEach((doc) => {
      messages.push({ id: doc.id, ...doc.data() });
    });
    return NextResponse.json({ messages }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}