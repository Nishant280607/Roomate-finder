import { supabase } from "../lib/supabase";

export const initialConversations = [
  {
    id: 1,
    name: "Sarah Johnson",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
    online: true,
    occupation: "UI/UX Designer",
    lastMessage: "That sounds great! Let's talk more.",
    time: "10:42 AM",
    unread: 2,
  },
  {
    id: 2,
    name: "David Wilson",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
    online: true,
    occupation: "Software Developer",
    lastMessage: "Are you free this weekend?",
    time: "Yesterday",
    unread: 1,
  },
  {
    id: 3,
    name: "Emma Davis",
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    online: false,
    occupation: "Marketing Specialist",
    lastMessage: "I'll send you the details!",
    time: "Yesterday",
    unread: 0,
  },
  {
    id: 4,
    name: "Michael Brown",
    image:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80",
    online: false,
    occupation: "Product Manager",
    lastMessage: "Nice meeting you!",
    time: "Mon",
    unread: 0,
  },
];

export const initialMessages = {
  1: [
    {
      id: 101,
      sender: "them",
      text: "Hey Alex! I saw that we're a 94% match.",
      time: "10:31 AM",
    },
    {
      id: 102,
      sender: "me",
      text: "Hey Sarah! Yes, that's pretty high 😄",
      time: "10:34 AM",
    },
    {
      id: 103,
      sender: "them",
      text: "Right? I noticed we both love coffee and yoga.",
      time: "10:36 AM",
    },
    {
      id: 104,
      sender: "me",
      text: "Absolutely! I'm also looking for a quiet and clean place in Brooklyn.",
      time: "10:39 AM",
    },
    {
      id: 105,
      sender: "them",
      text: "That sounds great! Let's talk more.",
      time: "10:42 AM",
    },
  ],
  2: [
    {
      id: 201,
      sender: "them",
      text: "Hey Alex! How are you doing?",
      time: "Yesterday",
    },
    {
      id: 202,
      sender: "me",
      text: "I'm doing great! How about you?",
      time: "Yesterday",
    },
    {
      id: 203,
      sender: "them",
      text: "Pretty good! Are you free this weekend to check out some places?",
      time: "Yesterday",
    },
  ],
  3: [
    {
      id: 301,
      sender: "me",
      text: "Hey Emma, nice to connect with you!",
      time: "Yesterday",
    },
    {
      id: 302,
      sender: "them",
      text: "Nice to connect with you too!",
      time: "Yesterday",
    },
    {
      id: 303,
      sender: "them",
      text: "I'll send you the details!",
      time: "Yesterday",
    },
  ],
  4: [
    {
      id: 401,
      sender: "them",
      text: "Thanks for connecting!",
      time: "Mon",
    },
    {
      id: 402,
      sender: "me",
      text: "Of course! Nice meeting you.",
      time: "Mon",
    },
  ],
};

export const messageService = {
  getStoredConversations() {
    const cached = localStorage.getItem("roomiefinder_conversations");
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {}
    }
    return initialConversations;
  },

  getStoredMessages() {
    const cached = localStorage.getItem("roomiefinder_messages_store");
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {}
    }
    return initialMessages;
  },

  async getConversations(userId) {
    try {
      if (userId) {
        const { data, error } = await supabase
          .from("conversations")
          .select("*");
        if (!error && data && data.length > 0) {
          // Table exists and has rows
        }
      }
    } catch (err) {
      console.warn("getConversations notice:", err);
    }
    return this.getStoredConversations();
  },

  async getMessages(conversationId) {
    const store = this.getStoredMessages();
    return store[conversationId] || [];
  },

  async sendMessage(conversationId, text, sender = "me") {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const newMessage = {
      id: Date.now(),
      sender,
      text,
      time: timeStr,
    };

    const store = this.getStoredMessages();
    const currentList = store[conversationId] || [];
    const updatedList = [...currentList, newMessage];
    store[conversationId] = updatedList;
    localStorage.setItem("roomiefinder_messages_store", JSON.stringify(store));

    // Update conversation preview
    const convs = this.getStoredConversations();
    const updatedConvs = convs.map((c) =>
      String(c.id) === String(conversationId)
        ? { ...c, lastMessage: text, time: timeStr, unread: 0 }
        : c
    );
    localStorage.setItem(
      "roomiefinder_conversations",
      JSON.stringify(updatedConvs)
    );

    // Try Supabase insert
    try {
      await supabase.from("messages").insert({
        conversation_id: String(conversationId),
        message: text,
        sender_id: sender,
        is_read: sender === "me",
      });
    } catch (err) {
      console.warn("sendMessage supabase notice:", err);
    }

    return newMessage;
  },
};