# Generated by Django 3.2 on 2021-04-23 18:06

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('categories', '0002_auto_20210405_2012'),
    ]

    operations = [
        migrations.AddField(
            model_name='maincategory',
            name='description',
            field=models.CharField(default='No description', max_length=150),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='subcategory',
            name='description',
            field=models.CharField(default='No description', max_length=150),
            preserve_default=False,
        ),
    ]