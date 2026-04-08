import io
from pathlib import Path

import pandas as pd


def parse_csv(file_content: bytes, filename: str, upload_dir: str) -> dict:
    """Parse a CSV file and return metadata + save to disk."""
    df = pd.read_csv(io.BytesIO(file_content))

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
            "sample_values": [str(v) for v in df[col].dropna().head(5).tolist()],
        }

    upload_path = Path(upload_dir)
    upload_path.mkdir(parents=True, exist_ok=True)
    filepath = upload_path / filename
    df.to_csv(filepath, index=False)

    return {
        "filepath": str(filepath),
        "columns": columns,
        "row_count": len(df),
    }


def load_dataset(filepath: str) -> pd.DataFrame:
    """Load a dataset from disk."""
    return pd.read_csv(filepath)


def detect_column_types(df: pd.DataFrame) -> dict[str, str]:
    """Auto-detect whether each column is quantitative or qualitative."""
    types = {}
    for col in df.columns:
        if pd.api.types.is_numeric_dtype(df[col]):
            types[col] = "quantitative"
        else:
            types[col] = "qualitative"
    return types
