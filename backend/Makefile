# Define the virtual environment name
VENV_NAME := virtualenv



# Backend command to run Django server
all: launch

migration:
	@. $(VENV_NAME)/bin/activate && cd event_api && python3 manage.py makemigrations && python3 manage.py migrate

db:
	@docker compose up -d

launch : db
	@echo "Launching Django server..."
	@. $(VENV_NAME)/bin/activate && cd event_api && python3 manage.py runserver

# Install Django and Django Rest Framework
install:
	@echo "Setting up virtual environment..."
	@python3 -m venv $(VENV_NAME)
	@. $(VENV_NAME)/bin/activate && pip install -r requirements.txt
	@echo "Django and Django Rest Framework installed successfully!"
	@echo "Run 'make' to start the Django server."

deps:
	@echo "Updating dependencies..."
	@. $(VENV_NAME)/bin/activate && pip install -r requirements.txt
	@echo "Dependencies successfully updated!"

.PHONY: backend install all
