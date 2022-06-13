# Apps.ClickUp
This Repository is for the GSOC 2022 ClickUp app integration for Rocket.Chat 

### Installation steps:

 1. Clone this repo and Change Directory: </br>
 `git clone https://github.com/RocketChat/Apps.ClickUp.git && cd Apps.ClickUp/`

 2. Install the required packages from `package.json`: </br>
	 `npm install`

 3. Deploy Rocket.Chat app: </br>
    `rc-apps deploy --url http://localhost:3000 --username user_username --password user_password`
    Where:
    - `http://localhost:3000` is your local server URL (if you are running in another port, change the 3000 to the appropriate port)
    - `user_username` is the username of your admin user.
    - `user_password` is the password of your admin user.

    For more info refer [this](https://rocket.chat/docs/developer-guides/developing-apps/getting-started/) guide
