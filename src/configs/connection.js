const env = require('./env');
const Sequelize = require('sequelize');
const sequelize = new Sequelize(env.db_name, env.db_username, env.db_password, {
    host: env.db_host,
    dialect: env.db_dialect,
    port: 3306,
    // port: 25060,

    // native: true,
    define: {
        charset: 'utf8',
        collate: 'utf8_general_ci',
        timestamps: true
    },
    pool: {
        max: 5,
        min: 1,
        idle: 10000
    },
    logging: false
});

// const sequelize = new Sequelize("defaultdb", "lavilla", "kubm2vrwzythrt5h", {
//     host: "db-mysql-nyc1-15241-do-user-7631118-0.a.db.ondigitalocean.com",
//     dialect: env.db_dialect,
//     port: 25060,
//     // port: 25060,

//     // native: true,
//     define: {
//         charset: 'utf8',
//         collate: 'utf8_general_ci',
//         timestamps: true
//     },
//     pool: {
//         max: 5,
//         min: 1,
//         idle: 10000
//     }
// });
module.exports = sequelize;