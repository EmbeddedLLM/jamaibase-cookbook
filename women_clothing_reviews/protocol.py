from typing import Annotated, Generic, Sequence, TypeVar
from pydantic import BaseModel, Field

T = TypeVar("T")


class Page(BaseModel, Generic[T]):
    items: Annotated[
        Sequence[T], Field(description="List of items paginated items.", examples=[[]])
    ] = []
    offset: Annotated[
        int, Field(description="Number of skipped items.", examples=[0])
    ] = 0
    limit: Annotated[
        int, Field(description="Number of items per page.", examples=[0])
    ] = 0
    total: Annotated[int, Field(description="Total number of items.", examples=[0])] = 0
