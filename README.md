# tree-sitter-kalei

This is a grammar definition for the toy language at [mrnossiom/kaleic](https://github.com/mrnossiom/kaleic).

# Usage

## Helix

Add the following to your `languages.toml`:

```toml
[[language]]
name = "kalei"
scope = "source.kalei"
file-types = ["kl"]
injection-regex = "kalei"
indent = { tab-width = 4, unit = "    " }
comment-token = "//"
block-comment-tokens = { start = "/*", end = "*/" }

[[grammar]]
name = "kalei"
source = { git = "https://github.com/mrnossiom/tree-sitter-kalei", rev = "grammar" }
```

Don't forget to run `hx --grammar fetch` and `hx --grammar fetch`.
