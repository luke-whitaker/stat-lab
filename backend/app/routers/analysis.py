import pandas as pd
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.stats_engine import (
    descriptive_stats,
    run_anova,
    run_chi_square,
    run_correlation,
    run_t_test,
)

router = APIRouter(prefix="/analysis", tags=["analysis"])


class DescriptiveRequest(BaseModel):
    data: list[dict]
    columns: list[str] | None = None


class StatTestRequest(BaseModel):
    data: list[dict]
    test_type: str  # "t_test", "anova", "chi_square", "correlation"
    columns: list[str]
    group_column: str | None = None


@router.post("/descriptive")
def get_descriptive_stats(body: DescriptiveRequest):
    df = pd.DataFrame(body.data)
    return {"stats": descriptive_stats(df, body.columns)}


@router.post("/test")
def run_stat_test(body: StatTestRequest):
    df = pd.DataFrame(body.data)

    try:
        if body.test_type == "t_test":
            if not body.group_column or len(body.columns) != 1:
                raise ValueError("t-test requires one value column and one group column")
            result = run_t_test(df, body.columns[0], body.group_column)

        elif body.test_type == "anova":
            if not body.group_column or len(body.columns) != 1:
                raise ValueError("ANOVA requires one value column and one group column")
            result = run_anova(df, body.columns[0], body.group_column)

        elif body.test_type == "chi_square":
            if len(body.columns) != 2:
                raise ValueError("Chi-square requires exactly 2 columns")
            result = run_chi_square(df, body.columns[0], body.columns[1])

        elif body.test_type == "correlation":
            if len(body.columns) != 2:
                raise ValueError("Correlation requires exactly 2 columns")
            result = run_correlation(df, body.columns[0], body.columns[1])

        else:
            raise ValueError(f"Unknown test type: {body.test_type}")

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    return result
