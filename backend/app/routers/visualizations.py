import pandas as pd
from fastapi import APIRouter
from pydantic import BaseModel

from app.services.chart_builder import (
    bar_chart,
    box_plot,
    correlation_heatmap,
    histogram,
    scatter_plot,
)

router = APIRouter(prefix="/visualizations", tags=["visualizations"])


class ChartRequest(BaseModel):
    data: list[dict]
    column: str | None = None
    x_column: str | None = None
    y_column: str | None = None
    group_column: str | None = None
    columns: list[str] | None = None


@router.post("/histogram")
def get_histogram(body: ChartRequest):
    df = pd.DataFrame(body.data)
    return histogram(df, body.column)


@router.post("/box-plot")
def get_box_plot(body: ChartRequest):
    df = pd.DataFrame(body.data)
    return box_plot(df, body.column, body.group_column)


@router.post("/scatter")
def get_scatter(body: ChartRequest):
    df = pd.DataFrame(body.data)
    return scatter_plot(df, body.x_column, body.y_column)


@router.post("/bar-chart")
def get_bar_chart(body: ChartRequest):
    df = pd.DataFrame(body.data)
    return bar_chart(df, body.column)


@router.post("/correlation-heatmap")
def get_correlation_heatmap(body: ChartRequest):
    df = pd.DataFrame(body.data)
    return correlation_heatmap(df, body.columns)
