const express = require('express');
const passport = require('passport');
const session = require('express-session');
const router = express.Router();
const path = require('path');
const mongoose = require('mongoose');
const UserData = require('../models/userdata');
const {getUserData, createUserData, updateUserData, deleteUserData} = require('./functions/userdata');


router.use(session({
    secret: 'SECRET',
    resave: false,
    saveUninitialized: false
}));

// Passportの初期化とセッションの設定
router.use(passport.initialize());
router.use(passport.session());

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    // ユーザーオブジェクトをデータベースなどから取得する処理
    // idを使ってユーザーを特定し、ユーザーオブジェクトを取得する必要があります
    
    // ユーザーオブジェクトを取得できた場合
    done(null, id);
    
    // ユーザーオブジェクトの取得に失敗した場合
    done(new Error('Failed to deserialize user'));
});



// Google認証のための設定
const GoogleStrategy = require('passport-google-oauth20').Strategy;
passport.use(
    new GoogleStrategy({
        clientID: "350844007784-v8gg3pe57r7q4p8579i1jb9i7beuca3g.apps.googleusercontent.com",
        clientSecret: "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",
        callbackURL: "https://orarange.com/auth/google/callback"
    },
    (accessToken, refreshToken, profile, done) => {
        //return done(null, profile);
        if (profile) {
            return done(null, profile);
        }
        return done(null, new Error('Failed to get user profile.'));
    }
    )
);

// 認証ルートのハンドラー
router.get('/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

// 認証後のコールバック処理
router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    async (req, res) => {
        const userData = getUserData(req.user.emails[0].value);
        console.log(userData);
        if (userData) {
            res.redirect('/');
        } /*else {
            const newUserData = await createUserData(req.user);
            res.redirect('/');
        }*/
    }
);


// ログアウト処理
router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
}
);

module.exports = router;