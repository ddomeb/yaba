import datetime

from typing import List


class SeriesData:
    def __init__(self, value: int, name: datetime.datetime):
        self.value = value
        self.name = name


class AccountHistory:
    def __init__(self, name: str, series: List[SeriesData]):
        self.name = name
        self.series = series
