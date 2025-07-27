export interface UsageLog {
  id: number;
  date: string;
  count: number;
  createdAt: string;
  updatedAt: string;
}

export interface AppState {
  [key: string]: string;
}

export async function fetchUsageLogs(): Promise<UsageLog[]> {
  const response = await fetch('/api/usage-logs');
  if (!response.ok) {
    throw new Error('Failed to fetch usage logs');
  }
  return response.json();
}

export async function logUsage(date: string, count: number): Promise<UsageLog> {
  const response = await fetch('/api/usage-logs', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ date, count }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to log usage');
  }
  return response.json();
}

export async function fetchAppState(): Promise<AppState> {
  const response = await fetch('/api/app-state');
  if (!response.ok) {
    throw new Error('Failed to fetch app state');
  }
  return response.json();
}

export async function updateAppState(key: string, value: string | number): Promise<any> {
  const response = await fetch('/api/app-state', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ key, value }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to update app state');
  }
  return response.json();
}

export async function clearAllData(): Promise<void> {
  const response = await fetch('/api/clear-data', {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error('Failed to clear data');
  }
} 