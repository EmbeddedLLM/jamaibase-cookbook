import pandas as pd
import json
import time
import httpx
from httpx import Timeout
from loguru import logger

from eagle.protocol import (
    Page,
    TableMetaResponse,
)


BASE_URL = "http://192.168.80.61:6969/api"

SCHEMA = {
    "features": {
        "fit": {
            "sizing": ["true to size", "runs small", "runs large", "other"],
            "silhouette": [
                "flattering",
                "comfortable",
                "loose",
                "boxy",
                "fitted",
                "flowy",
                "other",
            ],
            "body_area_fit": {
                "waist": [
                    "high-waisted",
                    "low-waisted",
                    "empire waist",
                    "natural waist",
                    "other",
                ],
                "hips": ["tight", "loose", "just right"],
                "length": ["long", "short", "midi", "maxi", "cropped", "other"],
            },
        },
        "style": {
            "aesthetic": [
                "classic",
                "trendy",
                "bohemian",
                "romantic",
                "vintage",
                "minimalistic",
                "other",
            ],
        },
        "quality": {
            "construction": ["well-made", "cheap", "other"],
        },
    },
    "issues": [
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
        "other",
    ],
    "sentiment": ["positive", "negative", "neutral"],
}

FULL_SCHEMA = {
    "clothing_id": "int",
    "age": "int",
    "title": "string",
    "review_text": "string",
    "rating": "int",
    "recommended": "bool",
    "positive_feedback_count": "int",
    "division_name": "string",
    "department_name": "string",
    "class_name": "string",
    "features": SCHEMA["features"],
    "issues": SCHEMA["issues"],
    "sentiment": SCHEMA["sentiment"],
}


DF = pd.read_csv("Womens Clothing E-Commerce Reviews.csv")


class Timer:
    def __enter__(self):
        self.start = time.time()
        return self

    def __exit__(self, *args):
        self.end = time.time()
        self.interval = self.end - self.start
        logger.info(
            f"Execution time: {self.interval:.2f} seconds | {self.interval/60:.2f} minutes | {self.interval/3600:.2f} hours"
        )


class ActionTableCommuniate:
    def __init__(self) -> None:
        self.client = httpx.Client(
            transport=httpx.HTTPTransport(retries=3), timeout=Timeout(5 * 60)
        )

    def create_table(
        self,
        table_id: str,
        cols_info: tuple[dict[str, str], dict[str, str]] = None,
    ):

        schema = {
            "id": table_id,
            "cols": [{"id": k, "dtype": v} for k, v in cols_info[0].items()]
            + [{"id": k, "dtype": v} for k, v in cols_info[1].items()],
        }

        response = self.client.post(f"{BASE_URL}/v1/gen_tables/action", json=schema)
        response.raise_for_status()

    def add_row(self, table_id: str, row=dict[str, str]):
        response = self.client.post(
            f"{BASE_URL}/v1/gen_tables/action/rows/add",
            json={"table_id": table_id, "data": row, "stream": False},
        )
        logger.info(response.text)
        response.raise_for_status()
        logger.info(response.json())
        return

    def update_gen_config(self, gen_config: dict):
        response = self.client.post(
            f"{BASE_URL}/v1/gen_tables/action/gen_config/update",
            json=gen_config,
        )
        logger.info(response.status_code)
        response.raise_for_status()

    def get_table(self, table_id):
        response = self.client.get(f"{BASE_URL}/v1/gen_tables/action/{table_id}")
        response.raise_for_status()
        meta = TableMetaResponse(**response.json())
        return meta

    def list_tables(self):
        response = self.client.get(f"{BASE_URL}/v1/gen_tables/action")
        response.raise_for_status()
        page = Page[TableMetaResponse](**response.json())
        table_ids = [page_item.id for page_item in page.items]
        logger.info(table_ids)
        return table_ids

    def delete_table(self, table_id):
        response = self.client.delete(f"{BASE_URL}/v1/gen_tables/action/{table_id}")
        response.raise_for_status()

    def get_rows(self, table_id):
        response = self.client.get(f"{BASE_URL}/v1/gen_tables/action/{table_id}/rows")
        response.raise_for_status()
        page = Page[dict](**response.json())
        return page.items


def prompt_of_col(model_name: str, column_name: str):
    return {
        "id": "",
        "model": model_name,
        "messages": [
            {
                "role": "system",
                "content": "You are an artificial intelligent assistant created by EmbeddedLLM. You should give helpful, detailed, and polite answers to the human's questions.",
            },
            {
                "role": "user",
                "content": "${Features} \n\nJson data above is the customer review, get the information of "
                + f"{column_name}. If the information is null, just output null. Format the list into lowercase string seperated by comma. \nOnly output the string seperated by comma, not list, do not include any other information.",
            },
        ],
        "functions": [],
        "function_call": "auto",
        "temperature": 0.1,
        "top_p": 0.01,
        "stream": False,
        "stop": [],
        "max_tokens": 2000,
        "presence_penalty": 0,
        "frequency_penalty": 0,
    }


def main():

    MODEL_NAME = "anthropic/claude-3-haiku-20240307"

    atc = ActionTableCommuniate()

    table_id = f"WomenClothingReviews_cookbook"

    try:
        # Check exiting tables
        current_table_ids = atc.list_tables()
        logger.info(f"Existing Table Ids: {current_table_ids}")

        # atc.delete_table(table_id)

        cols_info = (
            {
                "No": "int",
                "Clothing Id": "int",
                "Age": "int",
                "Title": "str",
                "Review Text": "str",
                "Rating": "int",
                "Recommended": "bool",
                "Positive Feedback Count": "int",
                "Division Name": "str",
                "Department Name": "str",
                "Class Name": "str",
            },
            {
                "Keywords": "str",
                "Features": "str",
                "Fit Sizing": "str",
                "Fit Silhouette": "str",
                "Fit Body Area Waist": "str",
                "Fit Body Area Hips": "str",
                "Fit Body Area Length": "str",
                "Style Aesthetic": "str",
                "Quality Construction": "str",
                "Issue": "str",
                "Sentiment": "str",
            },
        )

        # atc.create_table(table_id, cols_info)

        column_map = {
            "Keywords": {
                "id": "",
                "model": MODEL_NAME,
                "messages": [
                    {
                        "role": "system",
                        "content": "You are an artificial intelligent assistant created by EmbeddedLLM. You should give helpful, detailed, and polite answers to the human's questions.",
                    },
                    {
                        "role": "user",
                        "content": "[Title]: \n${Title} \n\n[Review Text]: \n${Review Text}"
                        + "\n\n\nUnderstand the Title and Review Text, extract keywords to help people read better. "
                        + "List out the keywords, seperate by comma. Only output keywords, do not include any other information.",
                    },
                ],
                "functions": [],
                "function_call": "auto",
                "temperature": 0.1,
                "top_p": 0.01,
                "stream": False,
                "stop": [],
                "max_tokens": 2000,
                "presence_penalty": 0,
                "frequency_penalty": 0,
            },
            "Features": {
                "id": "",
                "model": "openai/gpt-3.5-turbo",
                "messages": [
                    {
                        "role": "system",
                        "content": "You are an artificial intelligent assistant created by EmbeddedLLM. You should give helpful, detailed, and polite answers to the human's questions.",
                    },
                    {
                        "role": "user",
                        "content": "[Title]: \n${Title} \n\n[Review Text]: \n${Review Text} \n\n[Schema]: \n"
                        + json.dumps(SCHEMA)
                        + "\n\n\nUnderstand the Title and Review Text, convert the result to structural format based on Schema."
                        + "\nIf there is no information in the Review Text, put Null. Only output structured json, do not include any other information.",
                    },
                ],
                "functions": [],
                "function_call": "auto",
                "temperature": 0.1,
                "top_p": 0.01,
                "stream": False,
                "stop": [],
                "max_tokens": 2000,
                "presence_penalty": 0,
                "frequency_penalty": 0,
            },
        }
        for out_col in cols_info[1].keys():
            if out_col not in ["Keywords", "Features"]:
                column_map[out_col] = prompt_of_col(MODEL_NAME, out_col)

        gen_config = {"table_id": table_id, "column_map": column_map}
        atc.update_gen_config(gen_config)

        col_map = {
            "Unnamed: 0": "No",
            "Clothing ID": "Clothing Id",
            "Recommended IND": "Recommended",
        }

        records = DF.to_dict("records")
        # --- Sample some rows, comment out to include all rows --- #
        records = records[::1000]
        # --------------------------------------------------------- #
        with Timer() as t:
            for i, record in enumerate(records):
                try:
                    row = {
                        col_map[k] if k in col_map else k: str(v)
                        for k, v in record.items()
                    }
                    logger.info(f"Adding {i}, {row}")
                    atc.add_row(table_id, row)
                except Exception:
                    continue

        logger.info(f"Inserted {len(records)} rows.")

        # Check inserted row
        result_rows = atc.get_rows(table_id)
        logger.info(result_rows[0])

    except httpx.HTTPError as http_err:
        logger.error(f"HTTP error occurred: {http_err}")
    except Exception as err:
        logger.error(f"An error occurred: {err}")


if __name__ == "__main__":
    main()
