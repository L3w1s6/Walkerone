const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;


app.use(express.json());

// Basic route when we use APIs
// app.get('/', (req, res) => {
  // res.json({ message: 'Backend API is running!' });
// });

app.get('/', (req, res) => {
  res.send('Hello');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
