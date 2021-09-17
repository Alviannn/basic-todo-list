import express from 'express';
import mysql from 'mysql2/promise';
import { DateTime } from 'luxon';

const app = express();
const port = process.env.PORT || 3000;
let connection: mysql.Connection;

app.set('view engine', 'ejs');
app.use(express.static('views'));
app.use(express.urlencoded({ extended: true }));

app.get('/', async (req, res) => {
    const [ results ] = await connection.query('SELECT * FROM todos;');

    const items = (results as any[]).map((tmp) => {
        tmp.created_at = DateTime.fromJSDate(tmp.created_at as Date).toFormat('dd MMM yyyy - HH:mm:ss');
        return tmp;
    });
    return res.render('index.ejs', { items });
});

app.get('/insert', async (req, res) => res.render('insert.ejs'));

app.post('/create-todo', async (req, res) => {
    const { todo } = req.body;

    await connection.execute('INSERT INTO todos (content) VALUES (?);', [ todo ]);
    res.redirect('/');
});

app.post('/delete-todo', async (req, res) => {
    const { id } = req.body;
    await connection.execute('DELETE FROM todos WHERE id = ?;', [ id ]);
    res.send('Successfully deleted key!');
});

app.listen(port, async () => {
    connection = await mysql.createConnection({
        host: 'localhost',
        port: 3306,
        database: 'todos-app',
        user: 'root',
        password: ''
    });

    connection.execute(
        `CREATE TABLE IF NOT EXISTS todos (
            id INT AUTO_INCREMENT,
            content VARCHAR(128) NOT NULL,
            created_at DATE NOT NULL DEFAULT NOW(),
            updated_at DATE NOT NULL DEFAULT NOW(),

            PRIMARY KEY (id)
        );`);

    console.log(`Server running at http://localhost:${port}`);
});