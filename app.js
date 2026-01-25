// Global state
let userData = null;
let userLocations = [];
let userObjects = [];
let userFood = [];
let masterLocations = [];
let totalStamps = 0;
let userId = null;

// Extract userId from URL parameter
function getUserIdFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('user_id');

  if (!id || id.trim() === '') {
    // No user_id found, redirect to registration
    window.location.href = 'register.html';
    return null;
  }

  return id.trim();
}

// API helper function
async function callAPI(action, data = {}) {
  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: action,
        ...data
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    // Check for error in response
    if (result.error || result._error) {
      throw new Error(result.error || result._error);
    }

    return result;
  } catch (error) {
    console.error(`API Error (${action}):`, error);
    throw error;
  }
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', function() {
  console.log('=== Page Loaded ===');

  // Get userId from URL
  userId = getUserIdFromURL();

  if (!userId) {
    console.error('No user_id found');
    return;
  }

  console.log('userId:', userId);

  // Load all data
  loadAllData();
});

// ===== DATA LOADING =====
async function loadAllData() {
  console.log('=== loadAllData() called ===');
  console.log('Loading data for userId:', userId);

  try {
    const data = await callAPI('getUserData', { userId: userId });

    console.log('=== getUserData RESPONSE ===');
    console.log('Data:', data);

    if (data && data.first_name) {
      console.log('✓ User found:', data.first_name, data.last_name);
      userData = data;
      updateUserInfo();
      setCoverColor(data.passport_color);

      // Load other data
      await Promise.all([
        loadLocations(),
        loadObjects(),
        loadFood(),
        loadMasterLocations(),
        getTotalStampsCount()
      ]);
    } else {
      console.error('✗ User not found');
      alert('User not found. Please check your URL or register again.');
      window.location.href = 'register.html';
    }
  } catch (error) {
    console.error('Error loading passport data:', error);
    alert('Error loading passport data: ' + error.message);
  }
}

async function loadLocations() {
  console.log('Loading locations...');
  try {
    const locations = await callAPI('getUserLocations', { userId: userId });
    console.log('✓ Locations loaded:', locations.length);
    userLocations = locations;
    displayStamps();
    updateProgress();
  } catch (error) {
    console.error('✗ Error loading locations:', error);
  }
}

async function loadObjects() {
  console.log('Loading objects...');
  try {
    const objects = await callAPI('getUserObjects', { userId: userId });
    console.log('✓ Objects loaded:', objects.length);
    userObjects = objects;
    displayCurrentlyViewing();
  } catch (error) {
    console.error('✗ Error loading objects:', error);
  }
}

async function loadFood() {
  console.log('Loading food...');
  try {
    const foods = await callAPI('getUserFood', { userId: userId });
    console.log('✓ Foods loaded:', foods.length);
    userFood = foods;
  } catch (error) {
    console.error('✗ Error loading food:', error);
  }
}

async function loadMasterLocations() {
  console.log('Loading master locations...');
  try {
    const locations = await callAPI('getMasterLocations');
    console.log('✓ Master locations loaded:', locations.length);
    masterLocations = locations.filter(loc => loc.is_active);
    populateLocationDropdowns();
  } catch (error) {
    console.error('✗ Error loading master locations:', error);
  }
}

async function getTotalStampsCount() {
  console.log('Getting total stamps count...');
  try {
    const count = await callAPI('getTotalStamps');
    console.log('✓ Total stamps:', count);
    totalStamps = count;
    updateProgress();
  } catch (error) {
    console.error('✗ Error getting total stamps:', error);
  }
}

// ===== DISPLAY FUNCTIONS =====
function updateUserInfo() {
  if (!userData) return;

  console.log('Updating user info:', userData.first_name);
  document.getElementById('userName').textContent = userData.first_name;
  document.getElementById('userInsta').textContent = userData.instagram_handle;
}

function setCoverColor(color) {
  console.log('Setting cover color:', color);
  const cover = document.querySelector('.passport-cover');
  if (cover && color) {
    cover.style.backgroundColor = color;
  }
}

function displayStamps() {
  const container = document.getElementById('stampsContainer');
  if (!container) return;

  container.innerHTML = '';

  if (userLocations.length === 0) {
    container.innerHTML = '<p style="color: #999; font-size: 14px;">No stamps yet</p>';
    return;
  }

  // Get unique places
  const uniquePlaces = [...new Set(userLocations.map(loc => loc.place))];

  uniquePlaces.forEach(place => {
    const masterLoc = masterLocations.find(ml => ml.place === place);
    const stampColor = masterLoc ? masterLoc.stamp_color : '#000000';

    const stampEl = document.createElement('div');
    stampEl.className = 'stamp';
    stampEl.onclick = () => showLocationDetail(place);

    stampEl.innerHTML = `
      <div class="stamp-icon" style="color: ${stampColor}">*</div>
      <div class="stamp-label">${place}</div>
    `;

    container.appendChild(stampEl);
  });
}

async function displayCurrentlyViewing() {
  const currentObjectEl = document.getElementById('currentObject');
  if (!currentObjectEl) return;

  try {
    const object = await callAPI('getCurrentlyViewing', { userId: userId });

    if (object) {
      currentObjectEl.textContent = object.object_name;
      currentObjectEl.style.cursor = 'pointer';
      currentObjectEl.onclick = () => showLocationDetail(object.place);
    } else {
      currentObjectEl.textContent = '—';
      currentObjectEl.style.cursor = 'default';
      currentObjectEl.onclick = null;
    }
  } catch (error) {
    console.error('Error loading currently viewing:', error);
  }
}

function updateProgress() {
  const userStampsEl = document.getElementById('userStamps');
  const totalStampsEl = document.getElementById('totalStamps');
  const progressFill = document.getElementById('progressFill');

  if (!userStampsEl || !totalStampsEl || !progressFill) return;

  const uniquePlaces = [...new Set(userLocations.map(loc => loc.place))];
  const userCount = uniquePlaces.length;

  userStampsEl.textContent = userCount;
  totalStampsEl.textContent = totalStamps;

  const percentage = totalStamps > 0 ? (userCount / totalStamps) * 100 : 0;
  progressFill.style.width = percentage + '%';
}

function populateLocationDropdowns() {
  const selects = [
    document.getElementById('objectPlace'),
    document.getElementById('foodPlace'),
    document.getElementById('stampPlace')
  ];

  selects.forEach(select => {
    if (!select) return;

    select.innerHTML = '<option value="">Select place...</option>';

    masterLocations.forEach(location => {
      const option = document.createElement('option');
      option.value = location.place;
      option.textContent = location.place;
      select.appendChild(option);
    });
  });
}

// ===== VIEW NAVIGATION =====
function openPassport() {
  console.log('=== openPassport() called ===');

  if (!userData) {
    console.log('⚠️ No user data yet, waiting...');
    alert('Please wait for data to load before opening passport');
    return;
  }

  console.log('✓ Opening passport for:', userData.first_name);
  document.getElementById('coverView').classList.remove('active');
  document.getElementById('interiorView').classList.add('active');
}

// ===== COLOR PICKER =====
function showColorPicker() {
  document.getElementById('colorPickerModal').classList.add('active');
}

function hideColorPicker() {
  document.getElementById('colorPickerModal').classList.remove('active');
}

async function selectColor(color) {
  try {
    const result = await callAPI('updatePassportColor', { userId: userId, newColor: color });

    if (result.success) {
      setCoverColor(color);
      userData.passport_color = color;
      hideColorPicker();
    } else {
      alert('Error updating color: ' + result.message);
    }
  } catch (error) {
    alert('Error: ' + error.message);
  }
}

// ===== CREATE OBJECT =====
function showCreateObject() {
  document.getElementById('createObjectModal').classList.add('active');
}

function hideCreateObject() {
  document.getElementById('createObjectModal').classList.remove('active');
  document.getElementById('objectForm').reset();
}

document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('objectForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const place = document.getElementById('objectPlace').value;
    const type = document.getElementById('objectType').value;
    const name = document.getElementById('objectName').value;
    const notes = document.getElementById('objectNotes').value;

    try {
      const result = await callAPI('addObject', {
        userId: userId,
        place: place,
        objectType: type,
        objectName: name,
        notes: notes
      });

      if (result.success) {
        alert(result.message);
        hideCreateObject();
        loadObjects();
      } else {
        alert('Error: ' + result.message);
      }
    } catch (error) {
      alert('Error: ' + error.message);
    }
  });
});

// ===== CREATE FOOD =====
function showCreateFood() {
  document.getElementById('createFoodModal').classList.add('active');
}

function hideCreateFood() {
  document.getElementById('createFoodModal').classList.remove('active');
  document.getElementById('foodForm').reset();
}

document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('foodForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const place = document.getElementById('foodPlace').value;
    const dishName = document.getElementById('dishName').value;

    try {
      const result = await callAPI('addFood', {
        userId: userId,
        place: place,
        dishName: dishName
      });

      if (result.success) {
        alert(result.message);
        hideCreateFood();
        loadFood();
      } else {
        alert('Error: ' + result.message);
      }
    } catch (error) {
      alert('Error: ' + error.message);
    }
  });
});

// ===== STAMP PASSPORT =====
function showStampPassport() {
  document.getElementById('stampModal').classList.add('active');
}

function hideStampPassport() {
  document.getElementById('stampModal').classList.remove('active');
  document.getElementById('stampForm').reset();
}

document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('stampForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const place = document.getElementById('stampPlace').value;

    try {
      const result = await callAPI('stampPassport', {
        userId: userId,
        place: place
      });

      if (result.success) {
        alert(result.message);
        hideStampPassport();
        loadLocations();
      } else {
        alert('Error: ' + result.message);
      }
    } catch (error) {
      alert('Error: ' + error.message);
    }
  });
});

// ===== QR CODE =====
function showQRCode() {
  const modal = document.getElementById('qrModal');
  const container = document.getElementById('qrCodeContainer');
  const urlEl = document.getElementById('qrUrl');

  if (userData && userData.unique_url) {
    container.innerHTML = `
      <div style="width: 200px; height: 200px; border: 2px solid black; display: flex; align-items: center; justify-content: center; font-size: 12px; text-align: center; padding: 20px;">
        QR Code<br>for<br>${userData.unique_url}
      </div>
    `;
    urlEl.textContent = userData.unique_url;
    modal.classList.add('active');
  }
}

function hideQRCode() {
  document.getElementById('qrModal').classList.remove('active');
}

// ===== LOCATION DETAIL =====
function showLocationDetail(place) {
  const modal = document.getElementById('locationModal');
  const detailDiv = document.getElementById('locationDetail');

  const location = userLocations.find(loc => loc.place === place);
  const object = userObjects.find(obj => obj.place === place);
  const food = userFood.find(f => f.place === place);
  const masterLoc = masterLocations.find(ml => ml.place === place);

  let html = `<h3 style="color: ${masterLoc ? masterLoc.stamp_color : '#000'}">* ${place}</h3>`;

  if (location) {
    const visitDate = new Date(location.date_visited);
    html += `<p><strong>Date:</strong> ${visitDate.toLocaleDateString()}</p>`;
  }

  if (object) {
    html += `<p><strong>Object Type:</strong> ${object.object_type}</p>`;
    html += `<p><strong>Object Name:</strong> ${object.object_name}</p>`;
    if (object.notes) {
      html += `<p><strong>Notes:</strong> ${object.notes}</p>`;
    }
  }

  if (food) {
    html += `<p><strong>Food:</strong> ${food.dish_name}</p>`;
  }

  detailDiv.innerHTML = html;
  modal.classList.add('active');
}

function hideLocationDetail() {
  document.getElementById('locationModal').classList.remove('active');
}
