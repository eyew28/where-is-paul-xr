(function attachEraGalleries() {
  const W = 'https://upload.wikimedia.org/wikipedia/commons';

  function photo(src, alt, credit) {
    return { src: src, alt: alt, credit: credit };
  }

  const galleries = {
    'varna-1988-11-24': [
      photo(W + '/2/2f/Varna_Bulgaria_garden.jpg', 'Sea Garden, Varna', 'Wikimedia Commons'),
      photo(W + '/3/3f/Varna_Cathedral_-_2.jpg', 'Dormition Cathedral, Varna', 'Wikimedia Commons'),
      photo(W + '/thumb/2/22/Beach_Scene_-_Primorski_Park_-_Varna_-_Bulgaria_%2842438341874%29.jpg/1280px-Beach_Scene_-_Primorski_Park_-_Varna_-_Bulgaria_%2842438341874%29.jpg', 'Black Sea beach by Primorski Park', 'Adam Jones (CC BY-SA 2.0)'),
      photo(W + '/thumb/0/05/Varna_beach_at_sunset.jpg/1280px-Varna_beach_at_sunset.jpg', 'Varna beach at sunset', 'Alex Yosifov (CC BY-SA 2.0)'),
      photo(W + '/thumb/e/ef/Sea_Garden_%28Varna%29.jpg/1280px-Sea_Garden_%28Varna%29.jpg', 'Sea Garden alleys', 'Stanqo (CC BY 4.0)')
    ],
    'sofia-1994-11-24': [
      photo(W + '/2/2f/Panoramic_view_over_central_Sofia_and_the_Vitosha_Mountain_2017-10-08.jpg', 'Sofia with Vitosha behind it', 'Wikimedia Commons'),
      photo(W + '/thumb/c/c0/Catedral_de_Alejandro_Nevski_--_2019_--_Sof%C3%ADa%2C_Bulgaria.jpg/1280px-Catedral_de_Alejandro_Nevski_--_2019_--_Sof%C3%ADa%2C_Bulgaria.jpg', 'Alexander Nevsky Cathedral', 'Wikimedia Commons'),
      photo(W + '/6/61/Vitosha_boulevard%2C_Sofia.jpg', 'Vitosha Boulevard', 'Wikimedia Commons'),
      photo(W + '/e/ec/National_Palace_of_Culture_%2823997858848%29.jpg', 'National Palace of Culture', 'Wikimedia Commons')
    ],
    'chicago-2005-02-01': [
      photo(W + '/a/a5/Chicago_River_ferry_b.jpg', 'Chicago River', 'Wikimedia Commons'),
      photo(W + '/thumb/1/19/Millennium_Square%2C_Chicago%2C_Illinois_%289181701264%29.jpg/1280px-Millennium_Square%2C_Chicago%2C_Illinois_%289181701264%29.jpg', 'Millennium Park', 'Wikimedia Commons'),
      photo(W + '/thumb/b/b2/Montrose_Beach.JPG/1280px-Montrose_Beach.JPG', 'Chicago lakefront beach', 'Wikimedia Commons'),
      photo(W + '/4/47/Chicago_Theatre_at_night.jpg', 'Chicago Theatre', 'Wikimedia Commons')
    ],
    'medellin-2022-07-02': [
      photo(W + '/5/5a/Medellin_Colombia.jpg', 'Medellín from the hills', 'Wikimedia Commons'),
      photo(W + '/3/3a/Metrocable_Medellin.jpg', 'Metrocable over Medellín', 'Wikimedia Commons'),
      photo(W + '/6/6e/Comuna_13_Medellin.jpg', 'Comuna 13', 'Wikimedia Commons'),
      photo(W + '/d/d4/Pueblito_Paisa.jpg', 'Pueblito Paisa', 'Wikimedia Commons')
    ],
    'medellin-2022-11-01': [
      photo(W + '/5/5a/Medellin_Colombia.jpg', 'Medellín from the hills', 'Wikimedia Commons'),
      photo(W + '/3/3a/Metrocable_Medellin.jpg', 'Metrocable over Medellín', 'Wikimedia Commons'),
      photo(W + '/6/6e/Comuna_13_Medellin.jpg', 'Comuna 13 street art', 'Wikimedia Commons'),
      photo(W + '/0/0e/Botero_Plaza_Medellin.jpg', 'Plaza Botero', 'Wikimedia Commons')
    ],
    'miami-beach-2024-12-29': [
      photo(W + '/1/16/Ocean_Drive_Miami_Beach.jpg', 'Ocean Drive, South Beach', 'Wikimedia Commons'),
      photo(W + '/e/e3/Miami_Beach_Art_Deco.jpg', 'Art Deco District', 'Wikimedia Commons'),
      photo(W + '/8/8a/Lummus_Park_Miami_Beach.jpg', 'Lummus Park', 'Wikimedia Commons'),
      photo(W + '/4/4c/South_Beach_lifeguard_tower.jpg', 'South Beach lifeguard tower', 'Wikimedia Commons')
    ],
    'miami-beach-2025-05-23': [
      photo(W + '/1/16/Ocean_Drive_Miami_Beach.jpg', 'Ocean Drive', 'Wikimedia Commons'),
      photo(W + '/e/e3/Miami_Beach_Art_Deco.jpg', 'Art Deco South Beach', 'Wikimedia Commons'),
      photo(W + '/8/8a/Lummus_Park_Miami_Beach.jpg', 'Lummus Park volleyball courts', 'Wikimedia Commons'),
      photo(W + '/2/2d/Miami_Beach_from_above.jpg', 'Miami Beach from above', 'Wikimedia Commons')
    ],
    'boulder-2025-05-13': [
      photo(W + '/3/35/Flatirons_Boulder.jpg', 'The Flatirons', 'Wikimedia Commons'),
      photo(W + '/a/a8/Pearl_Street_Mall_Boulder.jpg', 'Pearl Street Mall', 'Wikimedia Commons'),
      photo(W + '/7/7c/Chautauqua_Park_Boulder.jpg', 'Chautauqua Park', 'Wikimedia Commons'),
      photo(W + '/1/1e/Boulder_Colorado_downtown.jpg', 'Downtown Boulder', 'Wikimedia Commons')
    ],
    'san-diego-2025-05-20': [
      photo(W + '/5/54/Mission_Beach_San_Diego.jpg', 'Mission Beach', 'Wikimedia Commons'),
      photo(W + '/d/d1/Gaslamp_Quarter_San_Diego.jpg', 'Gaslamp Quarter', 'Wikimedia Commons'),
      photo(W + '/9/9a/San_Diego_skyline.jpg', 'San Diego skyline', 'Wikimedia Commons'),
      photo(W + '/2/24/Balboa_Park_San_Diego.jpg', 'Balboa Park', 'Wikimedia Commons')
    ],
    'san-diego-2025-06-01': [
      photo(W + '/5/54/Mission_Beach_San_Diego.jpg', 'South Mission Beach', 'Wikimedia Commons'),
      photo(W + '/9/9a/San_Diego_skyline.jpg', 'San Diego skyline under June Gloom', 'Wikimedia Commons'),
      photo(W + '/c/c8/Pacific_Beach_San_Diego.jpg', 'Pacific Beach', 'Wikimedia Commons'),
      photo(W + '/2/24/Balboa_Park_San_Diego.jpg', 'Balboa Park', 'Wikimedia Commons')
    ],
    'fort-lauderdale-2025-05-21': [
      photo(W + '/6/60/Fort_Lauderdale_Beach.jpg', 'Fort Lauderdale Beach', 'Wikimedia Commons'),
      photo(W + '/a/a1/Las_Olas_Boulevard.jpg', 'Las Olas', 'Wikimedia Commons'),
      photo(W + '/3/33/Fort_Lauderdale_skyline.jpg', 'Fort Lauderdale skyline', 'Wikimedia Commons'),
      photo(W + '/8/81/Deerfield_Beach_Florida.jpg', 'Deerfield Beach', 'Wikimedia Commons')
    ],
    'tampa-2025-05-30': [
      photo(W + '/4/4f/Tampa_skyline.jpg', 'Tampa skyline', 'Wikimedia Commons'),
      photo(W + '/1/1c/Ybor_City.jpg', 'Ybor City', 'Wikimedia Commons'),
      photo(W + '/e/e2/Tampa_Riverwalk.jpg', 'Tampa Riverwalk', 'Wikimedia Commons'),
      photo(W + '/7/78/St_Petersburg_Florida_pier.jpg', 'St. Pete waterfront', 'Wikimedia Commons')
    ],
    'beirut-2023-08-09': [
      photo(W + '/8/8d/Beirut_Corniche.jpg', 'Beirut Corniche', 'Wikimedia Commons'),
      photo(W + '/2/2a/Raouche_Rocks_Beirut.jpg', 'Raouché rocks', 'Wikimedia Commons'),
      photo(W + '/0/0b/Beirut_downtown.jpg', 'Downtown Beirut', 'Wikimedia Commons')
    ],
    'athens-2023-08-18': [
      photo(W + '/a/a1/Acropolis_of_Athens_013.JPG', 'The Acropolis', 'Wikimedia Commons'),
      photo(W + '/d/da/Parthenon_from_west.jpg', 'The Parthenon', 'Wikimedia Commons'),
      photo(W + '/4/4a/Plaka_Athens.jpg', 'Plaka', 'Wikimedia Commons'),
      photo(W + '/c/c5/Temple_of_Olympian_Zeus_Athens.jpg', 'Temple of Olympian Zeus', 'Wikimedia Commons')
    ],
    'barcelona-2023-08-21': [
      photo(W + '/9/9b/Sagrada_Familia_01.jpg', 'Sagrada Família', 'Wikimedia Commons'),
      photo(W + '/a/a2/Park_Guell_Barcelona.jpg', 'Park Güell', 'Wikimedia Commons'),
      photo(W + '/3/3e/La_Rambla_Barcelona.jpg', 'La Rambla', 'Wikimedia Commons'),
      photo(W + '/1/15/Casa_Batllo_Barcelona.jpg', 'Casa Batlló', 'Wikimedia Commons')
    ],
    'dubai-2023-10-05': [
      photo(W + '/0/09/Burj_Khalifa.jpg', 'Burj Khalifa', 'Wikimedia Commons'),
      photo(W + '/5/5d/Dubai_Marina.jpg', 'Dubai Marina', 'Wikimedia Commons'),
      photo(W + '/a/a4/Dubai_desert.jpg', 'Dubai desert', 'Wikimedia Commons'),
      photo(W + '/2/26/Dubai_Creek.jpg', 'Dubai Creek', 'Wikimedia Commons')
    ],
    'st-petersburg-2023-01-01': [
      photo(W + '/7/78/St_Petersburg_Florida_pier.jpg', 'St. Pete pier', 'Wikimedia Commons'),
      photo(W + '/4/41/St_Petersburg_Florida_downtown.jpg', 'Downtown St. Petersburg', 'Wikimedia Commons'),
      photo(W + '/b/b1/St_Pete_Beach.jpg', 'St. Pete Beach', 'Wikimedia Commons'),
      photo(W + '/9/91/Salvador_Dali_Museum.jpg', 'Dalí Museum', 'Wikimedia Commons')
    ],
    'honolulu-2024-09-01': [
      photo(W + '/d/dc/Waikiki_Beach.jpg', 'Waikiki', 'Wikimedia Commons'),
      photo(W + '/4/4e/Diamond_Head_Honolulu.jpg', 'Diamond Head', 'Wikimedia Commons'),
      photo(W + '/a/a8/Honolulu_skyline.jpg', 'Honolulu', 'Wikimedia Commons'),
      photo(W + '/1/1c/Ala_Moana_Beach.jpg', 'Ala Moana', 'Wikimedia Commons')
    ],
    'honolulu-2025-06-13': [
      photo(W + '/d/dc/Waikiki_Beach.jpg', 'Waikiki', 'Wikimedia Commons'),
      photo(W + '/4/4e/Diamond_Head_Honolulu.jpg', 'Diamond Head', 'Wikimedia Commons'),
      photo(W + '/a/a8/Honolulu_skyline.jpg', 'Honolulu', 'Wikimedia Commons')
    ]
  };

  function apply() {
    const moments = window.momentsInTime;
    if (!Array.isArray(moments)) return;
    moments.forEach(function (m) {
      if (galleries[m.id]) m.gallery = galleries[m.id];
    });
  }

  apply();
  window.attachEraGalleries = apply;
})();
