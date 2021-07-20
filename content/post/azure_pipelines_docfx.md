---
title: Build and deploy DocFx with Azure pipelines
date: 2021-07-20
draft: true
---

```yaml
trigger:
- master

pool:
  vmImage: ubuntu-latest

steps:
  - checkout: self
    submodules: true
  - task: Bash@3
    displayName: Install and build docfx
    inputs:
      targetType: 'inline'
      script: |
        apt-get install mono-runtime mono-devel msbuild
        curl -o docfx.zip -sSL https://github.com/dotnet/docfx/releases/download/v2.58/docfx.zip
        unzip docfx.zip -d tmp/
        rm docfx.zip
        chmod +x tmp/docfx.exe
        tmp/docfx.exe ./docfx.json
  - task: AzureStaticWebApp@0
    inputs:
      app_location: '/_site/'
      api_location: ''
      output_location: ''
    env:
      azure_static_web_apps_api_token: $(deployment_token)
```
