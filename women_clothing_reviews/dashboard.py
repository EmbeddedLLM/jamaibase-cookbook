import sys
import streamlit as st
import httpx
from httpx import Timeout
from loguru import logger
import pandas as pd
import streamlit as st
import matplotlib.pyplot as plt
from wordcloud import WordCloud
from protocol import Page


def get_rows(table_id):
    BASE_URL = "http://192.168.80.61:6969/api"
    client = httpx.Client(
        transport=httpx.HTTPTransport(retries=3), timeout=Timeout(5 * 60)
    )

    response = client.get(f"{BASE_URL}/v1/gen_tables/action/{table_id}/rows")
    response.raise_for_status()
    page = Page[dict](**response.json())
    return page.items[::]


def bar_chart(df_expanded, col1, col2):
    # Adjust the binning process
    if col1 == "Age":
        df_expanded[col1] = pd.cut(
            df_expanded[col1],
            bins=range(10, 101, 10),
            right=False,
            labels=[f"{i}-{i+9}" for i in range(10, 100, 10)],
        )
    elif col1 == "Positive Feedback Count":
        df_expanded[col1] = pd.cut(
            df_expanded[col1],
            bins=range(0, 21, 5),
            right=False,
            labels=[f"{i}-{i+4}" for i in range(0, 20, 5)],
        )

    # Group by the specified columns and count occurrences
    counts = df_expanded.groupby([col1, col2]).size().unstack(fill_value=0)

    if col1 == "Age" or "Positive Feedback Count":
        # Normalize the data by the total counts in each age group
        counts_normalized = counts.div(counts.sum(axis=1), axis=0)
    else:
        counts_normalized = counts
    fig, ax = plt.subplots(width_ratios=[0.8])
    # Stacked bar chart for better visualization of proportions
    counts_normalized.plot(kind="bar", ax=ax, width=0.8, stacked=True)
    ax.set_title(f"Normalized Frequency of {col2} by {col1}")
    ax.set_xlabel(col1)
    ax.set_ylabel("Normalized Frequency")
    ax.legend(title=col2)
    ax.tick_params(labelrotation=0)

    # Use Streamlit to display the chart
    st.pyplot(fig)


def apps():
    FLATTEN_SCHEMA = {
        "Fit Sizing": ["true to size", "runs small", "runs large"],
        "Fit Silhouette": [
            "flattering",
            "comfortable",
            "loose",
            "boxy",
            "fitted",
            "flowy",
        ],
        "Fit Body Area Waist": [
            "high-waisted",
            "low-waisted",
            "empire waist",
            "natural waist",
        ],
        "Fit Body Area Hips": ["tight", "loose", "just right"],
        "Fit Body Area Length": ["long", "short", "midi", "maxi", "cropped"],
        "Style Aesthetic": [
            "classic",
            "trendy",
            "bohemian",
            "romantic",
            "vintage",
            "minimalistic",
        ],
        "Quality Construction": ["well-made", "cheap", "other"],
        "Issue": [
            "zipper_problems",
            "see-through",
            "fabric_quality",
            "inconsistent_sizing",
            "arm_hole_issues",
            "unflattering",
            "itchy",
            "too_short",
            "too_long",
            "too_tight",
            "too_loose",
            "shrinkage",
        ],
        "Sentiment": ["positive", "negative", "neutral"],
    }

    flatten_columns = [
        "Fit Sizing",
        "Fit Silhouette",
        "Fit Body Area Waist",
        "Fit Body Area Hips",
        "Fit Body Area Length",
        "Style Aesthetic",
        "Quality Construction",
        "Issue",
        "Sentiment",
    ]
    compare_columns = ["Age", "Rating", "Positive Feedback Count"]

    TABLE_ID = "WomenClothingReviews_cookbook"

    rows = get_rows(TABLE_ID)

    tabs = st.tabs(["Action Table", "Keywords"] + flatten_columns)
    tab_action_table, tab_analysis_age_keywords = tabs[0:2]
    tab_matrix = tabs[2:]

    df_ = pd.DataFrame(rows)

    with tab_action_table:
        st.table(df_)

    with tab_analysis_age_keywords:
        df = df_[["No", "Age", "Rating", "Keywords"]]
        df_expanded_age_keywords = df.drop("Keywords", axis=1).join(
            df["Keywords"]
            .str.split(", ", expand=True)
            .stack()
            .reset_index(level=1, drop=True)
            .rename("Keywords")
        )

        keyword_counts = df_expanded_age_keywords["Keywords"].value_counts().head(100)

        st.dataframe(
            keyword_counts.reset_index().rename(
                columns={"index": "Keyword", "keyword": "Frequency"}
            )
        )

        keyword_freq = keyword_counts.to_dict()

        wordcloud = WordCloud(width=800, height=400, background_color="white")

        # Generate the word cloud from frequencies
        wordcloud.generate_from_frequencies(keyword_freq)

        # Use matplotlib to create a figure
        fig, ax = plt.subplots()
        ax.imshow(wordcloud, interpolation="bilinear")
        ax.axis("off")  # Hide the axes

        st.pyplot(fig)

    for tab, col2 in zip(tab_matrix, flatten_columns):
        with tab:

            subtabs = st.columns([0.3, 0.3, 0.3])
            for subtab, col1 in zip(subtabs, compare_columns):

                matrix_name = f"{col1} vs {col2}"
                with subtab:
                    st.write(matrix_name)
                    df = df_[["No", col1, col2]]
                    df_expanded = df.drop(col2, axis=1).join(
                        df[col2]
                        .str.split(", ", expand=True)
                        .stack()
                        .reset_index(level=1, drop=True)
                        .rename(col2)
                    )

                    keywords_to_keep = FLATTEN_SCHEMA[col2]

                    # Filter the DataFrame
                    filtered_df = df_expanded[df_expanded[col2].isin(keywords_to_keep)]

                    bar_chart(filtered_df, col1, col2)
                    st.table(filtered_df)


def main():
    st.set_page_config(page_icon="🦊", layout="wide")
    st.title("Jamai Women Clothing Reviews Dashboard 🦊🌸")
    try:
        apps()
    except Exception as e:
        logger.exception(e)
        st.error(e)
        st.warning(
            "Sorry we seem to have encountered an internal issue 🥺🙏 \nPlease try refreshing your browser."
        )


if __name__ == "__main__":
    logger.remove()
    logger.add(sys.stderr, level="INFO")
    logger.add(
        "jamai_app.log",
        level="INFO",
        enqueue=True,
        backtrace=True,
        diagnose=True,
        rotation="50 MB",
    )
    main()
