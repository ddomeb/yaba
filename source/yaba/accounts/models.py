import datetime

from django.db import models
from django.contrib.auth.models import User


class Account(models.Model):
    # TODO: add icon field and user settings (JSONField)

    ACCOUNT_TYPE_CHOICES = (
        ('account', 'Account'),
        ('savings', 'Savings')
    )

    name = models.CharField(max_length=250)
    description = models.TextField()
    balance = models.IntegerField()
    created = models.DateTimeField(auto_now_add=True)
    type = models.CharField(max_length=20, choices=ACCOUNT_TYPE_CHOICES, default='account')
    isEnabled = models.BooleanField(default=True)
    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='accounts'
    )

    def __str__(self):
        return f"{self.owner.username} - {self.name}"
