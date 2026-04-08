import numpy as np
import pandas as pd
from scipy import stats


def descriptive_stats(df: pd.DataFrame, columns: list[str] | None = None) -> list[dict]:
    """Compute descriptive statistics for the specified columns."""
    if columns is None:
        columns = list(df.columns)

    results = []
    for col in columns:
        if col not in df.columns:
            continue

        series = df[col]
        stat = {"column": col, "count": int(series.count())}

        if pd.api.types.is_numeric_dtype(series):
            stat.update(
                {
                    "mean": round(float(series.mean()), 4),
                    "std": round(float(series.std()), 4),
                    "min": round(float(series.min()), 4),
                    "max": round(float(series.max()), 4),
                    "median": round(float(series.median()), 4),
                    "q25": round(float(series.quantile(0.25)), 4),
                    "q75": round(float(series.quantile(0.75)), 4),
                }
            )
        else:
            value_counts = series.value_counts()
            stat.update(
                {
                    "unique": int(series.nunique()),
                    "top": str(value_counts.index[0]) if len(value_counts) > 0 else None,
                    "freq": int(value_counts.iloc[0]) if len(value_counts) > 0 else None,
                }
            )

        results.append(stat)

    return results


def run_t_test(
    df: pd.DataFrame, value_column: str, group_column: str
) -> dict:
    """Run an independent samples t-test."""
    groups = df[group_column].dropna().unique()
    if len(groups) != 2:
        raise ValueError(
            f"t-test requires exactly 2 groups, found {len(groups)}: {list(groups)}"
        )

    group_a = df[df[group_column] == groups[0]][value_column].dropna()
    group_b = df[df[group_column] == groups[1]][value_column].dropna()

    t_stat, p_value = stats.ttest_ind(group_a, group_b)

    sig = "statistically significant" if p_value < 0.05 else "not statistically significant"

    return {
        "test_type": "t_test",
        "test_name": "Independent Samples t-test",
        "statistic": round(float(t_stat), 4),
        "p_value": round(float(p_value), 6),
        "interpretation": (
            f"t({len(group_a) + len(group_b) - 2}) = {t_stat:.4f}, p = {p_value:.6f}. "
            f"The difference between groups is {sig} at α = 0.05."
        ),
        "details": {
            "group_a": {"name": str(groups[0]), "n": len(group_a), "mean": round(float(group_a.mean()), 4)},
            "group_b": {"name": str(groups[1]), "n": len(group_b), "mean": round(float(group_b.mean()), 4)},
        },
    }


def run_anova(
    df: pd.DataFrame, value_column: str, group_column: str
) -> dict:
    """Run a one-way ANOVA."""
    groups = [
        group[value_column].dropna().values
        for _, group in df.groupby(group_column)
    ]

    if len(groups) < 2:
        raise ValueError("ANOVA requires at least 2 groups.")

    f_stat, p_value = stats.f_oneway(*groups)

    sig = "statistically significant" if p_value < 0.05 else "not statistically significant"

    return {
        "test_type": "anova",
        "test_name": "One-Way ANOVA",
        "statistic": round(float(f_stat), 4),
        "p_value": round(float(p_value), 6),
        "interpretation": (
            f"F = {f_stat:.4f}, p = {p_value:.6f}. "
            f"The difference between groups is {sig} at α = 0.05."
        ),
        "details": {
            "n_groups": len(groups),
            "group_sizes": [len(g) for g in groups],
        },
    }


def run_chi_square(
    df: pd.DataFrame, col_a: str, col_b: str
) -> dict:
    """Run a chi-square test of independence."""
    contingency = pd.crosstab(df[col_a], df[col_b])
    chi2, p_value, dof, expected = stats.chi2_contingency(contingency)

    sig = "statistically significant" if p_value < 0.05 else "not statistically significant"

    return {
        "test_type": "chi_square",
        "test_name": "Chi-Square Test of Independence",
        "statistic": round(float(chi2), 4),
        "p_value": round(float(p_value), 6),
        "interpretation": (
            f"χ²({dof}) = {chi2:.4f}, p = {p_value:.6f}. "
            f"The association between {col_a} and {col_b} is {sig} at α = 0.05."
        ),
        "details": {"degrees_of_freedom": int(dof)},
    }


def run_correlation(
    df: pd.DataFrame, col_a: str, col_b: str
) -> dict:
    """Run a Pearson correlation."""
    clean = df[[col_a, col_b]].dropna()
    r, p_value = stats.pearsonr(clean[col_a], clean[col_b])

    if abs(r) < 0.3:
        strength = "weak"
    elif abs(r) < 0.7:
        strength = "moderate"
    else:
        strength = "strong"

    direction = "positive" if r > 0 else "negative"

    return {
        "test_type": "correlation",
        "test_name": "Pearson Correlation",
        "statistic": round(float(r), 4),
        "p_value": round(float(p_value), 6),
        "interpretation": (
            f"r = {r:.4f}, p = {p_value:.6f}. "
            f"There is a {strength} {direction} correlation between {col_a} and {col_b}."
        ),
        "details": {"n": len(clean), "r_squared": round(float(r**2), 4)},
    }
