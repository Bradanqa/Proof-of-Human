.PHONY: all setup test deploy clean dev backend frontend contracts

all: setup test

setup:
	@echo "Setting up environment..."
	@bash scripts/setup.sh

test:
	@echo "Running tests..."
	@bash scripts/test.sh

deploy:
	@echo "Deploying application..."
	@bash scripts/deploy.sh

dev:
	@echo "Starting development environment..."
	@docker-compose up -d

backend:
	@echo "Starting backend..."
	@cd backend && source venv/bin/activate && python main.py

frontend:
	@echo "Starting frontend..."
	@cd frontend && npm run dev

contracts:
	@echo "Building contracts..."
	@cd programs/human-registry && anchor build

clean:
	@echo "Cleaning up..."
	@rm -rf backend/venv
	@rm -rf backend/__pycache__
	@rm -rf frontend/node_modules
	@rm -rf frontend/.next
	@rm -rf programs/human-registry/target
	@rm -rf programs/human-registry/node_modules
	@docker-compose down -v

install-backend:
	@cd backend && pip install -r requirements.txt

install-frontend:
	@cd frontend && npm install

lint:
	@cd backend && flake8 .
	@cd frontend && npm run lint

migrate:
	@cd backend && python -m alembic upgrade head

logs:
	@docker-compose logs -f

stop:
	@docker-compose down

restart: stop dev