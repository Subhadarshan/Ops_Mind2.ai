const mongoose = require('mongoose');
const User = require('./models/User');

const MONGO_URI = 'mongodb+srv://Subha_8438:h9NDgh9EKxk5Fg3u@cluster1.yre5wfn.mongodb.net/opsmind_enterprise?retryWrites=true&w=majority&appName=Cluster1';

async function test() {
    await mongoose.connect(MONGO_URI);
    const fetchedUser = await User.findOne({ email: 'subha12@gmail.com' }).select('+password');
    if (!fetchedUser) {
        console.log('User not found');
    } else {
        const passwords = ['......', '123456', 'password', 'subha12', 'subha123'];
        for (const p of passwords) {
            const isMatch = await fetchedUser.comparePassword(p);
            console.log(`${p} isMatch?`, isMatch);
        }
    }
    mongoose.disconnect();
}
test().catch(console.error);
