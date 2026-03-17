const mongoose = require('mongoose');
const User = require('./models/User');

const MONGO_URI = 'mongodb+srv://Subha_8438:h9NDgh9EKxk5Fg3u@cluster1.yre5wfn.mongodb.net/opsmind_enterprise?retryWrites=true&w=majority&appName=Cluster1';

async function test() {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');
    const users = await User.find().select('+password');
    console.log('Users:', users.map(u => ({ email: u.email, password: u.password })));
    mongoose.disconnect();
}

test().catch(console.error);
