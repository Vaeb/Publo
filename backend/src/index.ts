import { listen } from './server';
import './webhooks';

// const resetDatabase = false;

process.on('unhandledRejection', (reason, p) => {
    console.log('Unhandled Promise Rejection at:', p);
    console.log('Reason:', reason);
});

await listen();
