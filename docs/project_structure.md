## LMD project structure

LMD uses that dir structure (its **optional** but it required if you are using LMD CLI comands):

```
+-root/                   | Your project root dir
  +-.lmd/                 | LMD dir
  | +-logs/               | LMD stats server logs
  | | +-dev/              |
  | | +-test/             | LMD stats server logs for builds
  | | +-prod/             |
  | |   +-somelog.json    | One of stats server log file for prod build
  | |                     |
  | +-dev.lmd.json        |
  | +-test.lmd.json       | One of build file
  | +-prod.lmd.json       |
  | +-your_name.lmd.json  |
  |                       |
  +-your_stuff/           |
  +-your_stuff2/          |
  +-your_stuff3/          |
```
