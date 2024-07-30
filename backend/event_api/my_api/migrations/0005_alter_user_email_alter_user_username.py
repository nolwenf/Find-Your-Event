# Generated by Django 5.0.2 on 2024-02-16 16:43

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('my_api', '0004_alter_user_telephone'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='email',
            field=models.EmailField(max_length=100, unique=True),
        ),
        migrations.AlterField(
            model_name='user',
            name='username',
            field=models.CharField(max_length=100, unique=True),
        ),
    ]
