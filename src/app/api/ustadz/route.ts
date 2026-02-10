import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';

// GET - Fetch all ustadz
export async function GET() {
  try {
    const ustadzs = await db.select('ustadzs');
    return NextResponse.json({ success: true, data: ustadzs });
  } catch (error) {
    console.error('Error fetching ustadz:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch ustadz' },
      { status: 500 }
    );
  }
}

// POST - Create new ustadz
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
    
    const { nip, nama, jenisKelamin, spesialisasi, noTelepon, alamat } = body;

    // Validate required fields
    if (!nip || !nama) {
      return NextResponse.json(
        { success: false, error: 'NIP and Nama are required' },
        { status: 400 }
      );
    }

    // Get existing ustadz to determine new ID
    const existingUstadzs = await db.select('ustadzs');
    const newId = existingUstadzs.length > 0 
      ? Math.max(...existingUstadzs.map((u: any) => parseInt(u.id) || 0)) + 1 
      : 1;

    // Create data object with all required fields
    const newUstadz = {
      id: newId,
      userId: null,
      nip: nip,
      nama: nama,
      jenisKelamin: jenisKelamin || 'LAKI',
      spesialisasi: spesialisasi || '',
      noTelepon: noTelepon || '',
      alamat: alamat || '',
      foto: '',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Insert into database
    await db.insert('ustadzs', newUstadz);

    return NextResponse.json({ success: true, data: newUstadz });
  } catch (error: any) {
    console.error('Error creating ustadz:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create ustadz' },
      { status: 500 }
    );
  }
}

// PUT - Update ustadz
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

    await db.update('ustadzs', parseInt(id), updateData);

    return NextResponse.json({ success: true, data: { id, ...updateData } });
  } catch (error: any) {
    console.error('Error updating ustadz:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update ustadz' },
      { status: 500 }
    );
  }
}

// DELETE - Delete ustadz
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

    await db.delete('ustadzs', parseInt(id));

    return NextResponse.json({ success: true, message: 'Ustadz deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting ustadz:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete ustadz' },
      { status: 500 }
    );
  }
}
