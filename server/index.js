const express = require('express');
const cors = require('cors');
const os = require('os');


const analyticsRoutes = require('./routes/analytics');

const app = express();

app.use(cors());
app.use(express.json());


app.use('/analytics', analyticsRoutes);


app.get('/', (req, res) => {
  res.send('Analytics Server Running');
});

const PORT = process.env.PORT || 5000;



app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});