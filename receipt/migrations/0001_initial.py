# -*- coding: utf-8 -*-
# Generated by Django 1.9.2 on 2016-03-22 00:08
from __future__ import unicode_literals

from django.conf import settings
import django.core.validators
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
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
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Catagory',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date_created', models.DateTimeField(auto_now_add=True)),
                ('name', models.CharField(max_length=25, unique=True, validators=[django.core.validators.MinLengthValidator(4)])),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-id'],
            },
        ),
        migrations.CreateModel(
            name='Item',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date_created', models.DateTimeField(auto_now_add=True)),
                ('name', models.CharField(max_length=15, unique=True, validators=[django.core.validators.MinLengthValidator(4)])),
                ('where_from', models.CharField(blank=True, max_length=10, null=True)),
                ('price', models.DecimalField(decimal_places=2, max_digits=19)),
                ('number_of_times_purchased', models.IntegerField(blank=True, default=0)),
                ('catagory', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='receipt.Catagory')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-date_created'],
            },
        ),
        migrations.CreateModel(
            name='Purchase',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date_created', models.DateTimeField(auto_now_add=True)),
                ('amount_payed', models.DecimalField(decimal_places=2, max_digits=19)),
                ('item_purchased', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='receipt.Item')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-date_created'],
            },
        ),
        migrations.CreateModel(
            name='Start',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('is_start_of_app', models.BooleanField(default=False)),
            ],
        ),
        migrations.CreateModel(
            name='WhatPage',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('obj', models.CharField(choices=[('item', 'item'), ('purchase', 'purchase')], max_length=15, unique=True)),
                ('page_number', models.IntegerField()),
                ('number_per_page', models.IntegerField()),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.AlterUniqueTogether(
            name='item',
            unique_together=set([('name', 'where_from', 'catagory')]),
        ),
    ]
