from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class WindActualRecord(BaseModel):
    start_time: datetime = Field(..., description="Target settlement start time (30 min)")
    fuel_type: str = "WIND"
    generation: float = Field(..., description="Actual wind generation in MW")


class WindForecastRecord(BaseModel):
    start_time: datetime = Field(..., description="Target settlement start time")
    publish_time: datetime = Field(..., description="Time when forecast was created/published")
    generation: float = Field(..., description="Forecasted wind generation in MW")


class ComparisonRecord(BaseModel):
    start_time: datetime
    publish_time: Optional[datetime] = None
    forecast_generation: float
    actual_generation: float
    error: float = Field(..., description="Forecast - Actual (positive = over-forecast, negative = under-forecast)")
    abs_error: float = Field(..., description="|Forecast - Actual|")
    percentage_error: Optional[float] = None


class MetricsSummary(BaseModel):
    mae: float = Field(..., description="Mean Absolute Error (MW)")
    rmse: float = Field(..., description="Root Mean Squared Error (MW)")
    mape: Optional[float] = Field(None, description="Mean Absolute Percentage Error (%)")
    bias: float = Field(..., description="Mean Error (MW), positive indicates over-forecasting")
    max_underforecast: float = Field(..., description="Maximum under-forecast shortfall (MW)")
    max_overforecast: float = Field(..., description="Maximum over-forecast surplus (MW)")
    total_records: int


class DayAheadDecisionResponse(BaseModel):
    delivery_date: str
    cut_off_time: str
    metrics: MetricsSummary
    series: List[ComparisonRecord]
