_default:
	@just --list --unsorted --list-heading '' --list-prefix '— '

check:
	tree-sitter generate

build: check
	tree-sitter build
