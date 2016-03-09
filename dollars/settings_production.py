from .settings_general import *

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': 'dollars',
        'USER': 'dollars',
        'PASSWORD': 'dollars',
        'HOST': 'localhost',
        'PORT': '',
    }
}