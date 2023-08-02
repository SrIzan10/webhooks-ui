# webhooks-ui
things to note:  
- both servers need to be in separate webservers and both in the host server.
- set up the .env file exactly as mentioned.
- the backend is safe to expose to the open internet but not the frontend. use cloudflare tunnels with authentication as an alternative.
- token is transfered via plain text from the frontend to the backend so make sure you have both of these secured.
- you need to download the source code, install dependencies on both folders, edit both .env files and run `yarn build` in the frontend project to create a static version of the frontend.

# how much time did it take you to do this?

too much time. aka a month.
[![wakatime](https://wakatime.com/badge/user/4ad16edf-eadc-48d9-b010-26f275fe0be6/project/ce142f6c-901a-4efc-853e-63087890800e.svg)](https://wakatime.com/badge/user/4ad16edf-eadc-48d9-b010-26f275fe0be6/project/ce142f6c-901a-4efc-853e-63087890800e)