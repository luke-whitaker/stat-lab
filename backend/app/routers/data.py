import io

import pandas as pd
from fastapi import APIRouter, HTTPException, UploadFile

from app.config import settings

router = APIRouter(prefix="/data", tags=["data"])


@router.post("/upload")
async def upload_csv(file: UploadFile):
    """Parse a CSV and return column metadata + preview rows."""
    if not file.filename or not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")

    content = await file.read()
    max_bytes = settings.max_upload_size_mb * 1024 * 1024
    if len(content) > max_bytes:
        raise HTTPException(
            status_code=400,
            detail=f"File exceeds {settings.max_upload_size_mb}MB limit",
        )

    df = pd.read_csv(io.BytesIO(content))

    columns = {}
    for col in df.columns:
        dtype = str(df[col].dtype)
        if dtype in ("int64", "float64"):
            col_type = "quantitative"
        else:
            col_type = "qualitative"

        columns[col] = {
            "dtype": dtype,
            "type": col_type,
            "null_count": int(df[col].isnull().sum()),
        }

    preview = df.head(20).fillna("").to_dict(orient="records")

    return {
        "filename": file.filename,
        "row_count": len(df),
        "columns": columns,
        "preview": preview,
        "all_data": df.fillna("").to_dict(orient="records"),
    }
