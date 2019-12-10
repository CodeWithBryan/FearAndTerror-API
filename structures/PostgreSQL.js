const Sequelize = require('sequelize');
const winston = require('winston');
const fs = require('fs');

const config = JSON.parse(fs.readFileSync('config.json'));
const database = new Sequelize(config.database, {
	logging: false,
  dialectOptions: {
    ssl: true
	},
	pool: {
    max: 40,
    min: 0,
    idle: 10000
  }
});

class Database {
	static get db() {
		return database;
  }

	static start() {
		database.authenticate()
			.then(() => winston.info('[POSTGRES]: Connection to database has been established successfully.'))
			.then(() => winston.info('[POSTGRES]: Synchronizing database...'))
			.then(() => database.sync()
				.then(() => winston.info('[POSTGRES]: Done Synchronizing database!'))
				.catch(error => winston.error(`[POSTGRES]: Error synchronizing the database: \n${error}`))
			)
			.catch(error => {
				winston.error(`[POSTGRES]: Unable to connect to the database: \n${error}`);
				winston.error(`[POSTGRES]: Try reconnecting in 5 seconds...`);
				setTimeout(() => Database.start(), 5000);
			});
	}
}

module.exports = {
  Database,
}