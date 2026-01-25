// ===================================
// 215 SUPPER CLUB - APPS SCRIPT CODE
// UPDATED FOR GITHUB PAGES HOSTING
// ===================================

// SPREADSHEET CONFIGURATION
var SPREADSHEET_ID = '1gysphll2EX78L0xHDAwyPIVuVArbqKTEicfSXvekmAQ';

// GITHUB PAGES URL - Update this after deploying to GitHub
var GITHUB_PAGES_URL = 'https://5chau.github.io/passport_app/';

var CODE_VERSION = "v3.0-github"; // Updated version for GitHub Pages migration

// Get sheet references
function getSheets() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  return {
    users: ss.getSheetByName('Users'),
    locations: ss.getSheetByName('Locations'),
    objects: ss.getSheetByName('Objects'),
    food: ss.getSheetByName('Food'),
    masterLocations: ss.getSheetByName('Master_Locations')
  };
}

// ===================================
// WEB APP - MAIN ENTRY POINTS
// ===================================

// Handle GET requests (no longer serving HTML)
// Handle GET requests - API endpoint
function doGet(e) {
  try {
    var params = e.parameter;
    var action = params.action;
    var result;

    Logger.log('API Request - Action: ' + action);
    Logger.log('Request params: ' + JSON.stringify(params));

    switch(action) {
      case 'registerUser':
        result = registerUser(params.firstName, params.lastName, params.instaHandle);
        break;

      case 'getUserData':
        result = getUserData(params.userId);
        break;

      case 'getUserLocations':
        result = getUserLocations(params.userId);
        break;

      case 'getUserObjects':
        result = getUserObjects(params.userId);
        break;

      case 'getUserFood':
        result = getUserFood(params.userId);
        break;

      case 'getMasterLocations':
        result = getMasterLocations();
        break;

      case 'getCurrentlyViewing':
        result = getCurrentlyViewing(params.userId);
        break;

      case 'getTotalStamps':
        result = getTotalStamps();
        break;

      case 'updatePassportColor':
        result = updatePassportColor(params.userId, params.newColor);
        break;

      case 'addObject':
        result = addObject(params.userId, params.place, params.objectType, params.objectName, params.notes || '');
        break;

      case 'addFood':
        result = addFood(params.userId, params.place, params.dishName);
        break;

      case 'stampPassport':
        result = stampPassport(params.userId, params.place);
        break;

      case 'getAdminStatus':
        result = getAdminStatus(params.userId);
        break;

      case 'setLocation':
        result = setLocation(params.userId, params.place, params.stampColor);
        break;

      default:
        // No action provided - show API info page
        return HtmlService.createHtmlOutput(
          '<h1>215 Supper Club API</h1>' +
          '<p>This is the backend API for 215 Supper Club Passport.</p>' +
          '<p>Please use your unique passport link to access your passport.</p>'
        );
    }

    Logger.log('API Response: ' + JSON.stringify(result));

    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);

  } catch(error) {
    Logger.log('API Error: ' + error.message);
    Logger.log('Stack trace: ' + error.stack);

    return ContentService
      .createTextOutput(JSON.stringify({
        error: error.message,
        stack: error.stack
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Handle POST requests (API endpoints)
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var action = data.action;
    var result;

    Logger.log('API Request - Action: ' + action);
    Logger.log('Request data: ' + JSON.stringify(data));

    switch(action) {
      // User registration
      case 'registerUser':
        result = registerUser(data.firstName, data.lastName, data.instaHandle);
        break;

      // User data retrieval
      case 'getUserData':
        result = getUserData(data.userId);
        break;

      case 'getUserLocations':
        result = getUserLocations(data.userId);
        break;

      case 'getUserObjects':
        result = getUserObjects(data.userId);
        break;

      case 'getUserFood':
        result = getUserFood(data.userId);
        break;

      case 'getMasterLocations':
        result = getMasterLocations();
        break;

      case 'getCurrentlyViewing':
        result = getCurrentlyViewing(data.userId);
        break;

      case 'getTotalStamps':
        result = getTotalStamps();
        break;

      // User actions
      case 'updatePassportColor':
        result = updatePassportColor(data.userId, data.newColor);
        break;

      case 'addObject':
        result = addObject(data.userId, data.place, data.objectType, data.objectName, data.notes);
        break;

      case 'addFood':
        result = addFood(data.userId, data.place, data.dishName);
        break;

      case 'stampPassport':
        result = stampPassport(data.userId, data.place);
        break;

      // Admin functions
      case 'getAdminStatus':
        result = getAdminStatus(data.userId);
        break;

      case 'setLocation':
        result = setLocation(data.userId, data.place, data.stampColor);
        break;

      default:
        result = {error: 'Unknown action: ' + action};
    }

    Logger.log('API Response: ' + JSON.stringify(result));

    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);

  } catch(error) {
    Logger.log('API Error: ' + error.message);
    Logger.log('Stack trace: ' + error.stack);

    return ContentService
      .createTextOutput(JSON.stringify({
        error: error.message,
        stack: error.stack
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ===================================
// USER REGISTRATION
// ===================================

function registerUser(firstName, lastName, instaHandle) {
  try {
    Logger.log('Registering new user: ' + firstName + ' ' + lastName);

    var userId = generateUserId();
    var passportColor = "#FFB6C1"; // default pink
    var createdDate = new Date();
    var uniqueUrl = GITHUB_PAGES_URL + "?user_id=" + userId;
    var isAdmin = false;

    var sheets = getSheets();
    sheets.users.appendRow([
      userId,
      firstName,
      lastName,
      instaHandle,
      passportColor,
      createdDate,
      uniqueUrl,
      isAdmin
    ]);

    Logger.log('User created successfully with ID: ' + userId);

    return {
      success: true,
      userId: userId,
      uniqueUrl: uniqueUrl,
      message: 'User registered successfully!'
    };
  } catch(error) {
    Logger.log('Error in registerUser: ' + error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

function generateUserId() {
  var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  var result = '';
  for (var i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// ===================================
// API ENDPOINTS - DATA RETRIEVAL
// ===================================

function getUserData(userId) {
  var debugInfo = [];

  try {
    debugInfo.push('Starting getUserData');
    debugInfo.push('Received userId: "' + userId + '" (type: ' + typeof userId + ')');

    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    SpreadsheetApp.flush();
    debugInfo.push('Spreadsheet opened');

    var usersSheet = ss.getSheetByName('Users');
    if (!usersSheet) {
      Logger.log('ERROR: Users sheet not found!');
      return { _error: 'Users sheet not found' };
    }

    var usersData = usersSheet.getDataRange().getValues();
    debugInfo.push('Data read: ' + usersData.length + ' rows');

    var cleanUserId = String(userId).trim();
    debugInfo.push('Cleaned userId: "' + cleanUserId + '"');

    Logger.log('=== getUserData DEBUG ===');
    Logger.log('Incoming userId: "' + userId + '"');
    Logger.log('Cleaned userId: "' + cleanUserId + '"');
    Logger.log('Total rows in sheet: ' + usersData.length);

    if (usersData.length <= 1) {
      Logger.log('ERROR: No user data in sheet');
      return { _error: 'No user data in sheet' };
    }

    // Find user (skip header row)
    for (var i = 1; i < usersData.length; i++) {
      var sheetUserId = String(usersData[i][0]).trim();

      if (sheetUserId === cleanUserId) {
        Logger.log('MATCH FOUND at row ' + i);

        var userData = {
          user_id: usersData[i][0],
          first_name: usersData[i][1],
          last_name: usersData[i][2],
          instagram_handle: usersData[i][3],
          passport_color: usersData[i][4],
          created_date: usersData[i][5],
          unique_url: usersData[i][6],
          is_admin: usersData[i][7] || false
        };

        Logger.log('Returning user data for: ' + userData.first_name);
        return userData;
      }
    }

    Logger.log('NO MATCH FOUND');
    return {
      _error: 'User not found',
      _userId: cleanUserId,
      _rowsChecked: usersData.length - 1
    };

  } catch (error) {
    Logger.log('ERROR in getUserData: ' + error.message);
    return {
      _error: error.message
    };
  }
}

function getUserLocations(userId) {
  var sheets = getSheets();
  var locationsData = sheets.locations.getDataRange().getValues();
  var locations = [];

  for (var i = 1; i < locationsData.length; i++) {
    if (locationsData[i][0] === userId) {
      locations.push({
        user_id: locationsData[i][0],
        place: locationsData[i][1],
        date_visited: locationsData[i][2],
        stamp_date: locationsData[i][3]
      });
    }
  }

  return locations;
}

function getUserObjects(userId) {
  var sheets = getSheets();
  var objectsData = sheets.objects.getDataRange().getValues();
  var objects = [];

  for (var i = 1; i < objectsData.length; i++) {
    if (objectsData[i][0] === userId) {
      objects.push({
        user_id: objectsData[i][0],
        place: objectsData[i][1],
        object_type: objectsData[i][2],
        object_name: objectsData[i][3],
        notes: objectsData[i][4],
        date_added: objectsData[i][5]
      });
    }
  }

  return objects;
}

function getUserFood(userId) {
  var sheets = getSheets();
  var foodData = sheets.food.getDataRange().getValues();
  var foods = [];

  for (var i = 1; i < foodData.length; i++) {
    if (foodData[i][0] === userId) {
      foods.push({
        user_id: foodData[i][0],
        place: foodData[i][1],
        dish_name: foodData[i][2],
        date_added: foodData[i][3]
      });
    }
  }

  return foods;
}

function getMasterLocations() {
  var sheets = getSheets();
  var masterData = sheets.masterLocations.getDataRange().getValues();
  var locations = [];

  for (var i = 1; i < masterData.length; i++) {
    locations.push({
      location_id: masterData[i][0],
      place: masterData[i][1],
      stamp_color: masterData[i][2],
      date_set: masterData[i][3],
      is_active: masterData[i][4]
    });
  }

  return locations;
}

function getCurrentlyViewing(userId) {
  var objects = getUserObjects(userId);

  objects.sort(function(a, b) {
    return new Date(b.date_added) - new Date(a.date_added);
  });

  return objects.length > 0 ? objects[0] : null;
}

function getTotalStamps() {
  var sheets = getSheets();
  var masterData = sheets.masterLocations.getDataRange().getValues();

  var count = 0;
  for (var i = 1; i < masterData.length; i++) {
    if (masterData[i][4] === true) {
      count++;
    }
  }

  return count;
}

// ===================================
// API ENDPOINTS - DATA MODIFICATION
// ===================================

function updatePassportColor(userId, newColor) {
  var sheets = getSheets();
  var usersData = sheets.users.getDataRange().getValues();

  for (var i = 1; i < usersData.length; i++) {
    if (usersData[i][0] === userId) {
      sheets.users.getRange(i + 1, 5).setValue(newColor);
      return { success: true, message: 'Passport color updated!' };
    }
  }

  return { success: false, message: 'User not found' };
}

function addObject(userId, place, objectType, objectName, notes) {
  var sheets = getSheets();
  var dateAdded = new Date();

  sheets.objects.appendRow([
    userId,
    place,
    objectType,
    objectName,
    notes || '',
    dateAdded
  ]);

  return { success: true, message: 'Object added!' };
}

function addFood(userId, place, dishName) {
  var sheets = getSheets();
  var dateAdded = new Date();

  sheets.food.appendRow([
    userId,
    place,
    dishName,
    dateAdded
  ]);

  return { success: true, message: 'Food added!' };
}

function stampPassport(userId, place) {
  var sheets = getSheets();
  var stampDate = new Date();
  var dateVisited = stampDate;

  sheets.locations.appendRow([
    userId,
    place,
    dateVisited,
    stampDate
  ]);

  return { success: true, message: 'Passport stamped!' };
}

// ===================================
// ADMIN FUNCTIONS
// ===================================

function isAdmin(userId) {
  var sheets = getSheets();
  var usersData = sheets.users.getDataRange().getValues();

  for (var i = 1; i < usersData.length; i++) {
    if (usersData[i][0] === userId) {
      return usersData[i][7] || false;
    }
  }

  return false;
}

function setLocation(userId, place, stampColor) {
  if (!isAdmin(userId)) {
    return { success: false, message: 'Unauthorized: Admin access required' };
  }

  var sheets = getSheets();
  var locationId = generateLocationId();
  var dateSet = new Date();
  var isActive = true;

  sheets.masterLocations.appendRow([
    locationId,
    place,
    stampColor,
    dateSet,
    isActive
  ]);

  return { success: true, message: 'Location added successfully!' };
}

function generateLocationId() {
  var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  var result = 'LOC_';
  for (var i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function getAdminStatus(userId) {
  return { is_admin: isAdmin(userId) };
}

// ===================================
// UTILITY FUNCTIONS
// ===================================

function getVersion() {
  return {
    version: CODE_VERSION,
    timestamp: new Date().toString()
  };
}

// Update existing user URLs to GitHub Pages format
function updateAllUrlsToGitHubPages() {
  var sheets = getSheets();
  var usersSheet = sheets.users;
  var usersData = usersSheet.getDataRange().getValues();

  Logger.log('Updating all URLs to GitHub Pages: ' + GITHUB_PAGES_URL);

  for (var i = 1; i < usersData.length; i++) {
    var userId = usersData[i][0];
    var newUrl = GITHUB_PAGES_URL + "?user_id=" + userId;
    usersSheet.getRange(i + 1, 7).setValue(newUrl);
    Logger.log('Updated ' + userId + ': ' + newUrl);
  }

  Logger.log('=== COMPLETE ===');
  Logger.log('All ' + (usersData.length - 1) + ' user URLs updated!');
}
