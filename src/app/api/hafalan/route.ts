import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';

// GET - Fetch all hafalan
export async function GET() {
  try {
    const hafalans = await db.select('setoranHafalans');
    return NextResponse.json(hafalans);
  } catch (error) {
    console.error('Error fetching hafalan:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hafalan' },
      { status: 500 }
    );
  }
}

// POST - Create new hafalan
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Generate new ID
    const existingData = await db.select('setoranHafalans');
    const newId = existingData.length > 0 
      ? Math.max(...existingData.map((h) => parseInt(h.id) || 0)) + 1 
      : 1;
    
    const newHafalan = {
      id: newId,
      SantriId: body.SantriId,
      ustadzId: body.ustadzId,
      tanggal: body.tanggal || new Date().toISOString().split('T')[0],
      namaSurat: body.namaSurat,
      ayat: body.ayat,
      mulaiAyat: body.mulaiAyat,
      akhirAyat: body.akhirAyat,
      kualitas: body.kualitas, // BAIK, SANGAT_BAIK, CUKUP, KURANG
      nilai: body.nilai || 0,
      catatan: body.catatan || '',
      createdAt: new Date().toISOString(),
    };
    
    await db.insert('setoranHafalans', newHafalan);
    
    return NextResponse.json(
      { success: true, data: newHafalan },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating hafalan:', error);
    return NextResponse.json(
      { error: 'Failed to create hafalan' },
      { status: 500 }
    );
  }
}

// PUT - Update hafalan
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      );
    }
    
    await db.update('setoranHafalans', parseInt(id), updateData);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating hafalan:', error);
    return NextResponse.json(
      { error: 'Failed to update hafalan' },
      { status: 500 }
    );
  }
}

// DELETE - Delete hafalan
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      );
    }
    
    await db.delete('setoranHafalans', parseInt(id));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting hafalan:', error);
    return NextResponse.json(
      { error: 'Failed to delete hafalan' },
      { status: 500 }
    );
  }
}
