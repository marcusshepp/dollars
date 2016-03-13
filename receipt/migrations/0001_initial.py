# -*- coding: utf-8 -*-
# Generated by Django 1.9.2 on 2016-03-11 23:53
from __future__ import unicode_literals

import django.core.validators
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Action',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=100)),
                ('description', models.CharField(max_length=1000, null=True)),
                ('object_name', models.CharField(max_length=25, null=True)),
                ('undo_handler', models.CharField(choices=[('undo add item', 'Undo Add Item'), ('undo purchase', 'Undo Purchase')], max_length=25, null=True)),
            ],
        ),
        migrations.CreateModel(
            name='Budget',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date_created', models.DateTimeField(auto_now_add=True)),
                ('monthly_paycheck', models.DecimalField(decimal_places=2, max_digits=19)),
                ('monthly_saving_desired', models.DecimalField(decimal_places=2, max_digits=19)),
            ],
        ),
        migrations.CreateModel(
            name='Catagory',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date_created', models.DateTimeField(auto_now_add=True)),
                ('name', models.CharField(max_length=25, validators=[django.core.validators.MinLengthValidator(4)])),
            ],
            options={
                'ordering': ['name'],
            },
        ),
        migrations.CreateModel(
            name='Item',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date_created', models.DateTimeField(auto_now_add=True)),
                ('name', models.CharField(max_length=15, unique=True, validators=[django.core.validators.MinLengthValidator(4)])),
                ('company_came_from', models.CharField(blank=True, max_length=10, null=True)),
                ('price', models.DecimalField(decimal_places=2, max_digits=19)),
                ('number_of_times_purchased', models.IntegerField(blank=True, default=0)),
                ('catagory', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='receipt.Catagory')),
            ],
            options={
                'ordering': ['-date_created'],
            },
        ),
        migrations.CreateModel(
            name='Pic',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=100)),
                ('docfile', models.FileField(upload_to='pics/')),
            ],
        ),
        migrations.CreateModel(
            name='Purchase',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date_created', models.DateTimeField(auto_now_add=True)),
                ('amount_payed', models.DecimalField(decimal_places=2, max_digits=19)),
                ('item_purchased', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='receipt.Item')),
            ],
            options={
                'ordering': ['-date_created'],
            },
        ),
        migrations.AlterUniqueTogether(
            name='item',
            unique_together=set([('name', 'company_came_from', 'catagory')]),
        ),
    ]
