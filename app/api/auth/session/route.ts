import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('oauth_session');

    if (!session) {
      return NextResponse.json({ user: null });
    }

    const sessionData = JSON.parse(session.value);
    return NextResponse.json(sessionData);
  } catch (error) {
    return NextResponse.json({ user: null });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('oauth_session');
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

