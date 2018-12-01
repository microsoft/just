---
id: doc-start
title: Getting Started with Create SDX App
sidebar_label: Getting Started
---

# Getting Started

Simply put, SDX is the easiest way for Microsoft web and native front end developers to develop and ship code that is coherent across multiple platforms and easily hosted on multiple Microsoft products.

The SDX Platform documentation is here [Service Delivered Experiences](https://sdx-docs.azurewebsites.net/en-us/documentation/Consuming-the-SDX-platform/Getting-started/Overview-of-SDX). This is a guide for the create-sdx-app tool and the build scripts that are included there.

## Prerequisites

The Create SDX App generates and maintains scripts to build and validate the SDX repo for you. This tool depends on several pieces of software to be installed in your development machine:

1. node.js version 8.x and above
2. yarn
3. native build platforms

## Install sdx-cli

Make sure you are authorized to install the `create-sdx` NPM feed:

```
npm install -g sdx-cli
```

## Running create-sdx to create your first application repository

For example, if you wanted to create a new repo directory called `hello-sdx`, type the following

```
sdx create hello-sdx
```

This will generate a SDX application repository directory structure ready to build and deploy!
