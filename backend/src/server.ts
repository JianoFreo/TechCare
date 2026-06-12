import express from 'express';
import { ENV } from './config/env.js';
import adminRoutes from './routes/admin.route.js';

const app = express();

app.use(express.json());


app.use('/api/admin', adminRoutes);
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the TechCare API!' });
});

app.listen(ENV.PORT, () => {
  console.log(`Server is running on http://localhost:${ENV.PORT}`);
});
