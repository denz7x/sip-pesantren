import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';

// GET - Fetch all pelanggaran
export async function GET() {
  try {
    const pelanggarans = await db.select('pelanggarans');
    return NextResponse.json(pelanggarans);
  } catch (error) {
    console.error('Error fetching pelanggaran:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pelanggaran' },
      { status: 500 }
    );
  }
}

// POST - Create new pelanggaran
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Generate new ID
    const existingData = await db.select('pelanggarans');
    const newId = existingData.length > 0 
      ? Math.max(...existingData.map((p) => parseInt(p.id) || 0)) + 1 
      : 1;
    
    const newPelanggaran = {
      id: newId,
      SantriId: body.SantriId,
      ustadzId: body.ustadzId,
      tanggal: body.tanggal || new Date().toISOString().split('T')[0],
      jenisPelanggaran: body.jenisPelanggaran,
      kategori: body.kategori,
      poinSanksi: body.poinSanksi || 0,
      tindakan: body.tindakan || '',
      catatan: body.catatan || '',
      sudahDilaporkan: body.sudahDilaporkan || false,
      createdAt: new Date().toISOString(),
    };
    
    await db.insert('pelanggarans', newPelanggaran);
    
    return NextResponse.json(
      { success: true, data: newPelanggaran },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating pelanggaran:', error);
    return NextResponse.json(
      { error: 'Failed to create pelanggaran' },
      { status: 500 }
    );
  }
}

// PUT - Update pelanggaran
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
    
    await db.update('pelanggarans', parseInt(id), updateData);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating pelanggaran:', error);
    return NextResponse.json(
      { error: 'Failed to update pelanggaran' },
      { status: 500 }
    );
  }
}

// DELETE - Delete pelanggaran
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
    
    await db.delete('pelanggarans', parseInt(id));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting pelanggaran:', error);
    return NextResponse.json(
      { error: 'Failed to delete pelanggaran' },
      { status: 500 }
    );
  }
}
