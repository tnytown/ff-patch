{
  inputs = {
    nixpkgs.url = "nixpkgs/release-21.05";
    utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, utils }: utils.lib.eachDefaultSystem
    (system:
      let pkgs = import nixpkgs { inherit system; };
          linuxPkgs = [];
      in {
        devShell = pkgs.mkShell {
          name = "ff-patch-devshell";

          buildInputs = with pkgs; [
            python3
          ] ++ (with nodePackages; [
            # frontend
            nodejs npm pandoc
          ]) ++ linuxPkgs;

          nativeBuildInputs = with pkgs; [];
        };
      });
}
