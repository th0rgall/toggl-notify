**toggl-notify** is a Chrome extension for [Toggl](https://toggl.com/) users. 

It allows you to set a **time limit** to a running timer and it will **notify** you when that limit has been exceeded.

## How it works

toggl-notify extends the Toggl web app to include a *Notify me after* input:

![](https://i.imgur.com/w8SG8EL.png)

After one hour of hard web programming work, you will get a simple notification that urges you to stop:

![](https://i.imgur.com/Eqhq3CK.png)



## How to install

1. Go to the [releases page](https://github.com/th0rgall/toggl-notify/releases) and download the latest .crx package.
2. In Chrome, go to [chrome://extensions/](chrome://extensions/) and drag & drop the downloaded .crx in there.
3. A popup should now appear that allows you to install the extension.

## How it was made

This is a fairly simple Chrome extension, everything runs client-side.

It uses jQuery in a Chrome content script to communicate with the DOM of the Toggl web app. 

Next to that, I used this as an excuse to step up my [reactive programming](http://reactivex.io/) game; there are two main event streams being created:

1. A stream of ticks of the currently active Toggl timer (per second)


2. A stream of input changes (the "notify me after" field)

These are then combined using rxjs magic and will ask the background script to send notifications when necessary.

## How to hack it

To get developing, just clone the repo and run `npm install` in your command line. Then run `npm start` to start the live browserify transpiling. 

Now follow the install instructions [here](https://developer.chrome.com/extensions/getstarted#unpacked) to try a development version of the extension in Chrome.

I use the [Github Issues](https://github.com/th0rgall/toggl-notify/issues) section as a todo list. Feel free to pick in on there & send me pull requests!
