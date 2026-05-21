import app from './app.js';
import config from './config/index.js';

app.listen(Number(config.port), () => {
  console.log(`Server running on port ${config.port}`);
});
