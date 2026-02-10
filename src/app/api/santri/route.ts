import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';

// GET - Fetch all santri
export async function GET() {
  try {
    const santris = await db.select('santris');
    return NextResponse.json({ success: true, data: santris });
  } catch (error) {
    console.error('Error fetching santri:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch santri' },
      { status: 500 }
    );
  }
}

// POST - Create new santri
export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return NextResponse.json(
        { success: false, error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }
    
    const { nis, nama, orangTuaId, jenisKelamin, tanggalLahir, alamat, noTelepon, kelas, tahunMasuk, saldoDompet } = body;

    // Validate required fields
    if (!nis || !nama) {
      return NextResponse.json(
        { success: false, error: 'NIS and Nama are required' },
        { status: 400 }
      );
    }

    // Get existing santri to determine new ID
    const existingSantris = await db.select('santris');
    const newId = existingSantris.length > 0 
      ? Math.max(...existingSantris.map((s: any) => parseInt(s.id) || 0)) + 1 
      : 1;

    // Create data object with all required fields
    const newSantri = {
      id: newId,
      nis: nis,
      nama: nama,
      orangTuaId: orangTuaId || null,
      jenisKelamin: jenisKelamin || 'LAKI',
      tanggalLahir: tanggalLahir || '',
      alamat: alamat || '',
      noTelepon: noTelepon || '',
      foto: '',
      kelas: kelas || '',
      tahunMasuk: tahunMasuk || new Date().getFullYear().toString(),
      saldoDompet: saldoDompet || 0,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Insert into database
    await db.insert('santris', newSantri);

    return NextResponse.json({ success: true, data: newSantri });
  } catch (error: any) {
    console.error('Error creating santri:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create santri' },
      { status: 500 }
    );
  }
}


// PUT - Update santri
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID is required' },
        { status: 400 }
      );
    }

    // Add updatedAt timestamp
    updateData.updatedAt = new Date().toISOString();

    await db.update('santris', parseInt(id), updateData);

    return NextResponse.json({ success: true, data: { id, ...updateData } });
  } catch (error: any) {
    console.error('Error updating santri:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update santri' },
      { status: 500 }
    );
  }
}

// DELETE - Delete santri
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID is required' },
        { status: 400 }
      );
    }

    await db.delete('santris', parseInt(id));

    return NextResponse.json({ success: true, message: 'Santri deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting santri:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete santri' },
      { status: 500 }
    );
  }
}
