# Generated by Django 3.2 on 2021-05-15 15:40

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("categories", "0007_maincategory_isincome"),
    ]

    operations = [
        migrations.AlterField(
            model_name="maincategory",
            name="description",
            field=models.TextField(blank=True, max_length=100),
        ),
        migrations.AlterField(
            model_name="subcategory",
            name="description",
            field=models.TextField(blank=True, max_length=100),
        ),
    ]