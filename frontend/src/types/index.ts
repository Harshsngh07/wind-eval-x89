export interface MetricsSummary {
  mae: number;
  rmse: number;
  mape: number | null;
  bias: number;
  max_underforecast: number;
  max_overforecast: number;
  total_records: number;
}

export interface ComparisonRecord {
  start_time: string;
  publish_time?: string;
  forecast_generation: number;
  actual_generation: number;
  error: number;
  abs_error: number;
  percentage_error?: number | null;
}

export interface DayAheadDecisionResponse {
  delivery_date: string;
  cut_off_time: string;
  metrics: MetricsSummary;
  series: ComparisonRecord[];
}

export interface AvailableDatesResponse {
  year: number;
  month: number;
  dates: string[];
}
