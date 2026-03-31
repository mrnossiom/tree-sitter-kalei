package tree_sitter_kalei_test

import (
	"testing"

	tree_sitter "github.com/tree-sitter/go-tree-sitter"
	tree_sitter_kalei "github.com/mrnossiom/tree-sitter-kalei/bindings/go"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_kalei.Language())
	if language == nil {
		t.Errorf("Error loading Kalei grammar")
	}
}
