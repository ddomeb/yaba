class CashFlowStat:
    def __init__(self, income: int, expense: int):
        self.income = income
        self.expense = expense


class MonthlyStats:
    def __init__(self, this_month: CashFlowStat, prev_month: CashFlowStat):
        self.thisMonth = this_month
        self.prevMonth = prev_month
