# Chatroom

## Introduction
The goal of this program is to create a chatroom from one browser tab to another, using the RTCDataChannel of the WebRTC HTML5 API. Once a user connected to our chatroom, he/she can consult the online user list, broadcast his/her message, and send a message to a specific user, when a new user comes in or a connected user gets out, everybody in the room will receive a notification. This program will also periodically detect the internet connection, to avoid a member uses a broken peer. The program contains following parts.
- **/app/web_chatroom.html**: interface of chatroom
- **/app/initialisation.js**: initialize RTCSessionDescription, RTCPeerConnection, RTCIceCandidate and signaling server
- **/app/caller.js**, **/app/callee.js**: the most important logical part, actually each user has two identities, caller and callee, it has different behaviors for these two identities. When a user A logged in, it will call all the users who have been already online, now it behaves as a caller. When a newcomer B comes after user A, A will be called to connect with B, then in this situation, A behaves as a callee. Unlike caller and callee before, here caller.js and callee.js used only by one person.
- **channelControl.js**: clean up the useless channels, recover the broken channels.



## Prerequisites
Mozilla Firefox 42 or Google Chrome 46 or later

## Attention
Because we did not implement a process of registration, so we can not avoid the risk of duplicated name. Please enter different names to test.

## How to use
- First run `npm install` to install dependencies. Then run `npm start` (it starts the signaling server on port 8090 and starts a web server on the root of this repository on port 8089).
- Open `/app/webrtc_chatroom.html` in your browser(make sure the files in your `localhost/` path), in the head of this page, enter a unique name 'xxx', click `ConnecToRoom`, if you have successfully logged in, you will see `WELCOME: xxx` in the page.
- Click the button `GetOnLineList` to see all online users.
- Write a message in the text area on the line of the button 'broadcast', click `broadcast`, the message will be sent to everyone in the room.
- Fill a user name 'xxx' after `To`, and write a message in the text area on the line of the button 'send', click `send`, the message will be sent to 'xxx'.
- Every time a member comes in or gets out, everyone in the room will receive a notification.

## Unit tests

The unit tests can be found in the `test/` directory.
- **signalingServerTest.js**: extended from origin test, add more tests on new functions.
- **channelControlTest.js**: test all the cases of channelControl.js

#### run tests

    npm test
