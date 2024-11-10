BASE_URL := ":3001/"

## help                    Show available commands
help:
	@echo 'Usage:'
	@sed -n 's/^##//p' $(MAKEFILE_LIST)

## auth/login email=<email> password=<password>           Log in and create a session
auth/login:
	@[ -n "$(email)" ] || (echo "email is required, use email=<email>"; exit 1)
	@[ -n "$(password)" ] || (echo "password is required, use password=<password>"; exit 1)
	http POST $(BASE_URL)/auth/login email="$(email)" password="$(password)"

## auth/register email=<email> password=<password>        Register a new user
auth/register:
	@[ -n "$(email)" ] || (echo "email is required, use email=<email>"; exit 1)
	@[ -n "$(password)" ] || (echo "password is required, use password=<password>"; exit 1)
	http POST $(BASE_URL)/auth/register email="$(email)" password="$(password)"

session/create:
	@[ -n "$(token)" ] || (echo "token is required, use token=<your_token>"; exit 1)
	http --session=./http.json -A bearer -a "$(token)" $(BASE_URL)

## notes/get-user                                       Fetch user secrets
notes/get-user:
	http --session=./http.json $(BASE_URL)/notes/user


## groups/create group_name=<group_name>                  Create a new group
notes/create:
	@[ -n "$(notes_title)" ] || (echo "notes_title is required"; exit 1)
	@[ -n "$(notes_content)" ] || (echo "notes_content is required"; exit 1)
	http POST $(BASE_URL)/notes title="$(notes_title)" content="$(notes_content)" --session=./http.json

# notes/delete:
# 	@[ -n "$(note_title)" ] || (echo "notes_title is required"; exit 1)
# 	@[ -n "$(note_content)" ] || (echo "notes_notes is required"; exit 1)
# 	http DELETE $(BASE_URL)/notes title="$(notes_title)" content="$(notes_content)" --session=./http.json
