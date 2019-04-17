**This project is deprecated**. It might still work but has known problems that I won't work on *for now*. 

This was one of my first attempts in 2017 to modify a website with dynamically generated elements. I've done [some more](https://github.com/th0rgall/voc-enhancer) of that and learned how to it properly. This one needs to be redesigned.

-----

**toggl-notify** is a Chrome extension for [Toggl](https://toggl.com/) users. 

It allows you to set a **time limit** to a running timer and it will **notify** you when that limit has been exceeded.

## How it works

toggl-notify extends the Toggl web app to include a *Notify me after* input:

![](https://i.imgur.com/w8SG8EL.png)

After one hour of hard web programming work, you will get a simple notification that urges you to stop:

![](https://i.imgur.com/Eqhq3CK.png)

## Installation

1. Go to the [releases page](https://github.com/th0rgall/toggl-notify/releases) and download the latest .crx package.
2. In Chrome, go to [chrome://extensions/](chrome://extensions/) and drag & drop the downloaded .crx in there.
3. A popup should now appear that allows you to install the extension.

## Behind the scenes

This is a fairly simple Chrome extension, everything runs client-side. The Toggl API is not used.

- jQuery is used in a Chrome content script to interact with the DOM of the Toggl web app.
- A background script holds the state of the timer and lasts through the browser session.
- The two communicate to start new timers and get the current timer state.

## How to hack it

To get developing, just clone the repo and run `npm install` in your command line. Then run `npm start` to start the live browserify transpiling. 

Now follow the install instructions [here](https://developer.chrome.com/extensions/getstarted#unpacked) to try a development version of the extension in Chrome.

I use the [Github Issues](https://github.com/th0rgall/toggl-notify/issues) section as a todo list. Feel free to pick in on there & send me pull requests!
