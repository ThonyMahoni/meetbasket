import { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from '../config';
import { useSwipeable } from 'react-swipeable';

const MessagesPage = () => {
  const { user: currentUser } = useAuth();
  const { conversationId } = useParams();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messageEndRef = useRef(null);

  const swipeHandlers = useSwipeable({
  onSwipedRight: () => {
    console.log('👉 Swipe erkannt');
    if (activeConversation) {
      setActiveConversation(null);
    }
  },
  preventDefaultTouchmoveEvent: true,
  trackTouch: true,
});


  // Neue Konversation starten, wenn receiverId über URL kommt
  useEffect(() => {
    const startNewConversation = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/messages/start`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            senderId: Number(currentUser.id),
            receiverId: Number(conversationId),
          }),
        });
    
        if (!res.ok) throw new Error('Fehler beim Erstellen der Konversation');
        const conversation = await res.json();
    
        setConversations((prev) => {
          const exists = prev.find(c => c.id === conversation.id);
          if (exists) {
            setActiveConversation(exists);
            return prev;
          } else {
            setActiveConversation(conversation);
            return [...prev, conversation];
          }
        });
      } catch (error) {
        console.error('❌ Neue Konversation konnte nicht gestartet werden:', error);
      }
    };
    
  
    if (conversationId && currentUser && !isNaN(parseInt(conversationId))) {
      startNewConversation();
    }
  }, [conversationId, currentUser]);
  

  // Teilnehmerdaten anreichern
  const fetchUserById = async (userId) => {
    const res = await fetch(`${API_BASE_URL}/api/users/${userId}`);
    return await res.json();
  };

  useEffect(() => {
    const enrichParticipants = async () => {
      const enriched = await Promise.all(
        conversations.map(async (conv) => {
          const participants = await Promise.all(
            conv.participantIds.map((id) => fetchUserById(id))
          );
          return { ...conv, participants };
        })
      );
      setConversations(enriched);
    };

    if (conversations.length > 0 && conversations[0].participants === undefined) {
      enrichParticipants();
    }
  }, [conversations]);

  // Regelmäßiger Refresh der aktiven Konversation
  useEffect(() => {
    const interval = setInterval(() => {
      if (activeConversation) {
        fetchConversationById(activeConversation.id);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [activeConversation]);

  const fetchConversationById = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/messages/${id}`);
      const updated = await res.json();
      setActiveConversation(updated);
    } catch (err) {
      console.error('❌ Fehler beim Aktualisieren der Konversation:', err);
    }
  };

  // Scroll automatisch ans Ende
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages]);

  // Konversationen laden
  useEffect(() => {
    if (!currentUser) {
      navigate('/nachrichten');
      return;
    }

    const fetchConversations = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/messages/conversations?userId=${currentUser.id}`);
        if (!res.ok) throw new Error('Fehler beim Laden der Konversationen');
        const data = await res.json();
        setConversations(data);

        if (conversationId) {
          const found = data.find((c) => c.id === parseInt(conversationId));
          setActiveConversation(found || null);
        } else if (data.length > 0) {
          setActiveConversation(data[0]);
        }
      } catch (err) {
        console.error('Fehler beim Laden der Nachrichten:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [conversationId, currentUser]);

  // Nachricht senden
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !activeConversation) return;

    const payload = {
      conversationId: activeConversation.id,
      senderId: currentUser.id,
      text: message,
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/messages/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Fehler beim Senden der Nachricht');

      const newMessage = await res.json();

      const updated = {
        ...activeConversation,
        messages: [...(activeConversation.messages || []), newMessage],
        lastMessage: newMessage,
      };

      setConversations((prev) =>
        prev.map((c) => (c.id === updated.id ? updated : c))
      );

      setActiveConversation(updated);
      setMessage('');
    } catch (err) {
      console.error('❌ Nachricht konnte nicht gesendet werden:', err);
    }
  };

  const getOtherParticipant = (conversation) =>
    conversation.participants.find((p) => p.id !== currentUser?.id) || {};

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();

    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }

    const oneWeekAgo = new Date(now);
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    if (date > oneWeekAgo) {
      return date.toLocaleDateString([], { weekday: 'short' });
    }

    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const getUnreadCount = (conversation) =>
    conversation.messages?.filter(
      (msg) => msg.senderId !== currentUser?.id && !msg.read
    ).length || 0;

    if (!currentUser) return <div className="p-8">⚠ Kein Nutzer geladen</div>;


  return (
    <div className="h-[calc(100vh-10rem)] flex flex-col">
      <h1 className="text-3xl font-bold mb-6">Nachrichten</h1>

      <div className="flex flex-grow border rounded-lg shadow-sm overflow-hidden">
        {/* Conversations List */}
        <div className="w-full sm:w-1/3 lg:w-1/4 bg-white border-r">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">Konversationen</h2>
          </div>

          {loading ? (
            <div className="flex justify-center p-8">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-gray-500">Keine Konversation gefunden</p>
              <Link
                to="/community"
                className="mt-4 inline-block text-blue-600 hover:underline"
              >
                Finde einen Spieler und starte eine Konversation
              </Link>
            </div>
          ) : (
            <div className="overflow-y-auto h-full pb-20">
            {conversations.map((conversation) => {
  const other = getOtherParticipant(conversation);
  const unread = getUnreadCount(conversation);

  const handleDelete = async (e) => {
    e.stopPropagation(); // Verhindert, dass beim Klick auch die Konversation aktiviert wird
    if (!window.confirm(`Konversation wirklich löschen?`)) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/messages/${conversation.id}?userId=${currentUser.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Fehler beim Löschen der Konversation');

      setConversations((prev) => prev.filter(c => c.id !== conversation.id));

      if (activeConversation?.id === conversation.id) {
        setActiveConversation(null);
      }
    } catch (error) {
      console.error('❌ Löschen der Konversation fehlgeschlagen:', error);
      alert('Konversation konnte nicht gelöscht werden.');
    }
  };

  return (
    <div
      key={conversation.id}
      className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
        activeConversation?.id === conversation.id ? 'bg-blue-50' : ''
      }`}
      onClick={() => setActiveConversation(conversation)}
    >
      <div className="flex items-center space-x-3">
        <img
          src={other.avatar}
          alt={other.displayName}
          className="h-12 w-12 rounded-full"
        />
        <div className="flex-grow min-w-0">
          <div className="flex justify-between items-baseline">
            <div>
              <h3 className="font-medium truncate">{other.displayName}</h3>
              <p className="text-xs text-gray-400 truncate">@{other.username}</p>
            </div>
            <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
              {conversation.lastMessage?.timestamp
                ? formatTime(conversation.lastMessage.timestamp)
                : ''}
            </span>
          </div>
          <p className="text-sm text-gray-600 truncate">
            {conversation.lastMessage?.text || 'No messages yet'}
          </p>
        </div>
        {unread > 0 && (
          <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-xs text-white">{unread}</span>
          </div>
        )}

        {/* Löschbutton */}
        <button
          onClick={handleDelete}
          className="ml-2 text-red-500 hover:text-red-700"
          title="Konversation löschen"
          aria-label="Konversation löschen"
        >
          🗑️
        </button>
      </div>
    </div>
  );
})}


            </div>
          )}
        </div>

           {/* Chat Window */}
           {activeConversation ? (
  <div
    className="flex flex-col w-full sm:w-2/3 lg:w-3/4 bg-gray-50"
    {...swipeHandlers}
  >
    <div className="p-4 border-b bg-white flex items-center">
      <button
        onClick={() => setActiveConversation(null)}
        className="mr-4 p-2 text-blue-600 hover:text-blue-800 focus:outline-none sm:hidden"
      >
        ← Zurück
      </button>
  <img
    src={getOtherParticipant(activeConversation).avatar}
    alt={getOtherParticipant(activeConversation).displayName}
    className="h-10 w-10 rounded-full mr-3"
  />
  <div>
    <h3 className="font-semibold">
      {getOtherParticipant(activeConversation).displayName}
    </h3>
    <p className="text-xs text-gray-500">
      @{getOtherParticipant(activeConversation).username}
    </p>
  </div>
</div>

            <div className="flex-grow overflow-y-auto p-4 space-y-4">
              {activeConversation.messages.map((msg) => {
                const isMine = msg.senderId === currentUser.id;
                const sender = activeConversation.participants.find(
                  (p) => p.id === msg.senderId
                );
                return (
                  <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className="flex max-w-xs md:max-w-md">
                      {!isMine && (
                        <img
                          src={sender?.avatar}
                          alt={sender?.displayName}
                          className="h-8 w-8 rounded-full mr-2 self-end"
                        />
                      )}
                      <div>
                        <div
                          className={`rounded-lg px-4 py-2 ${
                            isMine ? 'bg-blue-600 text-white' : 'bg-white text-gray-800 border'
                          }`}
                        >
                          <p>{msg.text}</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatTime(msg.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messageEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-grow border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="bg-blue-600 text-white rounded-full p-2 hover:bg-blue-700"
                  disabled={!message.trim()}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.94 2.94a1.5 1.5 0 012.12 0L10 7.88l4.94-4.94a1.5 1.5 0 112.12 2.12L12.12 10l4.94 4.94a1.5 1.5 0 01-2.12 2.12L10 12.12l-4.94 4.94a1.5 1.5 0 01-2.12-2.12L7.88 10 2.94 5.06a1.5 1.5 0 010-2.12z" />
                  </svg>
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="hidden sm:flex flex-col items-center justify-center w-2/3 lg:w-3/4 bg-gray-50">
            <div className="text-center p-8">
              <div className="mx-auto w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold mb-2">Your Messages</h2>
              <p className="text-gray-600 mb-6">Select a conversation or start a new one</p>
              <Link to="/community" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                Find Players
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;
