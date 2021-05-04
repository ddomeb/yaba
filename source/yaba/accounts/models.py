from django.db import models
from django.contrib.auth.models import User


class Account(models.Model):
    ACCOUNT_TYPE_CHOICES = (
        ('account', 'Account'),
        ('savings', 'Savings')
    )

    name = models.CharField(max_length=50)
    description = models.TextField(blank=True, max_length=250)
    balance = models.IntegerField()
    created = models.DateTimeField(auto_now_add=True, editable=False)
    type = models.CharField(max_length=20, choices=ACCOUNT_TYPE_CHOICES, default='account')
    isEnabled = models.BooleanField(default=True)
    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='accounts',
        db_index=True,
    )

    def __str__(self):
        return f"{self.owner.username} - {self.name}"
