import express from 'express';
import prisma from '../src/prisma.js'; 

const router = express.Router();

// Nutzer-ID aus Header extrahieren
const getUserId = (req) => {
  const userIdHeader = req.headers['x-user-id'];
  if (!userIdHeader) return null;
  return parseInt(userIdHeader, 10);
};

// ✅ GET /api/friends – Bestätigte Freundschaften (für beide Seiten)
router.get('/', async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: 'Not authenticated' });

  try {
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { requesterId: userId, status: 'accepted' },
          { addresseeId: userId, status: 'accepted' },
        ],
      },
      include: {
        requester: true,
        addressee: true,
      },
    });

    const friends = friendships.map(f => {
      const friend = f.requesterId === userId ? f.addressee : f.requester;
      return {
        id: friend.id,
        username: friend.username,
        displayName: friend.displayName,
        avatar: friend.avatar,
        position: friend.position,
        skillLevel: friend.skillLevel,
        isPremium: friend.isPremium,
        lastActive: friend.lastActive,
      };
    });

    res.json(friends);
  } catch (err) {
    console.error('Error fetching friends:', err);
    res.status(500).json({ error: 'Failed to fetch friends' });
  }
});

// 📨 GET /api/friends/requests – Eingehende Anfragen
router.get('/requests', async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: 'Not authenticated' });

  try {
    const requests = await prisma.friendship.findMany({
      where: {
        addresseeId: userId,
        status: 'pending',
      },
      include: { requester: true },
    });

    const result = requests.map(r => ({
      id: r.id,
      userId: r.requester.id,
      username: r.requester.username,
      displayName: r.requester.displayName,
      avatar: r.requester.avatar,
      position: r.requester.position,
      skillLevel: r.requester.skillLevel,
      requestDate: r.createdAt,
    }));

    res.json(result);
  } catch (err) {
    console.error('Error loading incoming requests:', err);
    res.status(500).json({ error: 'Failed to load requests' });
  }
});

// 📤 GET /api/friends/requests/sent – Gesendete Anfragen
router.get('/requests/sent', async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: 'Not authenticated' });

  try {
    const sent = await prisma.friendship.findMany({
      where: {
        requesterId: userId,
        status: 'pending',
      },
      include: { addressee: true },
    });

    const result = sent.map(r => ({
      id: r.id,
      userId: r.addressee.id,
      username: r.addressee.username,
      displayName: r.addressee.displayName,
      avatar: r.addressee.avatar,
      position: r.addressee.position,
      skillLevel: r.addressee.skillLevel,
      requestDate: r.createdAt,
    }));

    res.json(result);
  } catch (err) {
    console.error('Error loading sent requests:', err);
    res.status(500).json({ error: 'Failed to load sent requests' });
  }
});

// ➕ POST /api/friends/requests – Neue Freundschaftsanfrage
router.post('/requests', async (req, res) => {
    const userId = getUserId(req);
    const { addresseeId } = req.body;
  
    if (!userId || !addresseeId) return res.status(400).json({ error: 'Missing user IDs' });
  
    try {
        const existing = await prisma.friendship.findFirst({
            where: {
              OR: [
                {
                  requesterId: userId,
                  addresseeId,
                  status: { in: ['pending', 'accepted'] },
                },
                {
                  requesterId: addresseeId,
                  addresseeId: userId,
                  status: { in: ['pending', 'accepted'] },
                },
              ],
            },
          });
          
  
      if (existing?.status === 'accepted') {
        return res.status(400).json({ error: 'Ihr seid bereits Freunde' });
      }
      if (existing?.status === 'pending') {
        return res.status(400).json({ error: 'Anfrage bereits gestellt' });
      }
  
      const request = await prisma.friendship.create({
        data: {
          requesterId: userId,
          addresseeId,
          status: 'pending',
        },
      });
  
      res.json({ success: true, request });
    } catch (err) {
      console.error('Error sending request:', err);
      res.status(500).json({ error: 'Failed to send friend request' });
    }
  });
  

// ✅ POST /api/friends/requests/:id/accept – Anfrage annehmen
router.post('/requests/:id/accept', async (req, res) => {
  const userId = getUserId(req);
  const requestId = parseInt(req.params.id, 10);

  if (!userId) return res.status(401).json({ error: 'Not authenticated' });

  try {
    const request = await prisma.friendship.findUnique({ where: { id: requestId } });

    if (!request || request.addresseeId !== userId || request.status !== 'pending') {
      return res.status(400).json({ error: 'Invalid request' });
    }

    await prisma.friendship.update({
      where: { id: requestId },
      data: { status: 'accepted' },
    });

    res.json({ success: true });
  } catch (err) {
    console.error('Error accepting request:', err);
    res.status(500).json({ error: 'Failed to accept request' });
  }
});

// ❌ POST /api/friends/requests/:id/decline – Anfrage ablehnen
router.post('/requests/:id/decline', async (req, res) => {
  const userId = getUserId(req);
  const requestId = parseInt(req.params.id, 10);

  if (!userId) return res.status(401).json({ error: 'Not authenticated' });

  try {
    const request = await prisma.friendship.findUnique({ where: { id: requestId } });

    if (!request || request.addresseeId !== userId || request.status !== 'pending') {
      return res.status(400).json({ error: 'Invalid request' });
    }

    await prisma.friendship.delete({ where: { id: requestId } });

    res.json({ success: true });
  } catch (err) {
    console.error('Error declining request:', err);
    res.status(500).json({ error: 'Failed to decline request' });
  }
});

// 🗑️ DELETE /api/friends/requests/sent/:id – Gesendete Anfrage abbrechen
router.delete('/requests/sent/:id', async (req, res) => {
  const userId = getUserId(req);
  const requestId = parseInt(req.params.id, 10);

  if (!userId) return res.status(401).json({ error: 'Not authenticated' });

  try {
    const request = await prisma.friendship.findUnique({ where: { id: requestId } });

    if (!request || request.requesterId !== userId || request.status !== 'pending') {
      return res.status(400).json({ error: 'Invalid request' });
    }

    await prisma.friendship.delete({ where: { id: requestId } });

    res.json({ success: true });
  } catch (err) {
    console.error('Error cancelling request:', err);
    res.status(500).json({ error: 'Failed to cancel request' });
  }
});

// 🧹 DELETE /api/friends/:id – Freundschaft beenden
router.delete('/:id', async (req, res) => {
  const userId = getUserId(req);
  const friendId = parseInt(req.params.id, 10);

  if (!userId) return res.status(401).json({ error: 'Not authenticated' });

  try {
    const friendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { requesterId: userId, addresseeId: friendId },
          { requesterId: friendId, addresseeId: userId },
        ],
        status: 'accepted',
      },
    });

    if (!friendship) return res.status(404).json({ error: 'Friendship not found' });

    await prisma.friendship.delete({ where: { id: friendship.id } });

    res.json({ success: true });
  } catch (err) {
    console.error('Error removing friend:', err);
    res.status(500).json({ error: 'Failed to remove friend' });
  }
});

export default router;
