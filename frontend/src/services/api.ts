import type { DayAheadDecisionResponse, AvailableDatesResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export async function fetchAvailableDates(): Promise<AvailableDatesResponse> {
  const response = await fetch(`${API_BASE_URL}/dates`);
  if (!response.ok) {
    throw new Error(`Failed to fetch dates: ${response.statusText}`);
  }
  return response.json();
}

export async function fetchDayAheadAnalysis(
  settlementDate: string,
  cutOffHour: number = 11
): Promise<DayAheadDecisionResponse> {
  const params = new URLSearchParams({
    settlement_date: settlementDate,
    cut_off_hour: cutOffHour.toString(),
  });
  const response = await fetch(`${API_BASE_URL}/day-ahead?${params}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch day-ahead analysis: ${response.statusText}`);
  }
  return response.json();
}
