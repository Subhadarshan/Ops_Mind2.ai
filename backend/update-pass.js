const mongoose = require('mongoose');
const User = require('./models/User');

const MONGO_URI = 'mongodb+srv://Subha_8438:h9NDgh9EKxk5Fg3u@cluster1.yre5wfn.mongodb.net/opsmind_enterprise?retryWrites=true&w=majority&appName=Cluster1';

async function updatePassword() {
    await mongoose.connect(MONGO_URI);

    // Find the user
    const user = await User.findOne({ email: 'subha12@gmail.com' });
    if (!user) {
        console.log("User subha12@gmail.com not found!");
    } else {
        // Set new password
        user.password = '123456';
        await user.save();
        console.log("Successfully reset password to '123456'");
    }

    mongoose.disconnect();
}

updatePassword().catch(console.error);
