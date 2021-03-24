from django.db import models
from django.contrib.auth.models import User


class MainCategory(models.Model):
    name = models.CharField
    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='accounts',
        db_index=True,
        editable=False
    )


class SubCategory(models.Model):
    name = models.CharField
    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='accounts',
        db_index=True,
        editable=False
    )
    main_category = models.ForeignKey(
        MainCategory,
        on_delete=models.CASCADE,
        related_name="subcategories",
        editable=False
    )
