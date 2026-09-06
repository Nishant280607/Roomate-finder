export const conversations = [
  {
    id: 1,
    name: "Sarah Johnson",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
    online: true,
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
    lastMessage: "Nice meeting you!",
    time: "Mon",
    unread: 0,
  },
];

export const messagesByConversation = {
  1: [
    {
      id: 1,
      sender: "them",
      text: "Hey Alex! I saw that we're a 94% match.",
      time: "10:31 AM",
    },
    {
      id: 2,
      sender: "me",
      text: "Hey Sarah! Yes, that's pretty high 😄",
      time: "10:34 AM",
    },
    {
      id: 3,
      sender: "them",
      text: "Right? I noticed we both love coffee and yoga.",
      time: "10:36 AM",
    },
    {
      id: 4,
      sender: "me",
      text: "Absolutely! I'm also looking for a quiet and clean place.",
      time: "10:39 AM",
    },
    {
      id: 5,
      sender: "them",
      text: "That sounds great! Let's talk more.",
      time: "10:42 AM",
    },
  ],

  2: [
    {
      id: 1,
      sender: "them",
      text: "Hey Alex! How are you doing?",
      time: "Yesterday",
    },
    {
      id: 2,
      sender: "me",
      text: "I'm doing great! How about you?",
      time: "Yesterday",
    },
    {
      id: 3,
      sender: "them",
      text: "Pretty good! Are you free this weekend?",
      time: "Yesterday",
    },
  ],

  3: [
    {
      id: 1,
      sender: "me",
      text: "Hey Emma, nice to connect with you!",
      time: "Yesterday",
    },
    {
      id: 2,
      sender: "them",
      text: "Nice to connect with you too!",
      time: "Yesterday",
    },
    {
      id: 3,
      sender: "them",
      text: "I'll send you the details!",
      time: "Yesterday",
    },
  ],

  4: [
    {
      id: 1,
      sender: "them",
      text: "Thanks for connecting!",
      time: "Mon",
    },
    {
      id: 2,
      sender: "me",
      text: "Of course! Nice meeting you.",
      time: "Mon",
    },
  ],
};

function Messages() {
  return (
    <div>
      <h1>Messages</h1>
      <p>Your conversations will appear here.</p>
    </div>
  );
}

export default Messages;