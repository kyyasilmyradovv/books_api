require('dotenv').config({ path: './config/config.env' });
const { sequelize } = require('./models');

const app = require('./app');
const http = require('http').createServer(app);

http.listen(process.env.PORT, async () => {
  await sequelize.authenticate();
  console.log(
    `Connected to DB and listening on port  ${process.env.PORT} - ${process.env.NODE_ENV}...`
  );
});

process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  http.close(() => {
    process.exit(1);
  });
});
