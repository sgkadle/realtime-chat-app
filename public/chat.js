/*
*  Declare all global stores :
*    cacheChat acts like a cache for all messages and online users.
*    currentChat holds info for the current active chat user details.
*    userProfile has the logged in user details.
*/
const cacheChat = new Map();
const currentChat = {
  'socketid' : '',
  'username' : ''
};
const userProfile = {
  'name' : '',
  'email' : ''
}

/*
*  The main entry point for cour chat application.
*  It initializes other processes and stored data.
*/
const init = () => {
  // Fetch all user cookies
  const cookies = document.cookie ? document.cookie.split('user=') : [];

  if(cookies && cookies[1]){
    // Update and restore global user profile information.
    // Note: Use a cookie parser if using multiple cookies.
    const user = JSON.parse(cookies[1]);
    userProfile.email = user.email;
    userProfile.name = user.name;
    closeModalAndOpenSocket(user.email);
  }else{
    // If no cookie found, then show a user form where user can enter their details.
    document.querySelector('#submitUserDetails').addEventListener("click", async function(){
      const name = document.querySelector('#name').value;
      const email = document.querySelector('#email').value;

      if(name && email){
        try {
          const data = await postData('http://localhost:3000/api/newUser', { name, email });
          if(data && data.statusCode && data.response){
            document.cookie = `user=${JSON.stringify(data.response)}`;
            userProfile.email = data.response.email;
            userProfile.name = data.response.name;
            closeModalAndOpenSocket(data.response.email);
          }
        } catch (error) {
          console.error(error);
        }
      }
    });
  }
}

// Listen to the DOM Content Loaded event and only then initialize application.
document.addEventListener('DOMContentLoaded', () => {
  init()
});

// Opens socket and initializes all the socket events and handlers.
const openSocketConnection = (username) =>{
  var socket = io('http://localhost');

  // Change the username to users email.
  socket.emit('change_username', { username });

  // This emits and tells other clients that the user is still active.
  socket.emit('user online', { username });
  setInterval(() => {
    socket.emit('user online', { username });
  }, 8000);

  // Listen to the other online users and update the cached information like socketid and username
  socket.on('user online', function(data){
    if(data.username != username){
      let cachedData = cacheChat.get(data.username);

      if(!cachedData){
        cachedData = { id : data.socketid , messages : [] };
        let userList = document.querySelector('#users');
        const newNode = document.createElement("li");
        newNode.className = 'user';
        newNode.innerHTML = data.username;
        // Add event listener to listen for user changing the chat.
        newNode.addEventListener("click", function(){
          toggleChat(data.username, data.socketid)
        });
        userList.appendChild(newNode);
      }
      // Update user socketid
      cachedData.id = data.socketid;
      cacheChat.set(data.username, cachedData);
    }
  });

  // Updates other clients if user is disconnected
  // Can be used if we store messages in db. Since there are time constraints, commenting out and leaving out this part.
  socket.on('user offline', function(data){
    // cacheChat.delete(data.username);
    // let userList = document.querySelector('#users');
    // for(let user of userList.childNodes){
    //   if(user.innerHTML === data.username){
    //     user.style.display = 'none';
    //   }
    // }
  });

  // Listen to chat messages that other clients are sending us.
  socket.on('chat message', function(data){
    if(currentChat.username != '' && data.username === currentChat.username){
      // Update UI to reflect our message.
      const messageList = document.querySelector('#chat-messages');
      const newNode = document.createElement("li");
      newNode.className = 'from-message';
      newNode.innerHTML = data.message;
      messageList.appendChild(newNode);
    }
    // While sending, the sender and reciever are the same.
    saveMessage(data.message, data.username, data.username);
  });

  // Listen to submit events for when we send message to other clients.
  document.querySelector('#chat-form').addEventListener("submit", async function(e){
    // prevents page reloading
    e.preventDefault();
    const message = document.querySelector('#chat-message-input');
    // Sends chat message along with intended socketid stored in the global storage.
    socket.emit('chat message', { 'to': currentChat.socketid, 'message' : message.value });
    let messageList = document.querySelector('#chat-messages');
    const newNode = document.createElement("li");
    newNode.className = 'to-message';
    newNode.innerHTML = message.value;
    messageList.appendChild(newNode);
    // While sending, the sender and reciever is not the same.
    saveMessage(message.value, username, currentChat.username);
    message.value = '';
    return false;
  });
}

// Helper function which is used to close the user details modal and open chat socket.
const closeModalAndOpenSocket = (username) => {
  const modal = document.querySelector('#myModal');
  modal.style.display = 'none';
  openSocketConnection(username);
}

// Helper function to store the message in the local stores.
// Note: Can store msgs in MongoDB, but due to time constraints, leaving it out.
const saveMessage = (message, sender, reciever) => {
  /*
  *  The sender is the one who is sending the msg
  *  and the reciever is the one for whom the msg is intended for.
  */
  const currentChat  = cacheChat.get(reciever);
  currentChat.messages.push({ message, sender });
  cacheChat.set(reciever, currentChat);
}

// Helper function for when user wants to chat with other clients.
const toggleChat = (username, socketid) => {
  document.querySelector('#chat-container-center').style.display = 'none';
  document.querySelector('#chat-container-right').style.display = 'block';
  if(currentChat.username != username){
    let messageList = document.querySelector('#chat-messages');
    messageList.innerHTML = '';
    currentChat.username = username;
    currentChat.socketid = socketid;
    document.querySelector('#conversation-header').innerHTML = `Conversation with ${username}`;
    restoreMessages(username, messageList);
  }
}

// Helper function to find if there are messages in cache and restore them to UI.
const restoreMessages = (username, messageList) =>{
  if(cacheChat.has(username)){
    const userCache = cacheChat.get(username);
    if(userCache && userCache.messages.length > 0){
      for(let messageItem of userCache.messages){
        const newNode = document.createElement("li");
        newNode.className = (userProfile.email === messageItem.sender ) ? 'to-message' : 'from-message';
        newNode.innerHTML = messageItem.message;
        messageList.appendChild(newNode);
      }
    }
  }
}

// Helper function to call POST Request.
async function postData(url = '', data = {}) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json'},
    body: JSON.stringify(data)
  });
  return await response.json(); // parses JSON response into native JavaScript objects
}