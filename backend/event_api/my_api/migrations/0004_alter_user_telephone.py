# Generated by Django 5.0.2 on 2024-02-16 16:42

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('my_api', '0003_remove_user_is_participant'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='telephone',
            field=models.CharField(max_length=100, primary_key=True, serialize=False, unique=True),
        ),
    ]
