# Walkerone

Virtual healthcare companion app for F29SO coursework assignment.

itll  be very good truss

## Installation
**Fork** & **Clone** the repository to a directory of your choice.

### Frontend
1. Navigate to the Frontend folder.
2. Create a file called .env & open in a text editor.
3. Add the line `VITE_MAPBOX_TOKEN=<TOKEN>`, inserting your own Mapbox token. If you do not have a token then signup at https://account.mapbox.com & follow the steps to get an access token.
4. Open a terminal in the directory then run the following commands:
```bash
npm install
```
If npm says there are packages that need auditing:
```bash
npm audit fix
```

### Backend
1. Navigate to the Backend folder.
2. Create a file called .env & open in a text editor.
3. Add the lines below with the <> filled from your MongoDB details:
```
PORT = 8000
URI = mongodb+srv://<USERNAME>:<DB_PASSWORD>@<CLUSTER_NAME>.<STRING_OF_LETTERS_&_NUMBERS>.mongodb.net/?appName=<CLUSTER_NAME>
```
If you don't have MongoDB setup then go to https://cloud.mongodb.com. \
4. Open a terminal in the directory then run the following commands:
```bash
npm install
```
If npm says there are packages that need auditing:
```bash
npm audit fix
```

## Running Walkerone
Run `runDev.bat` which automates the following or do it manually:

### Frontend
Run locally on this machine:
```bash
cd Frontend
npm run dev
```

or also on your local network:
```bash
cd Frontend
npm run dev -- --host
```

Then you should get an output like:

```bash
> package@0.0.0 dev
> vite --host


  VITE v7.3.1  ready in x ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://<YOUR_NETWORK_IP>:5173/
  ➜  press h + enter to show help
...
```

Either of the URLs will work (they're clickable), and you should be able to use the local network URL on another device like a phone as long as it's on the same network.\
Notes:
* Make sure you have the `.env` file, otherwise the map will not function properly.
* To test most features you will also need the backend running.

### Backend
Run locally on this machine:
```bash
cd Backend
node server.js
```

Then you should get an output like:
```bash
connected to server
Server started on 8000
...
```

Note:
* Make sure you have the `.env` file, otherwise the backend will be unable to connect to the MongoDB database.

## Maintenance
Periodically run `npm install` and `npm audit fix` in both the Frontend & Backend folders to ensure the packages are kept secure and up to date.