# FakeCSVGenerator

Online service for generating CSV file with fake (dummy) data using Python and Django.

## Local setup

1. Clone the project
2. Create virtual environment inside the project dir: `virtualenv env` and activate it `source env/bin/activate`
3. Run migrations: `python manage.py migrate`
4. Create first user via `createsuperuser` or through admin panel.
5. Start the project: `python manage.py runserver`
