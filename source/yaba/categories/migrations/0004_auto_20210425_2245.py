# Generated by Django 3.2 on 2021-04-25 20:45

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("categories", "0003_auto_20210423_2006"),
    ]

    operations = [
        migrations.AlterField(
            model_name="maincategory",
            name="name",
            field=models.CharField(max_length=80),
        ),
        migrations.AlterField(
            model_name="subcategory",
            name="name",
            field=models.CharField(max_length=80),
        ),
    ]
