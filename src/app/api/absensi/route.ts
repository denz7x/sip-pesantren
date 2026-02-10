import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';

// GET - Fetch all absensi
export async function GET() {
  try {
    const absensis = await db.select('absensis');
    return NextResponse.json(absensis);
  } catch (error) {
    console.error('Error fetching absensi:', error);
    return NextResponse.json(
      { error: 'Failed to fetch absensi' },
      { status: 500 }
    );
  }
}

// POST - Create new absensi
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Generate new ID
    const existingData = await db.select('absensis');
    const newId = existingData.length > 0 
      ? Math.max(...existingData.map((a: any) => parseInt(a.id) || 0)) + 1 
      : 1;
    
    const newAbsensi = {
      id: newId,
      SantriId: body.SantriId,
      ustadzId: body.ustadzId,
      tanggal: body.tanggal || new Date().toISOString().split('T')[0],
      status: body.status,
      keterangan: body.keterangan || '',
      createdAt: new Date().toISOString(),
    };
    
    await db.insert('absensis', newAbsensi);
    
    return NextResponse.json(
      { success: true, data: newAbsensi },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating absensi:', error);
    return NextResponse.json(
      { error: 'Failed to create absensi' },
      { status: 500 }
    );
  }
}

// PUT - Update absensi
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
    
    await db.update('absensis', parseInt(id), updateData);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating absensi:', error);
    return NextResponse.json(
      { error: 'Failed to update absensi' },
      { status: 500 }
    );
  }
}

// DELETE - Delete absensi
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
    
    await db.delete('absensis', parseInt(id));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting absensi:', error);
    return NextResponse.json(
      { error: 'Failed to delete absensi' },
      { status: 500 }
    );
  }
}
