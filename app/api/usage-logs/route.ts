import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { usageLogs } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET() {
  try {
    const logs = await db
      .select()
      .from(usageLogs)
      .orderBy(desc(usageLogs.date));
    
    return NextResponse.json(logs);
  } catch (error) {
    console.error('Error fetching usage logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch usage logs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { date, count } = await request.json();
    
    if (!date || typeof count !== 'number') {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      );
    }

    // Check if log already exists for this date
    const existingLog = await db
      .select()
      .from(usageLogs)
      .where(eq(usageLogs.date, date))
      .limit(1);

    if (existingLog.length > 0) {
      // Update existing log
      const updatedLog = await db
        .update(usageLogs)
        .set({ 
          count: existingLog[0].count + count,
          updatedAt: new Date().toISOString()
        })
        .where(eq(usageLogs.date, date))
        .returning();
      
      return NextResponse.json(updatedLog[0]);
    } else {
      // Create new log
      const newLog = await db
        .insert(usageLogs)
        .values({ date, count })
        .returning();
      
      return NextResponse.json(newLog[0]);
    }
  } catch (error) {
    console.error('Error creating/updating usage log:', error);
    return NextResponse.json(
      { error: 'Failed to create/update usage log' },
      { status: 500 }
    );
  }
} 