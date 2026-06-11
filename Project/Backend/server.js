const dotenv = require('dotenv');

dotenv.config();

const app = require('./src/app');
const { initializeDatabase } = require('./src/4_models/db');

const port = Number(process.env.PORT || 3000);

initializeDatabase();

app.listen(port, () => {
  console.log(`Backend API running on port ${port}`);
});
