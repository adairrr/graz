---
sidebar_position: 5
---

# Generate ChainInfo

With `graz generate` you can generate mainnet and testnet chain `ChainInfo` directly from https://cosmos.directory

```shell
# using yarn
yarn graz generate
```

#### Options:

```shell

  -g, --generate        Generate chain definitions and export to "graz/chains"
  -h, --help            Show this help message
```

#### Generate options:

```shell
  -b, --best            Set REST and RPC endpoint to best available nodes instead or first listed ones
  -M, --mainnet         Generate given mainnet chain paths seperated by commas (e.g. "axelar,cosmoshub,juno")
  -T, --testnet         Generate given testnet chain paths seperated by commas (e.g. "atlantic,bitcannadev,cheqdtestnet")
  --authz               Generate only authz compatible chains

```

#### Add it to your project

in your package.json add it to in your install or postInstall scripts

```ts
{
  // ...
  "scripts": {
    "install": "graz generate -g"
  }
  // ...
}
```

#### Import generated chains

After you generate `ChainInfo` you can use it in you project

```ts
import { axelar, cosmoshub, sommelier } from "graz/chains";
```
