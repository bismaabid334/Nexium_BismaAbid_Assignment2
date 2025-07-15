import { NextResponse } from 'next/server';
import { translateWithGemini } from '@/lib/translation-service';
import clientPromise from '@/lib/mongodb'; // ✅ Add this line

export async function POST(req: Request) {
  try {
    console.log('🔄 Calling translateSummaryToUrdu...');
    const body = await req.json();
    const summary = body?.summary;

    if (!summary || typeof summary !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Invalid or missing summary text' },
        { status: 400 }
      );
    }

    const urduTranslation = await translateWithGemini(summary);

    try {
      const client = await clientPromise;
      const db = client.db('blogs'); 
      const collection = db.collection('fulltexts');

      await collection.insertOne({
        summary,
        urduTranslation,
        createdAt: new Date(),
      });

      console.log('🟢 Urdu translation saved to MongoDB');
    } catch (mongoErr) {
      console.error('⚠️ Failed to save to MongoDB:', mongoErr);
    }

    console.log('✅ Translation successful');
    return NextResponse.json({
      success: true,
      urduTranslation,
    });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal server error';
    console.error('💥 Translate API error:', msg);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}