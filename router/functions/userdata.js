const mongoose = require('mongoose');
const UserData = require('../../models/userdata');

async function main() {
    
    await mongoose.connect("mongodb+srv://orange:r4eu1M8rFJ5YSw3b@oraran.mbuu3n8.mongodb.net/?retryWrites=true&w=majority&appName=oraran");
    console.log('DB connected');
}

main().catch(err => console.log(err));

function getUserData(email) {
    UserData.findOne({email: email}).then((data) => {
        if (data == null) {
            console.log("data is null");
            return null;
        }else{
            console.log(data.username);
            return data.username;
        }
    }).catch((error) => {
        return console.log(error);
    });
    
}

function createUserData(profile) {

    const _userData = new UserData({
        email: profile.emails[0].value,
        username: profile.displayName
    });

    return _userData.save();
}

function updateUserData(email, username) {

}

function deleteUserData(email) {
    UserData.removeAllListeners().then(() => {
        console.log('deleted');
    }
    ).catch((error) => {
        console.log(error);
    }
    );

}


module.exports = {getUserData, createUserData, updateUserData, deleteUserData};


