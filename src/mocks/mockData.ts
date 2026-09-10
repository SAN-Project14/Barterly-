import { 
  User, 
  Listing, 
  Offer, 
  Trade, 
  Conversation, 
  Message, 
  Notification, 
  Review, 
  Report, 
  AdminAuditLog 
} from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'user_1',
    name: 'Alex Rivera',
    username: 'alexr',
    email: 'alex.rivera@example.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    location: { city: 'Quezon City', region: 'Metro Manila' },
    rating: 4.9,
    reviewCount: 14,
    completedTradesCount: 14,
    bio: 'Mechanical keyboard enthusiast, audiophile & vintage tech collector. Always down for fair exchanges!',
    joinedDate: 'March 2025',
    role: 'user',
    status: 'active',
    verifiedEmail: true,
  },
  {
    id: 'user_2',
    name: 'Sarah Chen',
    username: 'sarahc',
    email: 'sarah.chen@example.com',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
    location: { city: 'Makati', region: 'Metro Manila' },
    rating: 4.8,
    reviewCount: 22,
    completedTradesCount: 22,
    bio: 'Photographer and creative director. Trading unused gear for audio equipment and studio props.',
    joinedDate: 'January 2025',
    role: 'user',
    status: 'active',
    verifiedEmail: true,
  },
  {
    id: 'user_3',
    name: 'Dave Miller',
    username: 'davem',
    email: 'dave.miller@example.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    location: { city: 'Taguig', region: 'Metro Manila' },
    rating: 4.7,
    reviewCount: 8,
    completedTradesCount: 8,
    bio: 'Coffee lover and home barista. Looking to swap coffee gadgets for compact camera gear.',
    joinedDate: 'May 2025',
    role: 'user',
    status: 'active',
    verifiedEmail: true,
  },
  {
    id: 'user_4',
    name: 'Mia Torres',
    username: 'miat',
    email: 'mia.torres@example.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    location: { city: 'Pasig', region: 'Metro Manila' },
    rating: 5.0,
    reviewCount: 31,
    completedTradesCount: 31,
    bio: 'Eco-conscious minimal lifestyle. Swapping books, curated vintage fashion & board games.',
    joinedDate: 'October 2024',
    role: 'user',
    status: 'active',
    verifiedEmail: true,
  },
  {
    id: 'admin_1',
    name: 'Marcus Vance',
    username: 'marcus_admin',
    email: 'marcus.vance@barterly.internal',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    location: { city: 'Central Hub', region: 'Barterly Operations' },
    rating: 5.0,
    reviewCount: 0,
    completedTradesCount: 0,
    bio: 'Barterly Platform Trust & Safety Lead.',
    joinedDate: 'September 2024',
    role: 'admin',
    status: 'active',
    verifiedEmail: true,
  },
];

export const INITIAL_LISTINGS: Listing[] = [
  {
    id: 'list_1',
    title: 'Custom Keychron Q1 Pro Wireless Mechanical Keyboard',
    description: 'Fully built 75% QMK/VIA wireless mechanical keyboard with CNC aluminum body, double-gasket design, lubed Gateron Oil King linear switches, and PBT dye-sub keycaps. Flawless condition, includes braided USB-C cable and extra novelty caps.',
    category: 'Electronics',
    condition: 'like_new',
    conditionDetails: 'Used gently on a desk mat for 2 months. No scratches or signs of wear.',
    location: { city: 'Quezon City', region: 'Metro Manila' },
    images: [
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&auto=format&fit=crop&q=80',
    ],
    ownerId: 'user_1',
    owner: INITIAL_USERS[0],
    desiredExchange: 'Looking for: Sony WH-1000XM4/XM5, Sennheiser HD600 headphones, or a clean Fujifilm 27mm pancake lens.',
    estimatedValue: 190,
    status: 'published',
    createdAt: '2026-09-02T10:30:00Z',
    updatedAt: '2026-09-02T10:30:00Z',
    viewsCount: 142,
    favoritesCount: 19,
    isFeatured: true,
    tags: ['mechanical-keyboard', 'aluminum', 'wireless', 'desk-setup'],
  },
  {
    id: 'list_2',
    title: 'Sony Alpha a6400 Mirrorless Camera Body',
    description: 'Compact 24.2MP APS-C mirrorless camera with real-time eye autofocus and 4K HDR video. Clean sensor, screen protector applied on day one. Comes with 2 original Sony NP-FW50 batteries, charger, and Peak Design wrist strap.',
    category: 'Photography',
    condition: 'good',
    conditionDetails: 'Shutter count is under 8,500. Minor rub mark on hotshoe mount, optics and sensor 100% spotless.',
    location: { city: 'Makati', region: 'Metro Manila' },
    images: [
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1502982720700-bfff97f2ecac?w=800&auto=format&fit=crop&q=80',
    ],
    ownerId: 'user_2',
    owner: INITIAL_USERS[1],
    desiredExchange: 'Want: Rode Wireless PRO microphone set, Zoom H6 recorder, or a M2 Mac Mini setup.',
    estimatedValue: 650,
    status: 'published',
    createdAt: '2026-09-04T14:15:00Z',
    updatedAt: '2026-09-04T14:15:00Z',
    viewsCount: 290,
    favoritesCount: 38,
    isFeatured: true,
    tags: ['sony', 'mirrorless', '4k', 'camera'],
  },
  {
    id: 'list_3',
    title: 'Audio-Technica LP120XUSB Direct-Drive Turntable',
    description: 'Professional high-torque direct-drive vinyl turntable with upgraded Ortofon 2M Red cartridge. USB output for vinyl digitization, selectable phono preamplifier, and anti-skate control. Original slipmat and dustcover included.',
    category: 'Audio & Music',
    condition: 'like_new',
    conditionDetails: 'Kept in smoke-free listening room. Dust cover has faint micro-scratches from wiping, needle is pristine.',
    location: { city: 'Taguig', region: 'Metro Manila' },
    images: [
      'https://images.unsplash.com/photo-1539185441755-769473a23570?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=800&auto=format&fit=crop&q=80',
    ],
    ownerId: 'user_3',
    owner: INITIAL_USERS[2],
    desiredExchange: 'Looking for: Espresso grinder (DF64 Gen 2, Fellow Ode Gen 2), or a Breville Bambino Plus espresso machine.',
    estimatedValue: 320,
    status: 'published',
    createdAt: '2026-09-05T09:00:00Z',
    updatedAt: '2026-09-05T09:00:00Z',
    viewsCount: 185,
    favoritesCount: 24,
    tags: ['vinyl', 'turntable', 'audio', 'hi-fi'],
  },
  {
    id: 'list_4',
    title: 'Vintage Schott NYC 654 Cowhide Leather Motorcycle Jacket (Size M)',
    description: 'Authentic Schott classic cafe racer jacket in heavy oiled cowhide leather. Brass Talon zippers, soft plaid flannel lining. Beautiful natural patina that takes years to break in. Truly an heirloom garment.',
    category: 'Fashion & Apparel',
    condition: 'good',
    conditionDetails: 'Leather is supple and conditioned with Bickmore. All zips run smoothly.',
    location: { city: 'Pasig', region: 'Metro Manila' },
    images: [
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?w=800&auto=format&fit=crop&q=80',
    ],
    ownerId: 'user_4',
    owner: INITIAL_USERS[3],
    desiredExchange: 'Exchange for: Red Wing Iron Ranger boots (US 9/9.5), Barbour Beaufort jacket, or raw denim jackets.',
    estimatedValue: 450,
    status: 'published',
    createdAt: '2026-09-06T11:45:00Z',
    updatedAt: '2026-09-06T11:45:00Z',
    viewsCount: 310,
    favoritesCount: 42,
    isFeatured: true,
    tags: ['leather', 'vintage', 'schott', 'outerwear'],
  },
  {
    id: 'list_5',
    title: 'Kindle Oasis 10th Gen (32GB, Warm Light, Graphite)',
    description: 'Top-tier e-reader with 7-inch 300 ppi glare-free display, ergonomic design with physical page-turn buttons, and adjustable warm light. Waterproof (IPX8). Battery lasts weeks. Comes with premium leather magnetic cover.',
    category: 'Electronics',
    condition: 'brand_new',
    conditionDetails: 'Replaced under warranty and only opened to verify screen parity. Unregistered device.',
    location: { city: 'Quezon City', region: 'Metro Manila' },
    images: [
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=800&auto=format&fit=crop&q=80',
    ],
    ownerId: 'user_1',
    owner: INITIAL_USERS[0],
    desiredExchange: 'Looking for: Nintendo Switch OLED tablet or AirPods Pro 2 USB-C.',
    estimatedValue: 240,
    status: 'published',
    createdAt: '2026-09-06T16:20:00Z',
    updatedAt: '2026-09-06T16:20:00Z',
    viewsCount: 98,
    favoritesCount: 15,
    tags: ['kindle', 'ereader', 'books', 'waterproof'],
  },
  {
    id: 'list_6',
    title: 'Fender Player Stratocaster Electric Guitar (Tidepool Blue, Maple Neck)',
    description: 'Made in Mexico Fender Stratocaster in striking Tidepool finish. Three Player Series single-coil pickups, modern C-shape neck profile with satin urethane finish on back, 9.5-radius fingerboard. Professionally set up with Ernie Ball 10s.',
    category: 'Audio & Music',
    condition: 'like_new',
    conditionDetails: 'Only played in home studio. Zero fret wear. Includes Fender padded gig bag.',
    location: { city: 'Makati', region: 'Metro Manila' },
    images: [
      'https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1550985616-10810253b84d?w=800&auto=format&fit=crop&q=80',
    ],
    ownerId: 'user_2',
    owner: INITIAL_USERS[1],
    desiredExchange: 'Looking to trade for: Bass guitar (Fender Jazz or Precision), or a Roland FP-30X digital piano.',
    estimatedValue: 700,
    status: 'reserved',
    createdAt: '2026-09-01T08:10:00Z',
    updatedAt: '2026-09-07T12:00:00Z',
    viewsCount: 440,
    favoritesCount: 56,
    tags: ['guitar', 'fender', 'stratocaster', 'instruments'],
  },
  {
    id: 'list_7',
    title: 'Wacom Intuos Pro Medium Graphics Drawing Tablet',
    description: 'Industry-standard pen tablet for digital illustration, photo editing, and graphic design. Pro Pen 2 with 8192 levels of pressure sensitivity, tilt recognition, and 8 customizable ExpressKeys. Bluetooth and USB connectivity.',
    category: 'Electronics',
    condition: 'good',
    conditionDetails: 'Tablet surface has standard light pen stroke glossing, fully responsive across every quadrant.',
    location: { city: 'Taguig', region: 'Metro Manila' },
    images: [
      'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&auto=format&fit=crop&q=80',
    ],
    ownerId: 'user_3',
    owner: INITIAL_USERS[2],
    desiredExchange: 'Seeking: CalDigit TS4 Thunderbolt Dock or 32-inch 4K monitor (LG/Dell).',
    estimatedValue: 260,
    status: 'published',
    createdAt: '2026-09-07T13:40:00Z',
    updatedAt: '2026-09-07T13:40:00Z',
    viewsCount: 76,
    favoritesCount: 11,
    tags: ['wacom', 'art', 'tablet', 'digital-art'],
  },
  {
    id: 'list_8',
    title: 'Seiko Prospex SRP777 Turtle Automatic Diver 200m Watch',
    description: 'Classic cushion-case automatic dive watch with iconic matte black dial, LumiBrite markers, 4R36 movement with manual winding and hacking. Mounted on an Uncle Seiko waffle strap, original silicone strap in box.',
    category: 'Fashion & Apparel',
    condition: 'good',
    conditionDetails: 'Minor desk-diving hairlines on case back. Bezel and crystal are completely free of flaws.',
    location: { city: 'Pasig', region: 'Metro Manila' },
    images: [
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&auto=format&fit=crop&q=80',
    ],
    ownerId: 'user_4',
    owner: INITIAL_USERS[3],
    desiredExchange: 'Looking for: Hamilton Khaki Field mechanical, or Garmin Fenix 7.',
    estimatedValue: 360,
    status: 'published',
    createdAt: '2026-09-07T18:00:00Z',
    updatedAt: '2026-09-07T18:00:00Z',
    viewsCount: 165,
    favoritesCount: 27,
    tags: ['watch', 'seiko', 'automatic', 'horology'],
  }
];

export const INITIAL_OFFERS: Offer[] = [
  {
    id: 'off_1',
    listingId: 'list_1',
    listing: INITIAL_LISTINGS[0],
    requesterId: 'user_2',
    requester: INITIAL_USERS[1],
    ownerId: 'user_1',
    owner: INITIAL_USERS[0],
    offeredItems: [
      {
        id: 'off_item_1',
        title: 'Sony WH-1000XM4 Wireless Headphones (Midnight Blue)',
        condition: 'like_new',
        category: 'Audio & Music',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
        estimatedValue: 210,
        description: 'Noise canceling flagship, all accessories and hard case included.',
      },
    ],
    cashAdjustment: 0,
    note: 'Hi Alex! I saw your wishlist mentioned Sony XM4 headphones. Mine are in excellent condition and barely used outside my home office. Would love to trade for your Keychron Q1 Pro!',
    status: 'countered',
    history: [
      {
        id: 'hist_1',
        offerId: 'off_1',
        senderId: 'user_2',
        senderName: 'Sarah Chen',
        itemsOffered: [
          {
            id: 'off_item_1',
            title: 'Sony WH-1000XM4 Wireless Headphones (Midnight Blue)',
            condition: 'like_new',
            category: 'Audio & Music',
            image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
            estimatedValue: 210,
          },
        ],
        note: 'Initial offer: Sony XM4 headphones for the keyboard.',
        cashAdjustment: 0,
        createdAt: '2026-09-05T14:00:00Z',
        type: 'initial',
      },
      {
        id: 'hist_2',
        offerId: 'off_1',
        senderId: 'user_1',
        senderName: 'Alex Rivera',
        itemsOffered: [
          {
            id: 'off_item_1',
            title: 'Sony WH-1000XM4 Wireless Headphones (Midnight Blue)',
            condition: 'like_new',
            category: 'Audio & Music',
            image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
            estimatedValue: 210,
          },
          {
            id: 'off_item_extra',
            title: 'Anker 65W GaN Fast Charger + braided cable',
            condition: 'like_new',
            category: 'Electronics',
            image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80',
            estimatedValue: 35,
          }
        ],
        note: 'Counter-proposal: The XM4s sound great! Could you also throw in a compact 65W travel charger since the Q1 has custom Oil Kings and extra brass weight?',
        cashAdjustment: 0,
        createdAt: '2026-09-06T09:30:00Z',
        type: 'counter',
      }
    ],
    createdAt: '2026-09-05T14:00:00Z',
    updatedAt: '2026-09-06T09:30:00Z',
  },
  {
    id: 'off_2',
    listingId: 'list_1',
    listing: INITIAL_LISTINGS[0],
    requesterId: 'user_3',
    requester: INITIAL_USERS[2],
    ownerId: 'user_1',
    owner: INITIAL_USERS[0],
    offeredItems: [
      {
        id: 'off_item_2',
        title: 'Logitech MX Master 3S Mouse + NuPhy Air60',
        condition: 'good',
        category: 'Electronics',
        image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&auto=format&fit=crop&q=80',
        estimatedValue: 180,
      }
    ],
    cashAdjustment: 20,
    note: 'Offering my MX Master 3S mouse + low profile NuPhy Air60 plus $20 cash sweetener for the Q1 Pro.',
    status: 'pending',
    history: [
      {
        id: 'hist_3',
        offerId: 'off_2',
        senderId: 'user_3',
        senderName: 'Dave Miller',
        itemsOffered: [
          {
            id: 'off_item_2',
            title: 'Logitech MX Master 3S Mouse + NuPhy Air60',
            condition: 'good',
            category: 'Electronics',
            image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&auto=format&fit=crop&q=80',
            estimatedValue: 180,
          }
        ],
        note: 'Offering combo + cash adjustment.',
        cashAdjustment: 20,
        createdAt: '2026-09-07T08:00:00Z',
        type: 'initial',
      }
    ],
    createdAt: '2026-09-07T08:00:00Z',
    updatedAt: '2026-09-07T08:00:00Z',
  }
];

export const INITIAL_TRADES: Trade[] = [
  {
    id: 'trade_1',
    offerId: 'off_accepted_prior',
    listing: INITIAL_LISTINGS[5], // Fender Strat
    owner: INITIAL_USERS[1],      // Sarah Chen
    requester: INITIAL_USERS[3],  // Mia Torres
    exchangedItems: {
      fromOwner: INITIAL_LISTINGS[5],
      fromRequester: [
        {
          id: 'off_item_piano',
          title: 'Roland FP-30X Digital Piano + Wooden Stand',
          condition: 'like_new',
          category: 'Audio & Music',
          image: 'https://images.unsplash.com/photo-1520523839898-50712825e3a7?w=800&auto=format&fit=crop&q=80',
          estimatedValue: 720,
        }
      ],
      cashAdjustment: 0,
    },
    status: 'trade_arranged',
    meeting: {
      method: 'in_person',
      locationName: 'Ayala Malls Vertis North Security Lobby, Quezon City',
      scheduledDate: '2026-09-12T14:00:00Z',
      notes: 'Well-lit public security desk near ground floor entrance. We will both test the instruments on portable battery amps.',
      agreedByOwner: true,
      agreedByRequester: true,
    },
    ownerConfirmedReceived: false,
    requesterConfirmedReceived: false,
    createdAt: '2026-09-06T11:00:00Z',
  }
];

export const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv_1',
    participants: [INITIAL_USERS[0], INITIAL_USERS[1]],
    listingId: 'list_1',
    listing: INITIAL_LISTINGS[0],
    unreadCount: 1,
    updatedAt: '2026-09-06T09:35:00Z',
    lastMessage: {
      id: 'msg_3',
      conversationId: 'conv_1',
      senderId: 'user_2',
      text: 'Thanks for the counter! I do have the Anker 65W nano cube charger. Let me check the cable and I will accept the counter offer.',
      createdAt: '2026-09-06T09:35:00Z',
      isRead: false,
    }
  },
  {
    id: 'conv_2',
    participants: [INITIAL_USERS[0], INITIAL_USERS[2]],
    listingId: 'list_1',
    listing: INITIAL_LISTINGS[0],
    unreadCount: 0,
    updatedAt: '2026-09-07T08:15:00Z',
    lastMessage: {
      id: 'msg_4',
      conversationId: 'conv_2',
      senderId: 'user_3',
      text: 'Hey Alex, let me know if the Logitech + NuPhy combo is of interest to you! Can meet anywhere along EDSA.',
      createdAt: '2026-09-07T08:15:00Z',
      isRead: true,
    }
  }
];

export const INITIAL_MESSAGES: Record<string, Message[]> = {
  'conv_1': [
    {
      id: 'msg_1',
      conversationId: 'conv_1',
      senderId: 'user_2',
      text: 'Hello Alex! I submitted a barter offer with my Sony XM4 headphones for your Keychron keyboard.',
      createdAt: '2026-09-05T14:05:00Z',
      isRead: true,
    },
    {
      id: 'msg_2',
      conversationId: 'conv_1',
      senderId: 'user_1',
      text: 'Hi Sarah! The XM4s are definitely what I am looking for. I sent over a slight counter-offer requesting a compact 65W charger to balance the custom switches.',
      createdAt: '2026-09-06T09:31:00Z',
      isRead: true,
    },
    {
      id: 'msg_3',
      conversationId: 'conv_1',
      senderId: 'user_2',
      text: 'Thanks for the counter! I do have the Anker 65W nano cube charger. Let me check the cable and I will accept the counter offer.',
      createdAt: '2026-09-06T09:35:00Z',
      isRead: false,
    }
  ],
  'conv_2': [
    {
      id: 'msg_4',
      conversationId: 'conv_2',
      senderId: 'user_3',
      text: 'Hey Alex, let me know if the Logitech + NuPhy combo is of interest to you! Can meet anywhere along EDSA.',
      createdAt: '2026-09-07T08:15:00Z',
      isRead: true,
    }
  ]
};

export const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif_1',
    userId: 'user_1',
    type: 'new_offer',
    title: 'New Barter Offer Received',
    message: 'Dave Miller offered a Logitech MX Master 3S + NuPhy keyboard for your Keychron Q1 Pro.',
    linkRoute: 'offers',
    linkId: 'off_2',
    isRead: false,
    createdAt: '2026-09-07T08:00:00Z',
  },
  {
    id: 'notif_2',
    userId: 'user_1',
    type: 'new_message',
    title: 'New Message from Sarah Chen',
    message: 'Sarah: "Thanks for the counter! I do have the Anker 65W nano cube charger..."',
    linkRoute: 'messages',
    linkId: 'conv_1',
    isRead: false,
    createdAt: '2026-09-06T09:35:00Z',
  },
  {
    id: 'notif_3',
    userId: 'user_1',
    type: 'listing_approved',
    title: 'Listing Approved',
    message: 'Your listing "Kindle Oasis 10th Gen" has been verified and published to the marketplace.',
    linkRoute: 'listing',
    linkId: 'list_5',
    isRead: true,
    createdAt: '2026-09-06T16:25:00Z',
  },
  {
    id: 'notif_4',
    userId: 'user_1',
    type: 'security_alert',
    title: 'Account Security Notice',
    message: 'New sign-in detected from Chrome on Linux (Asia/Manila).',
    linkRoute: 'settings',
    isRead: true,
    createdAt: '2026-09-01T09:00:00Z',
  }
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev_1',
    tradeId: 'past_trade_1',
    reviewerId: 'user_2',
    reviewer: INITIAL_USERS[1],
    revieweeId: 'user_1',
    rating: 5,
    comment: 'Alex was super punctual and the synthesizer was even cleaner than described in the pictures. Smooth trade all around!',
    tags: ['Punctual', 'Item as described', 'Great communicator', 'Fair valuation'],
    createdAt: '2026-08-18T16:00:00Z',
  },
  {
    id: 'rev_2',
    tradeId: 'past_trade_2',
    reviewerId: 'user_4',
    reviewer: INITIAL_USERS[3],
    revieweeId: 'user_1',
    rating: 5,
    comment: 'Exchanged my vintage watch for Alex’s audio interface. Public mall meetup was safe and seamless.',
    tags: ['Safe meetup', 'Item as described', 'Recommended trader'],
    createdAt: '2026-08-02T11:20:00Z',
  }
];

export const INITIAL_REPORTS: Report[] = [
  {
    id: 'rep_1',
    reporterId: 'user_3',
    reporterName: 'Dave Miller',
    targetType: 'listing',
    targetId: 'flagged_item_99',
    targetTitle: 'Replica Designer Sunglasses (Unbranded)',
    reason: 'fake_item',
    details: 'Seller states in description that these are 1:1 replicas of Ray-Bans, which violates Barterly prohibited items policy regarding counterfeit goods.',
    status: 'open',
    createdAt: '2026-09-07T15:20:00Z',
  },
  {
    id: 'rep_2',
    reporterId: 'user_2',
    reporterName: 'Sarah Chen',
    targetType: 'user',
    targetId: 'suspicious_trader_4',
    targetTitle: 'User: @crypto_trader_fast',
    reason: 'scam',
    details: 'User asked me to pay cash outside Barterly and refused public meetup.',
    status: 'investigating',
    createdAt: '2026-09-06T18:45:00Z',
  }
];

export const INITIAL_AUDIT_LOGS: AdminAuditLog[] = [
  {
    id: 'audit_1',
    adminId: 'admin_1',
    adminName: 'Marcus Vance',
    action: 'Approved Listing',
    targetResource: 'Listing #list_5 (Kindle Oasis)',
    details: 'Reviewed photos and description. Cleared compliance criteria.',
    timestamp: '2026-09-06T16:24:12Z',
  },
  {
    id: 'audit_2',
    adminId: 'admin_1',
    adminName: 'Marcus Vance',
    action: 'Investigating Report',
    targetResource: 'Report #rep_2 (@crypto_trader_fast)',
    details: 'Opened investigation into off-platform transaction solicitations.',
    timestamp: '2026-09-06T19:00:00Z',
  },
  {
    id: 'audit_3',
    adminId: 'admin_1',
    adminName: 'Marcus Vance',
    action: 'Suspended User',
    targetResource: 'User #bad_actor_0',
    details: 'Permanent suspension due to repeated listing of prohibited laser devices.',
    timestamp: '2026-09-03T11:15:30Z',
  }
];

export const CATEGORIES = [
  'All Categories',
  'Electronics',
  'Audio & Music',
  'Photography',
  'Gaming & Consoles',
  'Home & Kitchen',
  'Fashion & Apparel',
  'Sports & Outdoors',
  'Books & Collectibles',
];

export const SAFE_EXCHANGE_SPOTS = [
  { 
    id: 'spot_1', 
    name: 'Ayala Malls Vertis North Security Lobby, Quezon City', 
    city: 'Quezon City', 
    address: 'Mindanao Ave & North Ave, Bagong Pag-asa',
    type: 'Shopping Mall Concierge',
    hours: '10:00 AM - 9:00 PM Daily'
  },
  { 
    id: 'spot_2', 
    name: 'SM Megamall Building B Concierge Desk, Mandaluyong', 
    city: 'Mandaluyong', 
    address: 'EDSA corner Doña Julia Vargas Ave',
    type: 'Mall Security Station',
    hours: '10:00 AM - 10:00 PM Daily'
  },
  { 
    id: 'spot_3', 
    name: 'Bonifacio High Street Central Security Desk, Taguig', 
    city: 'Taguig', 
    address: '5th Ave & 28th St, BGC',
    type: 'Commercial Plaza Security',
    hours: '8:00 AM - 11:00 PM Daily'
  },
  { 
    id: 'spot_4', 
    name: 'Greenbelt 5 Main Entrance Guard Desk, Makati', 
    city: 'Makati', 
    address: 'Legazpi St, Ayala Center',
    type: 'Monitored Public Entrance',
    hours: '10:00 AM - 9:00 PM Daily'
  },
  { 
    id: 'spot_5', 
    name: 'Police Station Community Exchange Desk, Quezon City', 
    city: 'Quezon City', 
    address: 'EDSA cor. Kamuning Rd',
    type: 'Police Station Lobby',
    hours: '24/7 Monitored Safe Zone'
  },
];

export const PROHIBITED_ITEM_CATEGORIES = [
  {
    name: 'Weapons, Firearms & Explosives',
    examples: ['Guns, firearms, replica guns', 'Ammunition and reloading equipment', 'Knives designed for combat', 'Explosives, fireworks, flares'],
  },
  {
    name: 'Controlled & Regulated Substances',
    examples: ['Illegal narcotics and prescription medications', 'Drug paraphernalia', 'Tobacco, e-cigarettes, vape pods', 'Alcoholic beverages'],
  },
  {
    name: 'Counterfeits, Replicas & Stolen Goods',
    examples: ['Counterfeit designer apparel or accessories', 'Replica luxury watches', 'Stolen goods or unverified serial-number tech', 'Pirated software, cracked consoles'],
  },
  {
    name: 'Financial Instruments & Currency',
    examples: ['Cash, bank drafts, wire vouchers', 'Cryptocurrency keys or seed phrases', 'Gift cards or prepaid debit vouchers', 'Lottery tickets and gaming chips'],
  },
  {
    name: 'Hazardous Materials & Regulated Wildlife',
    examples: ['Toxic chemicals, corrosives, biohazards', 'Live animals or restricted fauna products', 'Ivory or endangered animal artifacts', 'Recalled consumer products'],
  },
  {
    name: 'Adult & Inappropriate Content',
    examples: ['Pornographic media and sexually explicit devices', 'Services or labor exchanges of an adult nature', 'Hate speech or extremist paraphernalia'],
  },
];

