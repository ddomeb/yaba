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


class CashFlowStat:
    def __init__(self, income: int, expense: int):
        self.income = income
        self.expense = expense


class MonthlyStats:
    def __init__(self, this_month: CashFlowStat, prev_month: CashFlowStat):
        self.thisMonth = this_month
        self.prevMonth = prev_month
