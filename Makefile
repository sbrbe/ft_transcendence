PROJECT_NAME=transcendence

all : build up

build:
	docker compose -p $(PROJECT_NAME) build 

up:
	docker compose -p $(PROJECT_NAME)  up

down:
	docker compose -p $(PROJECT_NAME) down

clean:
	docker compose -p $(PROJECT_NAME) down -v

fclean :
	docker compose -p $(PROJECT_NAME) down -v --rmi all

logs:
	docker compose -p $(PROJECT_NAME) logs -f

shell:
	docker exec -it $(docker ps -qf "name=$(PROJECT_NAME)_$(service)_1") shell

re: fclean build up

.PHONY: all build up down clean fclean logs shell re