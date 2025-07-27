import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { appState } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const states = await db.select().from(appState);
    
    // Convert array to object for easier consumption
    const stateObject = states.reduce((acc, state) => {
      acc[state.key] = state.value;
      return acc;
    }, {} as Record<string, string>);
    
    return NextResponse.json(stateObject);
  } catch (error) {
    console.error('Error fetching app state:', error);
    return NextResponse.json(
      { error: 'Failed to fetch app state' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { key, value } = await request.json();
    
    if (!key || value === undefined) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      );
    }

    // Check if state already exists
    const existingState = await db
      .select()
      .from(appState)
      .where(eq(appState.key, key))
      .limit(1);

    if (existingState.length > 0) {
      // Update existing state
      const updatedState = await db
        .update(appState)
        .set({ 
          value: String(value),
          updatedAt: new Date().toISOString()
        })
        .where(eq(appState.key, key))
        .returning();
      
      return NextResponse.json(updatedState[0]);
    } else {
      // Create new state
      const newState = await db
        .insert(appState)
        .values({ key, value: String(value) })
        .returning();
      
      return NextResponse.json(newState[0]);
    }
  } catch (error) {
    console.error('Error creating/updating app state:', error);
    return NextResponse.json(
      { error: 'Failed to create/update app state' },
      { status: 500 }
    );
  }
} 