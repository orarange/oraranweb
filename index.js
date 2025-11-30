const path = require('path');
const express = require('express');
const app = express();
const fs = require('fs');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const time = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

index = require('./router/index');
tracker = require('./router/tracker');
privacy = require('./router/privacy');
auth = require('./router/auth');

function logRequest(req, res) {
    const logFilePath = path.join(__dirname, 'logs', 'access.log');
    //ipアドレスとuaと日時を取得
    // x-forwarded-for は信頼できるプロキシ経由でのみ使用してください
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const ua = req.headers['user-agent'];

    // ログのフォーマットを整える
    const logData = `${time} - [${ip}] - ${req.method} - ${req.originalUrl} - ${res.statusCode} - ${ua}\n`;
    if (req.originalUrl != "/") {
        fs.appendFile(logFilePath, logData, (err) => {
            if (err) {
                console.error('ログファイルへの書き込みエラー:', err);
                // 必要に応じて、エラー処理を追加 (例: リクエストの中断、代替ログ機構)
            }
        });
    }
}

app.use((req, res, next) => {
    //10分いないにアクセスがあったらログを取らない
    if (req.cookies['last_access']) {
        const lastAccess = new Date(req.cookies['last_access']);
        const now = new Date();
        if (now.getTime() - lastAccess.getTime() < 10 * 60 * 1000) {
            return next();
        }
    }

    //ログを取る
    logRequest(req, res);
    //アクセスした時間を記録
    // Cookieに有効期限を設定 (例: 1日)
    res.cookie('last_access', new Date().toISOString(), { maxAge: 24 * 60 * 60 * 1000 });
    next();
});

app.use('/', index);
app.use('/auth', auth);
app.use('/tracker', tracker);
app.use('/privacy', privacy);
//app.use('/admin', admin) // 必要に応じて有効化

app.use((req, res, next) => {
    res.status(404).send('404 Not Found');
});

app.listen(8080, function () { console.log('Example app listening on port 8080!') });
