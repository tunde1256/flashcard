const cron = require('node-cron');
const { broadcastInactiveUsers } = require('./controller/admin'); // Adjust the path based on your file structure

// Schedule the job to run every day at midnight (00:00)
cron.schedule('*/30 * * * *', () => {
    console.log('Running scheduled task to broadcast notifications...');
    broadcastInactiveUsers();
});
console.log('Scheduled job setup complete');


