Project : Realtime Chat Application
Author : Sai Kadle

How to make it work :

1. Open terminal
2. Execute `npm install`
3. Execute `node server.js`

How it works :

1. Open http://localhost:3000 in a window in two different browsers.
2. Enter user name and email from user.
3. Once two users are online simultaniously, they will be seen in the active user sction.
4. Select user to chat with.
5. Start typing your message in the input box and click the send button.


Tradeoffs :

1. Only one user allowed in one browser. This can be easily fixed and removed if given more time to work on.
2. Messages are being saved in the scope and not in DB. Messages will disappear when page is refreshed. Additional functionality can be added to remove this bottleneck.
3. Worked on the DB schema but need more time to implement and add parts and pieces.
4. Using socket.io as a dependency.
5. Traded testing to implement features. If more time was available, would have loved to write test cases.