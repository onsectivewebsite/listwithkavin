/* =========================================================
   listings.js — Mock Calgary property data
   Replace this file (or wire to a real MLS feed / CMS) to
   power live data across the site. See README.md.

   IMAGES: each image has a `src` URL using picsum.photos with
   a deterministic seed. To swap in real photos, replace the
   `src` value with any URL (Unsplash, S3, /img/local-path.jpg).
   See README → "How to add real listings".
   ========================================================= */

/* Helper to build deterministic picsum URLs */
function _img(seed, label) {
  return { src: `https://picsum.photos/seed/lwk-${seed}/1200/900`, label };
}

window.LISTINGS = [
  {
    id: 'kw-001',
    address: '2418 Aspen Heights Drive SW',
    neighborhood: 'Aspen Woods',
    price: 1895000,
    beds: 5,
    baths: 4.5,
    sqft: 4280,
    type: 'Detached',
    status: 'For Sale',
    aiValue: '1,850,000 — 1,940,000',
    tags: ['Luxury', 'Near Schools'],
    description:
      'Architecturally distinct executive estate in coveted Aspen Woods. Soaring ceilings, chef-grade Wolf/Sub-Zero kitchen, walk-out lower level, and panoramic Rocky Mountain views. White-glove living minutes from Aspen Landing.',
    images: [
      _img('001-1', 'Exterior · Front Elevation'),
      _img('001-2', 'Great Room · Floor-to-Ceiling Windows'),
      _img('001-3', 'Chef Kitchen · Wolf / Sub-Zero'),
      _img('001-4', 'Primary Suite · Mountain Views'),
      _img('001-5', 'Walk-Out Lower Level')
    ]
  },
  {
    id: 'kw-002',
    address: '#3104, 738 First Avenue SW',
    neighborhood: 'Beltline',
    price: 749000,
    beds: 2,
    baths: 2,
    sqft: 1180,
    type: 'Condo',
    status: 'For Sale',
    aiValue: '735,000 — 770,000',
    tags: ['Luxury', 'Investment Property', 'Pet-Friendly'],
    description:
      'Sub-penthouse with sweeping downtown skyline views from the 31st floor. Floor-to-ceiling glass, integrated Miele appliances, secure titled parking, and concierge service. Walk Score 98.',
    images: [
      _img('002-1', 'Floor-to-Ceiling Skyline View'),
      _img('002-2', 'Open-Concept Living'),
      _img('002-3', 'Miele Chef Kitchen'),
      _img('002-4', 'Primary Bedroom')
    ]
  },
  {
    id: 'kw-003',
    address: '142 Tuscany Ridge Heights NW',
    neighborhood: 'Tuscany',
    price: 879000,
    beds: 4,
    baths: 3.5,
    sqft: 2640,
    type: 'Detached',
    status: 'For Sale',
    aiValue: '865,000 — 905,000',
    tags: ['Near Schools', 'Pet-Friendly'],
    description:
      'Move-in ready family home backing onto green space. Vaulted great room, open kitchen with quartz island, finished basement, oversized double garage, and direct ridge-path access for trail-running and biking.',
    images: [
      _img('003-1', 'Curb Appeal · Mountain View'),
      _img('003-2', 'Open Living / Dining'),
      _img('003-3', 'Quartz Island Kitchen'),
      _img('003-4', 'Backyard Onto Green Space'),
      _img('003-5', 'Finished Basement')
    ]
  },
  {
    id: 'kw-004',
    address: '88 Mahogany Shore SE',
    neighborhood: 'Mahogany',
    price: 1245000,
    beds: 4,
    baths: 3,
    sqft: 2980,
    type: 'Detached',
    status: 'For Sale',
    aiValue: '1,210,000 — 1,275,000',
    tags: ['Luxury', 'Near Schools'],
    description:
      'Lake-access living in Calgary’s premier four-season community. Custom finishes, gourmet kitchen, primary retreat with spa ensuite, private dock privileges, and year-round beach club membership.',
    images: [
      _img('004-1', 'Lakefront Elevation'),
      _img('004-2', 'Two-Storey Great Room'),
      _img('004-3', 'Gourmet Kitchen'),
      _img('004-4', 'Primary Spa Ensuite'),
      _img('004-5', 'Private Dock Access')
    ]
  },
  {
    id: 'kw-005',
    address: '309 — 11 Avenue NE',
    neighborhood: 'Bridgeland',
    price: 685000,
    beds: 3,
    baths: 2,
    sqft: 1620,
    type: 'Townhouse',
    status: 'For Sale',
    aiValue: '670,000 — 705,000',
    tags: ['Investment Property', 'Pet-Friendly'],
    description:
      'Architect-designed inner-city townhome in walkable Bridgeland. Rooftop patio with downtown views, polished concrete floors, designer kitchen. Steps from cafes, breweries, and the Bow River pathway.',
    images: [
      _img('005-1', 'Modern Inner-City Exterior'),
      _img('005-2', 'Rooftop Patio · Downtown View'),
      _img('005-3', 'Designer Kitchen'),
      _img('005-4', 'Light-Filled Main Floor')
    ]
  },
  {
    id: 'kw-006',
    address: '1209 — 8 Avenue SE',
    neighborhood: 'Inglewood',
    price: 925000,
    beds: 3,
    baths: 2.5,
    sqft: 2010,
    type: 'Detached',
    status: 'For Sale',
    aiValue: '910,000 — 950,000',
    tags: ['Investment Property', 'Pet-Friendly'],
    description:
      'Heritage-inspired infill on a quiet tree-lined street. Wide-plank engineered oak, custom millwork, sun-drenched south yard, and detached garage. The best of historic Inglewood’s music and restaurant scene at your door.',
    images: [
      _img('006-1', 'Heritage-Inspired Facade'),
      _img('006-2', 'Engineered Oak Main Floor'),
      _img('006-3', 'South-Facing Yard'),
      _img('006-4', 'Custom Millwork Throughout'),
      _img('006-5', 'Detached Double Garage')
    ]
  },
  {
    id: 'kw-007',
    address: '54 Elbow Park Lane SW',
    neighborhood: 'Elbow Park',
    price: 2750000,
    beds: 5,
    baths: 5.5,
    sqft: 5120,
    type: 'Detached',
    status: 'For Sale',
    aiValue: '2,680,000 — 2,820,000',
    tags: ['Luxury', 'Near Schools'],
    description:
      'Storied Elbow Park estate on an oversized lot beside the river pathway. Restored leaded-glass windows, formal dining, library, and a coach house. Once-in-a-decade opportunity in one of Calgary’s most coveted enclaves.',
    images: [
      _img('007-1', 'Heritage Estate · Oversized Lot'),
      _img('007-2', 'Formal Dining'),
      _img('007-3', 'Library / Den'),
      _img('007-4', 'Restored Leaded Glass'),
      _img('007-5', 'Coach House')
    ]
  },
  {
    id: 'kw-008',
    address: '32 West Springs Terrace SW',
    neighborhood: 'West Springs',
    price: 1395000,
    beds: 4,
    baths: 3.5,
    sqft: 3120,
    type: 'Detached',
    status: 'For Sale',
    aiValue: '1,360,000 — 1,425,000',
    tags: ['Luxury', 'Near Schools'],
    description:
      'Refined family home in West Springs walking distance to top-ranked schools. Vaulted entry, white oak kitchen, glass-railed staircase, and a south-west yard built for hosting. Triple garage and bonus room.',
    images: [
      _img('008-1', 'Refined Curb Appeal'),
      _img('008-2', 'Vaulted Entry'),
      _img('008-3', 'White Oak Kitchen'),
      _img('008-4', 'South-West Yard'),
      _img('008-5', 'Bonus Room')
    ]
  }
];

/* Neighborhood directory used across pages */
window.NEIGHBORHOODS = [
  { name: 'Aspen Woods',  tag: 'Luxury Estates'      },
  { name: 'Beltline',     tag: 'Urban Condos'        },
  { name: 'Tuscany',      tag: 'Family-Friendly'     },
  { name: 'Mahogany',     tag: 'Lake Community'      },
  { name: 'Bridgeland',   tag: 'Inner City Lifestyle'},
  { name: 'Inglewood',    tag: 'Historic Charm'      },
  { name: 'Elbow Park',   tag: 'Estate / Heritage'   },
  { name: 'West Springs', tag: 'Top-Rated Schools'   }
];
