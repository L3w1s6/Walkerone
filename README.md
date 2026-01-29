# Walkerone

Virtual healthcare companion app for F29SO coursework assignment.

itll  be very good truss

## Installing

### Install Frontend

```bash
cd Frontend
npm install
```

### Install Backend

```bash
cd Backend
npm install
```

## Running

### Frontend
Locally on this machine:
```bash
cd Frontend
npm run dev
```
or also on local network:
```bash
cd Frontend
npm run dev -- --host
```

Then you should get something like:

```bash
> package@0.0.0 dev
> vite --host


  VITE v7.3.1  ready in x ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://<your-network-ip>:5173/
  ➜  press h + enter to show help
```

Either of the links should work, and you should be able to use the network one on your phone as long as it's on the same wifi
`*` Make sure you have the `.env` file, if not just check the resources channel on discord for what should be in it  
`*` To test some features you might also need the backend running

### Backend

```bash
cd Backend
node server.js
```

Then you should get something like:

```bash
connected to server
Server started on 8000
```

`*` Make sure you have the `.env` file, if not just check the resources channel on discord for what should be in it
