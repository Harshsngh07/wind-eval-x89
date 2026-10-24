import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  ReferenceLine,
} from 'recharts';
import {
  Wind,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Clock,
  Calendar,
  CheckCircle2,
  BarChart3,
  Layers,
} from 'lucide-react';
import { fetchDayAheadAnalysis, fetchAvailableDates } from '../services/api';
import type { DayAheadDecisionResponse } from '../types';

export const Dashboard: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>('2026-01-15');
  const [cutOffHour, setCutOffHour] = useState<number>(11);
  const [data, setData] = useState<DayAheadDecisionResponse | null>(null);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAvailableDates()
      .then((res) => setAvailableDates(res.dates))
      .catch((err) => console.error('Failed to load dates', err));
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchDayAheadAnalysis(selectedDate, cutOffHour)
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to fetch day-ahead data');
        setLoading(false);
      });
  }, [selectedDate, cutOffHour]);

  const formattedChartData =
    data?.series.map((item) => {
      const dt = new Date(item.start_time);
      const timeStr = dt.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'UTC',
      });
      return {
        time: timeStr,
        Actual: item.actual_generation,
        Forecast: item.forecast_generation,
        Error: item.error,
        AbsError: item.abs_error,
      };
    }) || [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      {/* Header */}
      <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-6 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400">
              <Wind className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">
                UK Day-Ahead Wind Forecasting Portal
              </h1>
              <p className="text-sm text-slate-400">
                Decision support system for wholesale market electricity procurement (Elexon BMRS)
              </p>
            </div>
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex flex-wrap items-center gap-3 bg-slate-900 border border-slate-800 p-2.5 rounded-xl shadow-lg">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <label className="text-xs font-medium text-slate-400">Delivery Date:</label>
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-slate-800 text-white text-xs rounded-lg px-2.5 py-1.5 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              {availableDates.length > 0 ? (
                availableDates.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))
              ) : (
                <option value="2026-01-15">2026-01-15</option>
              )}
            </select>
          </div>

          <div className="h-4 w-px bg-slate-700 hidden sm:block" />

          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-400" />
            <label className="text-xs font-medium text-slate-400">Gate Closure Cut-off:</label>
            <select
              value={cutOffHour}
              onChange={(e) => setCutOffHour(Number(e.target.value))}
              className="bg-slate-800 text-white text-xs rounded-lg px-2.5 py-1.5 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value={9}>09:00 UTC (D-1)</option>
              <option value={11}>11:00 UTC (D-1 Default)</option>
              <option value={12}>12:00 UTC (D-1 Auction)</option>
              <option value={15}>15:00 UTC (D-1 Post-auction)</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-emerald-950/60 border border-emerald-500/30 text-[11px] text-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>January 2026 Live</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      {loading ? (
        <div className="h-96 flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Evaluating settlement periods and computing metrics...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-950/40 border border-red-500/30 rounded-xl text-red-200 flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0" />
          <div>
            <h4 className="font-semibold">Failed to fetch data</h4>
            <p className="text-sm text-red-300">{error}</p>
          </div>
        </div>
      ) : data ? (
        <div className="space-y-6">
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">
                <span>Mean Absolute Error (MAE)</span>
                <BarChart3 className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-3xl font-bold text-white">
                {data.metrics.mae.toLocaleString()} <span className="text-sm font-normal text-slate-400">MW</span>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Average absolute delta per 30-min settlement period
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">
                <span>Root Mean Squared (RMSE)</span>
                <Layers className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-3xl font-bold text-white">
                {data.metrics.rmse.toLocaleString()} <span className="text-sm font-normal text-slate-400">MW</span>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Penalizes large outlier forecast fluctuations
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">
                <span>Forecast Bias</span>
                {data.metrics.bias >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-amber-400" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-cyan-400" />
                )}
              </div>
              <div className={`text-3xl font-bold ${data.metrics.bias >= 0 ? 'text-amber-400' : 'text-cyan-400'}`}>
                {data.metrics.bias > 0 ? `+${data.metrics.bias}` : data.metrics.bias}{' '}
                <span className="text-sm font-normal text-slate-400">MW</span>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                {data.metrics.bias >= 0 ? 'Over-forecasting trend' : 'Under-forecasting trend'}
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">
                <span>Max Shortfall Exposure</span>
                <AlertTriangle className="w-4 h-4 text-rose-400" />
              </div>
              <div className="text-3xl font-bold text-rose-400">
                {Math.abs(data.metrics.max_underforecast).toLocaleString()}{' '}
                <span className="text-sm font-normal text-slate-400">MW</span>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Maximum thermal reserve buffer required
              </p>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Primary Time-Series Chart */}
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    Actual Wind Generation vs. Day-Ahead Forecast
                  </h3>
                  <p className="text-xs text-slate-400">
                    Half-hourly settlement periods for delivery date {data.delivery_date} (Cut-off: {data.cut_off_time})
                  </p>
                </div>
              </div>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={formattedChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="time" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                    <YAxis
                      stroke="#94a3b8"
                      tick={{ fontSize: 11 }}
                      unit=" MW"
                      width={70}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '0.5rem',
                        fontSize: '12px',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Line
                      type="monotone"
                      dataKey="Actual"
                      stroke="#10b981"
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={{ r: 5 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="Forecast"
                      stroke="#38bdf8"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Error Distribution Chart */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-white">Procurement Variance</h3>
                <p className="text-xs text-slate-400">
                  Forecast error (Forecast - Actual). Negative represents wind deficit requiring thermal procurement.
                </p>
              </div>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={formattedChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="time" stroke="#94a3b8" tick={{ fontSize: 10 }} interval={7} />
                    <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} unit=" MW" width={60} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '0.5rem',
                        fontSize: '12px',
                      }}
                    />
                    <ReferenceLine y={0} stroke="#64748b" />
                    <Bar
                      dataKey="Error"
                      fill="#818cf8"
                      radius={[2, 2, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Settlement Periods Detail Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-white">Settlement Periods & Procurement Analysis</h3>
                <p className="text-xs text-slate-400">
                  Detailed half-hour granularity for energy traders
                </p>
              </div>
              <span className="text-xs text-slate-400">
                Total 48 Periods (Half-Hourly)
              </span>
            </div>
            <div className="overflow-x-auto max-h-80 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-800/80 text-slate-300 uppercase sticky top-0">
                  <tr>
                    <th className="py-2.5 px-4">Settlement Time (UTC)</th>
                    <th className="py-2.5 px-4">Forecast (MW)</th>
                    <th className="py-2.5 px-4">Actual (MW)</th>
                    <th className="py-2.5 px-4">Delta Error (MW)</th>
                    <th className="py-2.5 px-4">Procurement Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {data.series.map((item, idx) => {
                    const timeStr = new Date(item.start_time).toLocaleTimeString('en-GB', {
                      hour: '2-digit',
                      minute: '2-digit',
                      timeZone: 'UTC',
                    });
                    const isUnder = item.error < 0;
                    return (
                      <tr key={idx} className="hover:bg-slate-800/40">
                        <td className="py-2 px-4 font-mono text-slate-300">{timeStr}</td>
                        <td className="py-2 px-4 text-sky-400 font-medium">
                          {item.forecast_generation.toLocaleString()}
                        </td>
                        <td className="py-2 px-4 text-emerald-400 font-medium">
                          {item.actual_generation.toLocaleString()}
                        </td>
                        <td className={`py-2 px-4 font-medium ${isUnder ? 'text-rose-400' : 'text-amber-400'}`}>
                          {item.error > 0 ? `+${item.error}` : item.error} MW
                        </td>
                        <td className="py-2 px-4">
                          {isUnder ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/20">
                              Procure {Math.abs(item.error)} MW Thermal
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              Wind Surplus / Imbalance Safe
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
