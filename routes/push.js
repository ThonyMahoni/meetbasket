// routes/push.js
import webpush from 'web-push';

const VAPID_PUBLIC_KEY = 'BDvgrOdRZhTRkJoJ0OFHbCTiedN4ltKHHoiywON399mge80E7NrYbYD8982jfDzVWmi9Ah2JQ7VE9IoDHEbWEh8';
const VAPID_PRIVATE_KEY = 'A2dFK0lC06kSDEsnrBPOuBti43av9tfVjxR9qAij2oE';

webpush.setVapidDetails(
  'mailto:info@meetbasket.com',
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

const subscriptions = [];

router.post('/subscribe', (req, res) => {
  const subscription = req.body;
  subscriptions.push(subscription);
  res.status(201).json({ message: 'Abo gespeichert' });
});

// Manuell Notification verschicken (z. B. bei Event-Start):
router.post('/send-push', async (req, res) => {
  const payload = JSON.stringify({
    title: '📣 Neues Event gestartet!',
    body: 'Ein Spiel hat begonnen. Jetzt teilnehmen!',
  });

  for (const sub of subscriptions) {
    await webpush.sendNotification(sub, payload).catch(console.error);
  }

  res.json({ message: 'Benachrichtigungen gesendet' });
});
