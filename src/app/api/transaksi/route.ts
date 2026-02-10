import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';

// GET - Fetch all transaksi
export async function GET() {
  try {
    const transaksis = await db.select('transaksis');
    return NextResponse.json(transaksis);
  } catch (error) {
    console.error('Error fetching transaksi:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transaksi' },
      { status: 500 }
    );
  }
}

// POST - Create new transaksi
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Get current santri data to check saldo
    const santriList = await db.select('santris');
    const santri = santriList.find((s: any) => parseInt(s.id) === parseInt(body.SantriId));
    
    if (!santri) {
      return NextResponse.json(
        { error: 'Santri not found' },
        { status: 404 }
      );
    }
    
    const saldoSebelum = parseInt(santri.saldoDompet) || 0;
    const nominal = parseInt(body.nominal) || 0;
    
    // Calculate new saldo based on transaction type
    let saldoSetelah = saldoSebelum;
    if (body.jenis === 'TOPUP') {
      saldoSetelah = saldoSebelum + nominal;
    } else if (body.jenis === 'PAYMENT') {
      saldoSetelah = saldoSebelum - nominal;
      if (saldoSetelah < 0) {
        return NextResponse.json(
          { error: 'Insufficient balance' },
          { status: 400 }
        );
      }
    }
    
    // Generate new ID
    const existingData = await db.select('transaksis');
    const newId = existingData.length > 0 
      ? Math.max(...existingData.map((t: any) => parseInt(t.id) || 0)) + 1 
      : 1;
    
    const newTransaksi = {
      id: newId,
      SantriId: body.SantriId,
      ustadzId: body.ustadzId || null,
      adminId: body.adminId || null,
      tanggal: body.tanggal || new Date().toISOString().split('T')[0],
      waktu: body.waktu || new Date().toTimeString().split(' ')[0],
      jenis: body.jenis, // TOPUP atau PAYMENT
      nominal: nominal,
      kategori: body.kategori || '',
      deskripsi: body.deskripsi || '',
      saldoSebelum: saldoSebelum,
      saldoSetelah: saldoSetelah,
      createdAt: new Date().toISOString(),
    };
    
    // Insert transaction
    await db.insert('transaksis', newTransaksi);
    
    // Fetch fresh santri data to ensure we have complete data before updating
    const freshSantriList = await db.select('santris');
    const freshSantri = freshSantriList.find((s: any) => parseInt(s.id) === parseInt(body.SantriId));
    
    if (!freshSantri) {
      return NextResponse.json(
        { error: 'Santri not found after transaction' },
        { status: 404 }
      );
    }
    
    // Update santri saldo - preserve all existing data from fresh fetch
    const updatedSantri = {
      ...freshSantri,
      saldoDompet: saldoSetelah,
    };
    await db.update('santris', parseInt(body.SantriId), updatedSantri);


    
    return NextResponse.json(
      { success: true, data: newTransaksi },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating transaksi:', error);
    return NextResponse.json(
      { error: 'Failed to create transaksi' },
      { status: 500 }
    );
  }
}


// PUT - Update transaksi
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
    
    await db.update('transaksis', parseInt(id), updateData);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating transaksi:', error);
    return NextResponse.json(
      { error: 'Failed to update transaksi' },
      { status: 500 }
    );
  }
}

// DELETE - Delete transaksi
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
    
    await db.delete('transaksis', parseInt(id));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting transaksi:', error);
    return NextResponse.json(
      { error: 'Failed to delete transaksi' },
      { status: 500 }
    );
  }
}
