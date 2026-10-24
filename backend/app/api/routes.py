from fastapi import APIRouter, Query, HTTPException
from datetime import datetime
import pandas as pd
from app.services.elexon_service import elexon_service
from app.services.analytics_service import analytics_service
from app.models.schemas import DayAheadDecisionResponse, MetricsSummary

router = APIRouter()


@router.get("/health")
def health_check():
    return {"status": "ok", "service": "REint Day-Ahead Wind Forecasting API"}


@router.get("/dates")
def get_available_dates():
    """Return available settlement dates for January 2026 evaluation period."""
    return {
        "year": 2026,
        "month": 1,
        "dates": [f"2026-01-{d:02d}" for d in range(1, 32)]
    }


@router.get("/day-ahead", response_model=DayAheadDecisionResponse)
async def get_day_ahead_analysis(
    settlement_date: str = Query("2026-01-15", pattern=r"^\d{4}-\d{2}-\d{2}$", description="Settlement delivery date (YYYY-MM-DD)"),
    cut_off_hour: int = Query(11, ge=0, le=23, description="Day-Ahead Gate Closure hour on D-1 (0-23 UTC)")
):
    """
    Get the latest wind forecasts published prior to day-ahead cut-off,
    compare with actual generation for the settlement date, and return quantified error metrics.
    """
    try:
        # Fetch actuals & forecasts
        actuals_df = await elexon_service.fetch_actual_wind(settlement_date)
        forecasts_df = await elexon_service.fetch_day_ahead_forecasts(settlement_date, cut_off_hour)

        # Normalize timestamps to UTC to avoid timezone alignment issues
        actuals_df["start_time"] = pd.to_datetime(actuals_df["start_time"], utc=True)
        forecasts_df["start_time"] = pd.to_datetime(forecasts_df["start_time"], utc=True)

        # Merge on start_time
        merged = pd.merge(actuals_df, forecasts_df, on="start_time", how="inner")
        merged = merged.sort_values("start_time")

        metrics = analytics_service.calculate_metrics(merged)
        series = analytics_service.prepare_comparison_series(merged)

        return DayAheadDecisionResponse(
            delivery_date=settlement_date,
            cut_off_time=f"D-1 at {cut_off_hour:02d}:00 UTC",
            metrics=metrics,
            series=series
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to compute day-ahead analysis: {str(e)}")


@router.get("/monthly-summary")
async def get_monthly_summary(
    month: int = Query(1, ge=1, le=12),
    year: int = Query(2026)
):
    """
    Aggregated metrics across January 2026 for tech review & client pitch overview.
    """
    sample_dates = [f"{year}-{month:02d}-{d:02d}" for d in range(1, 32)]
    daily_summaries = []

    for d in sample_dates[:7]:  # Sample first week for fast overview
        actuals_df = await elexon_service.fetch_actual_wind(d)
        forecasts_df = await elexon_service.fetch_day_ahead_forecasts(d, 11)
        actuals_df["start_time"] = pd.to_datetime(actuals_df["start_time"], utc=True)
        forecasts_df["start_time"] = pd.to_datetime(forecasts_df["start_time"], utc=True)
        merged = pd.merge(actuals_df, forecasts_df, on="start_time", how="inner")
        metrics = analytics_service.calculate_metrics(merged)
        daily_summaries.append({
            "date": d,
            "mae": metrics.mae,
            "rmse": metrics.rmse,
            "bias": metrics.bias,
            "mape": metrics.mape
        })

    return {
        "period": f"{year}-{month:02d}",
        "daily_summaries": daily_summaries
    }
