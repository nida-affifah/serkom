const pool = require('../src/config/database');
const { hashPassword, isHashed } = require('../src/utils/hash');

async function hashAllPasswords() {
    try {
        const [users] = await pool.query('SELECT id, username, password FROM users');
        let updated = 0;

        for (const user of users) {
            if (!isHashed(user.password)) {
                const hash = await hashPassword(user.password);
                await pool.query('UPDATE users SET password = ? WHERE id = ?', [hash, user.id]);
                console.log(`User ${user.username}: password di-hash`);
                updated++;
            } else {
                console.log(`User ${user.username}: sudah hash, skip`);
            }
        }

        console.log(`\nSelesai. ${updated} user diupdate.`);
        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
}

hashAllPasswords();