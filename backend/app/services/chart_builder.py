import json

import pandas as pd
import plotly.express as px
import plotly.graph_objects as go


def histogram(df: pd.DataFrame, column: str) -> dict:
    """Generate a histogram for a numeric column."""
    fig = px.histogram(df, x=column, title=f"Distribution of {column}")
    fig.update_layout(bargap=0.05)
    return json.loads(fig.to_json())


def box_plot(df: pd.DataFrame, value_column: str, group_column: str | None = None) -> dict:
    """Generate a box plot, optionally grouped."""
    fig = px.box(df, x=group_column, y=value_column, title=f"Box Plot: {value_column}")
    return json.loads(fig.to_json())


def scatter_plot(df: pd.DataFrame, x_column: str, y_column: str) -> dict:
    """Generate a scatter plot for two numeric columns."""
    fig = px.scatter(df, x=x_column, y=y_column, title=f"{x_column} vs {y_column}")
    return json.loads(fig.to_json())


def bar_chart(df: pd.DataFrame, column: str) -> dict:
    """Generate a bar chart for a categorical column."""
    counts = df[column].value_counts().reset_index()
    counts.columns = [column, "count"]
    fig = px.bar(counts, x=column, y="count", title=f"Counts: {column}")
    return json.loads(fig.to_json())


def correlation_heatmap(df: pd.DataFrame, columns: list[str] | None = None) -> dict:
    """Generate a correlation heatmap for numeric columns."""
    if columns:
        numeric_df = df[columns].select_dtypes(include="number")
    else:
        numeric_df = df.select_dtypes(include="number")

    corr = numeric_df.corr()

    fig = go.Figure(
        data=go.Heatmap(
            z=corr.values,
            x=corr.columns.tolist(),
            y=corr.columns.tolist(),
            colorscale="RdBu_r",
            zmin=-1,
            zmax=1,
            text=corr.values.round(2),
            texttemplate="%{text}",
        )
    )
    fig.update_layout(title="Correlation Matrix")
    return json.loads(fig.to_json())
