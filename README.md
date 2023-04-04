# ClickUp Integration for Rocket.Chat

![Horizontal Banner](https://user-images.githubusercontent.com/65130881/188604007-e3a39ba1-9536-48cd-8955-e874c02f543c.png)

The ClickUp App for Rocket.Chat  provides a seamless integration between ClickUp and Rocket.Chat and improves collaboration between teams.
The application allows users to create and manage thier tasks and workspace, subscribe to task events, create new tasks, edit and delete their tasks, lists, folders, spaces & workspaces and do much more right from Rocket.Chat.


<h2>🚀 Features </h2>
<ul>
  <li>Quick and easy setup.</li> 
  <li>Login to ClickUp with one click using built-in OAuth2 mechanism.</li>
  <li>Subscribe to Task Events and get notified about new comments, priority changes, assignee updates, etc.</li>
  <li>Retreive and manage tasks right from Rocket.Chat channels.</li>
  <li>Create new tasks from Rocket.Chat and make channel of task assignees.</li>
  <li>Edit the tasks right in Rocket.Chat and share them with other channel members.</li>
</ul>


<h2>🔧 Installation steps </h2>

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

    For more info refer [this](https://developer.rocket.chat/apps-engine/getting-started/rocket.chat-app-engine-cli) guide

<h2>📲 Setup guide </h2>
 <ul>
  <li> Create an app on ClickUp by following these steps:</li> 
  
  1. Navigate to Integrations  page in team settings. 
  
  2. Select the ClickUp API tab.
  
  3. Click on Create an App, enter desired app name and your server's URL without trailing slash in the Redirect URL(s) input box.
  
  4. Click on Create App button to generate a Client ID and Client Secret.
  
  <li>Fill the details in the ClickUp app on your server by following these steps:</li>
  
  1. Navigate to Administration->Apps. 
  
  2. Select the Installed tab.
  
  3. Click on ClickUp, and go to Settings tab.
  
  4. Enter your generated a Client ID and Client Secret and click on Save changes button.
  
  <li>Start the authorization by using /clickup-app auth slash command.</li>
</ul>


