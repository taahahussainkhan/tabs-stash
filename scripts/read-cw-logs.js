const { execSync } = require('child_process');

const env = { ...process.env, PYTHONIOENCODING: 'utf-8', PYTHONUTF8: '1' };

try {
  const streamsJson = execSync('aws logs describe-log-streams --profile personal --region ap-south-1 --log-group-name /aws/lambda/tabvault-api --order-by LastEventTime --descending --max-items 5', { encoding: 'utf8', env });
  const streams = JSON.parse(streamsJson);
  console.log('Found log streams:', streams.logStreams.length);
  for (const stream of streams.logStreams) {
    console.log('\n======================================================');
    console.log('Stream:', stream.logStreamName, 'Last event:', new Date(stream.lastEventTimestamp).toISOString());
    console.log('======================================================');
    try {
      const cmd = `aws logs get-log-events --profile personal --region ap-south-1 --log-group-name /aws/lambda/tabvault-api --log-stream-name "${stream.logStreamName}" --limit 50`;
      const eventsJson = execSync(cmd, { encoding: 'utf8', env });
      const events = JSON.parse(eventsJson);
      for (const ev of events.events) {
        console.log(`[${new Date(ev.timestamp).toISOString()}] ${ev.message.trim()}`);
      }
    } catch (e) {
      console.error('Error on stream:', e.message);
    }
  }
} catch (err) {
  console.error('Error fetching logs:', err.message);
}
