import numpy as np
import pandas as pd
from typing import List, Dict, Any
from app.models.schemas import MetricsSummary, ComparisonRecord


class AnalyticsService:
    @staticmethod
    def calculate_metrics(df: pd.DataFrame) -> MetricsSummary:
        """
        Calculates key forecasting accuracy metrics from a dataframe
        containing 'forecast_generation' and 'actual_generation'.
        """
        if df.empty:
            return MetricsSummary(
                mae=0.0,
                rmse=0.0,
                mape=None,
                bias=0.0,
                max_underforecast=0.0,
                max_overforecast=0.0,
                total_records=0
            )

        error = df["forecast_generation"] - df["actual_generation"]
        abs_error = np.abs(error)
        
        mae = float(abs_error.mean())
        rmse = float(np.sqrt((error ** 2).mean()))
        bias = float(error.mean())
        
        # Avoid division by zero for MAPE
        valid_actuals = df["actual_generation"] > 10.0  # filter near-zero baseline
        if valid_actuals.any():
            mape = float((abs_error[valid_actuals] / df["actual_generation"][valid_actuals]).mean() * 100.0)
        else:
            mape = None

        max_overforecast = float(error.max()) if not error.empty else 0.0
        max_underforecast = float(error.min()) if not error.empty else 0.0

        return MetricsSummary(
            mae=round(mae, 2),
            rmse=round(rmse, 2),
            mape=round(mape, 2) if mape is not None else None,
            bias=round(bias, 2),
            max_underforecast=round(max_underforecast, 2),
            max_overforecast=round(max_overforecast, 2),
            total_records=len(df)
        )

    @staticmethod
    def prepare_comparison_series(df: pd.DataFrame) -> List[ComparisonRecord]:
        records: List[ComparisonRecord] = []
        for _, row in df.iterrows():
            f_gen = float(row["forecast_generation"])
            a_gen = float(row["actual_generation"])
            err = f_gen - a_gen
            abs_err = abs(err)
            pct_err = (abs_err / a_gen * 100) if a_gen > 10 else None

            records.append(
                ComparisonRecord(
                    start_time=row["start_time"],
                    publish_time=row.get("publish_time"),
                    forecast_generation=round(f_gen, 2),
                    actual_generation=round(a_gen, 2),
                    error=round(err, 2),
                    abs_error=round(abs_err, 2),
                    percentage_error=round(pct_err, 2) if pct_err is not None else None
                )
            )
        return records


analytics_service = AnalyticsService()
