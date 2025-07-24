import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/messages/conversations?userId=123
router.get('/conversations', async (req, res) => {
  const userId = parseInt(req.query.userId);
  if (!userId) return res.status(400).json({ error: 'userId fehlt in der Query' });

  try {
    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: { id: userId }
        }
      },
      include: {
        participants: true,
        messages: {
          orderBy: { timestamp: 'asc' }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    // optional: letzte Nachricht extrahieren
    const enriched = conversations.map(conv => ({
      ...conv,
      participantIds: conv.participants.map(p => p.id),
      lastMessage: conv.messages.length > 0 ? conv.messages[conv.messages.length - 1] : null
    }));

    res.json(enriched);
  } catch (error) {
    console.error('❌ Fehler beim Laden der Konversationen:', error);
    res.status(500).json({ error: 'Fehler beim Abrufen der Konversationen' });
  }
});


// POST /api/messages/start – neue Konversation manuell starten
router.post('/start', async (req, res) => {
  const { senderId, receiverId } = req.body;

  if (!senderId || !receiverId) {
    return res.status(400).json({ error: 'senderId oder receiverId fehlt' });
  }

  try {
    let conversation = await prisma.conversation.findFirst({
      where: {
        AND: [
          { participants: { some: { id: senderId } } },
          { participants: { some: { id: receiverId } } }
        ]
      },
      include: {
        participants: true,
        messages: {
          orderBy: { timestamp: 'asc' }
        }
      }
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          participants: {
            connect: [{ id: senderId }, { id: receiverId }]
          }
        },
        include: {
          participants: true,
          messages: true
        }
      });
    }

    res.status(200).json({
      ...conversation,
      participantIds: conversation.participants.map(p => p.id),
      lastMessage: conversation.messages.length > 0 ? conversation.messages[conversation.messages.length - 1] : null
    });
  } catch (error) {
    console.error('❌ Fehler beim Starten der Konversation:', error);
    res.status(500).json({ error: 'Konversation konnte nicht gestartet werden' });
  }
});


// GET /api/messages/:id – Einzelne Konversation (z. B. Refresh)
router.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    const conversationId = parseInt(req.params.id); // oder req.query.id – je nachdem wie du es übergibst

if (!conversationId) {
  return res.status(400).json({ error: 'Conversation ID fehlt oder ist ungültig.' });
}

const conversation = await prisma.conversation.findUnique({
  where: { id: conversationId },
  include: {
    participants: true,
    messages: {
      orderBy: { timestamp: 'asc' },
    },
  },
});


    if (!conversation) return res.status(404).json({ error: 'Konversation nicht gefunden' });

    res.json({
      ...conversation,
      participantIds: conversation.participants.map(p => p.id),
      lastMessage: conversation.messages.length > 0 ? conversation.messages[conversation.messages.length - 1] : null
    });
  } catch (error) {
    console.error('❌ Fehler beim Laden der Konversation:', error);
    res.status(500).json({ error: 'Fehler beim Abrufen der Konversation' });
  }
});


// POST /api/messages/send – Neue Nachricht speichern
router.post('/send', async (req, res) => {
  const { conversationId, senderId, text } = req.body;

  if (!conversationId || !senderId || !text) {
    return res.status(400).json({ error: 'Pflichtfelder fehlen' });
  }

  try {
    const newMessage = await prisma.message.create({
      data: {
        text,
        sender: { connect: { id: senderId } },
        conversation: { connect: { id: conversationId } },
        timestamp: new Date()
      }
    });

    // Konversation aktualisieren (updatedAt)
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() }
    });

    res.status(201).json(newMessage);
  } catch (error) {
    console.error('❌ Fehler beim Senden der Nachricht:', error);
    res.status(500).json({ error: 'Nachricht konnte nicht gesendet werden' });
  }
});

router.post('/start', async (req, res) => {
    let { senderId, receiverId } = req.body;
  
    // Umwandeln in Integer, falls String
    senderId = parseInt(senderId);
    receiverId = parseInt(receiverId);
  
    if (!senderId || !receiverId || isNaN(senderId) || isNaN(receiverId)) {
      return res.status(400).json({ error: 'senderId oder receiverId fehlt oder ist ungültig' });
    }
  
    try {
      let conversation = await prisma.conversation.findFirst({
        where: {
          AND: [
            { participants: { some: { id: senderId } } },
            { participants: { some: { id: receiverId } } }
          ]
        },
        include: {
          participants: true,
          messages: {
            orderBy: { timestamp: 'asc' }
          }
        }
      });
  
      if (!conversation) {
        conversation = await prisma.conversation.create({
          data: {
            participants: {
              connect: [{ id: senderId }, { id: receiverId }]
            }
          },
          include: {
            participants: true,
            messages: true
          }
        });
      }
  
      res.status(200).json({
        ...conversation,
        participantIds: conversation.participants.map(p => p.id),
        lastMessage: conversation.messages.length > 0 ? conversation.messages[conversation.messages.length - 1] : null
      });
    } catch (error) {
      console.error('❌ Fehler beim Starten der Konversation:', error);
      res.status(500).json({ error: 'Konversation konnte nicht gestartet werden' });
    }
  });
  

  // DELETE /api/messages/:id?userId=123
router.delete('/:id', async (req, res) => {
    const conversationId = parseInt(req.params.id);
    const userId = parseInt(req.query.userId);
  
    if (!conversationId || !userId) {
      return res.status(400).json({ error: 'conversationId oder userId fehlt' });
    }
  
    try {
      // Beispiel: Lösche Konversation komplett (oder nur den Nutzer als Teilnehmer entfernen)
      // Hier kompletter Löschvorgang:
      await prisma.conversation.delete({
        where: { id: conversationId },
      });
  
      // Falls du nur den Nutzer aus Teilnehmern entfernen willst:
      /*
      await prisma.conversation.update({
        where: { id: conversationId },
        data: {
          participants: { disconnect: { id: userId } }
        }
      });
      */
  
      res.status(200).json({ message: 'Konversation gelöscht' });
    } catch (error) {
      console.error('❌ Fehler beim Löschen der Konversation:', error);
      res.status(500).json({ error: 'Konversation konnte nicht gelöscht werden' });
    }
  });
  
  router.get('/unread-count', async (req, res) => {
  const userId = parseInt(req.query.userId); // ⬅️ statt headers

  if (!userId) return res.status(400).json({ error: 'User ID fehlt' });

  try {
    const count = await prisma.message.count({
      where: {
        conversation: {
          participants: {
            some: { id: userId },
          },
        },
        senderId: { not: userId },
        readBy: {
          none: { id: userId },
        },
      },
    });

    res.json({ count });
  } catch (err) {
    console.error('Fehler beim Laden der ungelesenen Nachrichten:', err);
    res.status(500).json({ error: 'Serverfehler' });
  }
});

  
  

  

export default router;
