{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs?ref=nixos-unstable";
  };

  outputs =
    { self, nixpkgs }:
    let
      inherit (nixpkgs.lib) genAttrs;

      forAllSystems = genAttrs [
        "x86_64-linux"
        "aarch64-linux"
        "aarch64-darwin"
      ];
      forAllPkgs = function: forAllSystems (system: function pkgs.${system});

      manifest = builtins.fromJSON (builtins.readFile ./tree-sitter.json);

      pkgs = forAllSystems (
        system:
        import nixpkgs {
          inherit system;
          overlays = [ ];
        }
      );
    in
    {
      formatter = forAllPkgs (pkgs: pkgs.nixfmt-tree);

      packages = forAllPkgs (pkgs: rec {
        default = tree-sitter-kalei;
        tree-sitter-kalei = pkgs.tree-sitter.buildGrammar {
          language = "kalei";
          version = manifest.metadata.version;
          src = ./.;

          generate = true;
        };
      });

      devShells = forAllPkgs (pkgs: {
        default = pkgs.mkShell {
          packages = with pkgs; [
            nodejs
            tree-sitter
            # (tree-sitter.override { webUISupport = true; })
          ];
        };
      });
    };
}
