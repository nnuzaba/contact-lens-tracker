import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { usageLogs, appState } from '@/lib/db/schema';

export async function DELETE() {
  try {
    // Clear all usage logs
    await db.delete(usageLogs);
    
    // Clear all app state
    await db.delete(appState);
    
    return NextResponse.json({ message: 'All data cleared successfully' });
  } catch (error) {
    console.error('Error clearing data:', error);
    return NextResponse.json(
      { error: 'Failed to clear data' },
      { status: 500 }
    );
  }
} 