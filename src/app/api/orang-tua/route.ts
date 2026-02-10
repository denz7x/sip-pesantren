import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';

// GET - Fetch all orang tua
export async function GET() {
  try {
    const orangTua = await db.select('orangTua');
    return NextResponse.json(orangTua);
  } catch (error) {
    console.error('Error fetching orang tua:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orang tua' },
      { status: 500 }
    );
  }
}

// POST - Create new orang tua
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Generate new ID
    const existingData = await db.select('orangTua');
    const newId = existingData.length > 0 
      ? Math.max(...existingData.map((o) => parseInt(o.id) || 0)) + 1 
      : 1;
    
    const newOrangTua = {
      id: newId,
      nama: body.nama,
      noTelepon: body.noTelepon,
      alamat: body.alamat,
      email: body.email || '',
      isActive: body.isActive !== undefined ? body.isActive : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    await db.insert('orangTua', newOrangTua);
    
    return NextResponse.json(
      { success: true, data: newOrangTua },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating orang tua:', error);
    return NextResponse.json(
      { error: 'Failed to create orang tua' },
      { status: 500 }
    );
  }
}

// PUT - Update orang tua
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
    
    await db.update('orangTua', parseInt(id), updateData);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating orang tua:', error);
    return NextResponse.json(
      { error: 'Failed to update orang tua' },
      { status: 500 }
    );
  }
}

// DELETE - Delete orang tua
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
    
    await db.delete('orangTua', parseInt(id));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting orang tua:', error);
    return NextResponse.json(
      { error: 'Failed to delete orang tua' },
      { status: 500 }
    );
  }
}
