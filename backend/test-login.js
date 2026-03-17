const mongoose = require('mongoose');
const User = require('./models/User');

const MONGO_URI = 'mongodb+srv://Subha_8438:h9NDgh9EKxk5Fg3u@cluster1.yre5wfn.mongodb.net/opsmind_enterprise?retryWrites=true&w=majority&appName=Cluster1';

async function test() {
    await mongoose.connect(MONGO_URI);

    // Test creating a user and comparing directly
    const candidatePassword = 'password123';

    const user = new User({
        name: 'Test Compare',
        email: 'testcompare@example.com',
        password: candidatePassword
    });

    console.log('Before save:', user.password);
    await user.save();
    console.log('After save (hash):', user.password);

    // Now let's fetch from DB
    const fetchedUser = await User.findOne({ email: 'testcompare@example.com' }).select('+password');
    console.log('Fetched hash:', fetchedUser.password);

    const isMatch = await fetchedUser.comparePassword(candidatePassword);
    console.log('Does it match?', isMatch);

    await User.deleteOne({ email: 'testcompare@example.com' });
    mongoose.disconnect();
}

test().catch(console.error);
