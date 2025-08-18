PORJETC_NAME=transcendence

all : build up

build:
	docker compose -p $(PORJETC_NAME) build

up:
	docker compose -p $(PORJETC_NAME) up 

down:
	docker compose -p $(PORJETC_NAME) down

clean:
	docker compose -p $(PORJETC_NAME) down -v

fclean :
	docker compose -p $(PORJETC_NAME) down -v --rmi all

logs:
	docker compose -p $(PORJETC_NAME) logs -f

shell:
	docker exec -it $(docker ps -qf "name=$(PORJETC_NAME)_$(service)_1") shell

re: fclean build up

.PHONY: all build up down clean fclean logs shell re