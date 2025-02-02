# Generated by Django 5.0.2 on 2024-03-08 13:19

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('my_api', '0007_alter_user_token'),
    ]

    operations = [
        migrations.RenameField(
            model_name='billet',
            old_name='qr_code_link',
            new_name='qr_code_data',
        ),
        migrations.AddField(
            model_name='user',
            name='two_fa',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='user',
            name='two_fa_link',
            field=models.CharField(default='', max_length=100),
        ),
    ]
