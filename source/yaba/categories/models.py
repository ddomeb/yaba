from django.db import models
from django.contrib.auth.models import User


class MainCategory(models.Model):
    class Meta:
        verbose_name_plural = "Main categories"

    name = models.CharField(max_length=50)
    description = models.TextField(blank=True, max_length=100)
    isIncome = models.BooleanField(default=False)
    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="main_categories",
        db_index=True,
    )

    def __str__(self):
        return f"{self.owner.username} - {self.name}"


class SubCategory(models.Model):
    class Meta:
        verbose_name_plural = "Subcategories"

    name = models.CharField(max_length=80)
    description = models.TextField(blank=True, max_length=100)
    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="subcategories",
        db_index=True,
    )
    main_category = models.ForeignKey(
        MainCategory,
        on_delete=models.CASCADE,
        related_name="subcategories",
    )

    def __str__(self):
        return f"{self.owner.username} - {self.name}"
