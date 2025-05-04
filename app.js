const express = require('express');
const dotenv = require('dotenv');
const authRoutes = require('./routers/authRoutes');
dotenv.config();
const scoreRoutes = require('./routers/scoreRoutes');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/api/auth', authRoutes);
app.use('/api/score', scoreRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});