import mysql from 'mysql2/promise';

const connection = mysql.createPool({
	host: '82.26.104.41',
	user: 'godistnk',
	password: 'Tnk@eiei1234',
	database: 'godistnk',
	waitForConnections: true,
	connectionLimit: 10,
	queueLimit: 0
});

export default connection;

