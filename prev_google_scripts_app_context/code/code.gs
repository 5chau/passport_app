// ===================================
// 215 SUPPER CLUB - APPS SCRIPT CODE
// ===================================

// SPREADSHEET CONFIGURATION
var SPREADSHEET_ID = '1gysphll2EX78L0xHDAwyPIVuVArbqKTEicfSXvekmAQ';

var CODE_VERSION = "v2.0"; // Change this number each deployment

// Add this function:
function getVersion() {
  return {
    version: CODE_VERSION,
    timestamp: new Date().toString()
  };
}

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
// FORM SUBMISSION HANDLER
// ===================================

function onFormSubmit(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet();
  var formSheet = sheet.getSheetByName("Form Responses 1");
  var dataSheet = sheet.getSheetByName("Users");
  
  var lastRow = formSheet.getLastRow();
  
  // Get form data
  var timestamp = formSheet.getRange(lastRow, 1).getValue();
  var firstName = formSheet.getRange(lastRow, 2).getValue();
  var lastName = formSheet.getRange(lastRow, 3).getValue();
  var instaHandle = formSheet.getRange(lastRow, 4).getValue().toLowerCase().replace('@', '');
  
  // Generate unique user_id
  var userId = generateUserId();
  
  // Default passport color
  var passportColor = "#FDFBD4"; // cream default
  
  // Current date
  var createdDate = new Date();
  
  // Generate unique URL with query parameter
  // IMPORTANT: Use your production deployment URL
  var webAppUrl = 'https://script.google.com/macros/s/AKfycbwu2_wqOdhz6ShGPDhhFMIhMyHcB2fQyXuPMXoi4gU6w002lIv0xYCVDk7NU9mmz0u8bw/exec';
  var uniqueUrl = webAppUrl + "?user_id=" + userId;
  
  // Default is_admin to FALSE
  var isAdmin = false;
  
  // Add to main Users sheet
  dataSheet.appendRow([
    userId,
    firstName,
    lastName,
    instaHandle,
    passportColor,
    createdDate,
    uniqueUrl,
    isAdmin
  ]);
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
// POPULATE MISSING UNIQUE URLs
// ===================================

function updateAllUrlsToNewDeployment() {
  var sheets = getSheets();
  var usersSheet = sheets.users;
  var usersData = usersSheet.getDataRange().getValues();
  
  // !!! PASTE YOUR NEW DEPLOYMENT URL HERE !!!
  var webAppUrl = 'https://script.google.com/macros/s/AKfycbzYh9hQLxZyvLEmTNv-4HX0pv-ZhYsXQj6xvRnKhwB68mndT49z5nhBnnUhUXzZYj1urA/exec'; // ending in /exec
  
  // Remove trailing slash if present
  if (webAppUrl.endsWith('/')) {
    webAppUrl = webAppUrl.slice(0, -1);
  }
  
  Logger.log('Updating all URLs to: ' + webAppUrl);
  
  // Start from row 2 (skip header)
  for (var i = 1; i < usersData.length; i++) {
    var userId = usersData[i][0]; // Column A
    var newUrl = webAppUrl + "?user_id=" + userId;
    usersSheet.getRange(i + 1, 7).setValue(newUrl); // Column G
    Logger.log('Updated ' + userId + ': ' + newUrl);
  }
  
  Logger.log('=== COMPLETE ===');
  Logger.log('All ' + (usersData.length - 1) + ' user URLs updated!');
}

// ===================================
// WEB APP - MAIN ENTRY POINT
// ===================================

function doGet(e) {
  // Check if user_id parameter exists
  if (e.parameter.user_id) {
    return servePassport(e.parameter.user_id);
  } else {
    // No user_id provided
    return HtmlService.createHtmlOutput('<h1>Invalid URL</h1><p>Please use your unique passport link.</p>');
  }
}

function servePassport(userId) {
  var template = HtmlService.createTemplateFromFile('Passport');
  template.userId = userId;
  
  return template.evaluate()
    .setTitle('215 Supper Club Passport')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

// Include CSS and JS files
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// ===================================
// API ENDPOINTS - DATA RETRIEVAL
// ===================================

function getUserData(userId) {
  var debugInfo = [];
  
  try {
    debugInfo.push('Starting getUserData');
    debugInfo.push('Received userId: "' + userId + '" (type: ' + typeof userId + ')');
    
    // Force fresh spreadsheet connection
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    SpreadsheetApp.flush(); // Force any pending changes to complete
    debugInfo.push('Spreadsheet opened');
    
    var usersSheet = ss.getSheetByName('Users');
    if (!usersSheet) {
      Logger.log('ERROR: Users sheet not found!');
      debugInfo.push('ERROR: Users sheet not found!');
      Logger.log('DEBUG INFO: ' + debugInfo.join(' | '));
      return null;
    }
    debugInfo.push('Users sheet found');
    
    // Force fresh data read
    var usersData = usersSheet.getDataRange().getValues();
    debugInfo.push('Data read: ' + usersData.length + ' rows');
    
    // Clean the incoming userId - trim whitespace and convert to string
    var cleanUserId = String(userId).trim();
    debugInfo.push('Cleaned userId: "' + cleanUserId + '"');
    
    Logger.log('=== getUserData DEBUG ===');
    Logger.log('Incoming userId: "' + userId + '"');
    Logger.log('Cleaned userId: "' + cleanUserId + '"');
    Logger.log('Total rows in sheet: ' + usersData.length);
    
    // Validate we have data
    if (usersData.length <= 1) {
      Logger.log('ERROR: No user data in sheet (only header row)');
      debugInfo.push('ERROR: Only header row found');
      Logger.log('DEBUG INFO: ' + debugInfo.join(' | '));
      return null;
    }
    
    // Find user (skip header row)
    for (var i = 1; i < usersData.length; i++) {
      // Also clean the sheet data for comparison
      var sheetUserId = String(usersData[i][0]).trim();
      
      Logger.log('Row ' + i + ': Comparing "' + sheetUserId + '" with "' + cleanUserId + '"');
      debugInfo.push('Row ' + i + ': "' + sheetUserId + '" vs "' + cleanUserId + '"');
      
      if (sheetUserId === cleanUserId) {
        Logger.log('MATCH FOUND at row ' + i);
        debugInfo.push('MATCH FOUND at row ' + i);
        
        var userData = {
          user_id: usersData[i][0],
          first_name: usersData[i][1],
          last_name: usersData[i][2],
          instagram_handle: usersData[i][3],
          passport_color: usersData[i][4],
          created_date: usersData[i][5],
          unique_url: usersData[i][6],
          is_admin: usersData[i][7] || false,
          _debug: debugInfo.join(' | ')  // Include debug info
        };
        Logger.log('Returning user data for: ' + userData.first_name);
        Logger.log('DEBUG INFO: ' + debugInfo.join(' | '));
        return userData;
      }
    }
    
    Logger.log('NO MATCH FOUND - returning null');
    Logger.log('Searched through ' + (usersData.length - 1) + ' users');
    debugInfo.push('NO MATCH FOUND after checking ' + (usersData.length - 1) + ' users');
    Logger.log('DEBUG INFO: ' + debugInfo.join(' | '));
    
    // Return an object with debug info instead of just null
    // This helps us see what happened
    return {
      _error: 'User not found',
      _debug: debugInfo.join(' | '),
      _userId: cleanUserId,
      _rowsChecked: usersData.length - 1
    };
    
  } catch (error) {
    Logger.log('ERROR in getUserData: ' + error.message);
    Logger.log('Stack trace: ' + error.stack);
    debugInfo.push('EXCEPTION: ' + error.message);
    Logger.log('DEBUG INFO: ' + debugInfo.join(' | '));
    
    return {
      _error: error.message,
      _debug: debugInfo.join(' | ')
    };
  }
}

function getUserLocations(userId) {
  var sheets = getSheets();
  var locationsData = sheets.locations.getDataRange().getValues();
  var locations = [];
  
  // Find all locations for this user (skip header row)
  for (var i = 1; i < locationsData.length; i++) {
    if (locationsData[i][0] === userId) { // Column A = user_id
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
  
  // Find all objects for this user (skip header row)
  for (var i = 1; i < objectsData.length; i++) {
    if (objectsData[i][0] === userId) { // Column A = user_id
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
  
  // Find all food for this user (skip header row)
  for (var i = 1; i < foodData.length; i++) {
    if (foodData[i][0] === userId) { // Column A = user_id
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
  
  // Get all master locations (skip header row)
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
  
  // Sort by date_added descending to get most recent
  objects.sort(function(a, b) {
    return new Date(b.date_added) - new Date(a.date_added);
  });
  
  // Return the most recent object, or null if none exist
  return objects.length > 0 ? objects[0] : null;
}

// ===================================
// API ENDPOINTS - DATA MODIFICATION
// ===================================

function updatePassportColor(userId, newColor) {
  var sheets = getSheets();
  var usersData = sheets.users.getDataRange().getValues();
  
  // Find user and update color
  for (var i = 1; i < usersData.length; i++) {
    if (usersData[i][0] === userId) {
      sheets.users.getRange(i + 1, 5).setValue(newColor); // Column E = passport_color
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
  
  // Using stamp date as visited date for now
  var dateVisited = stampDate;
  
  sheets.locations.appendRow([
    userId,
    place,
    dateVisited,
    stampDate
  ]);
  
  return { success: true, message: 'Passport stamped!' };
}

function getTotalStamps() {
  var sheets = getSheets();
  var masterData = sheets.masterLocations.getDataRange().getValues();
  
  // Count active locations (skip header)
  var count = 0;
  for (var i = 1; i < masterData.length; i++) {
    if (masterData[i][4] === true) { // is_active column
      count++;
    }
  }
  
  return count;
}

// ===================================
// ADMIN FUNCTIONS
// ===================================

function isAdmin(userId) {
  var sheets = getSheets();
  var usersData = sheets.users.getDataRange().getValues();
  
  // Find user and check admin status
  for (var i = 1; i < usersData.length; i++) {
    if (usersData[i][0] === userId) { // Column A = user_id
      return usersData[i][7] || false; // Column H = is_admin
    }
  }
  
  return false; // User not found or not admin
}

function setLocation(userId, place, stampColor) {
  // Check if user is admin
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

// Optional: Function to get admin status for frontend
function getAdminStatus(userId) {
  return { is_admin: isAdmin(userId) };
}

// ===================================
// DIAGNOSTIC FUNCTIONS
// ===================================

// Simple test function that can be called from the web app
function testConnection() {
  return {
    success: true,
    message: 'Connection successful!',
    timestamp: new Date().toString(),
    spreadsheetId: SPREADSHEET_ID
  };
}

function diagnoseUserLookup() {
  var sheets = getSheets();
  var usersData = sheets.users.getDataRange().getValues();
  
  Logger.log('=== USER DATA DIAGNOSTIC ===');
  Logger.log('Total rows (including header): ' + usersData.length);
  Logger.log('');
  
  // Log all user IDs in the sheet
  for (var i = 1; i < usersData.length; i++) {
    var userId = usersData[i][0];
    var firstName = usersData[i][1];
    var uniqueUrl = usersData[i][6];
    
    Logger.log('Row ' + (i+1) + ':');
    Logger.log('  user_id: "' + userId + '" (type: ' + typeof userId + ', length: ' + String(userId).length + ')');
    Logger.log('  first_name: "' + firstName + '"');
    Logger.log('  unique_url: "' + uniqueUrl + '"');
    Logger.log('');
  }
  
  Logger.log('=== END DIAGNOSTIC ===');
}

function diagnoseEthanUser() {
  var sheets = getSheets();
  var usersData = sheets.users.getDataRange().getValues();
  
  Logger.log('=== ETHAN USER DIAGNOSTIC ===');
  Logger.log('Total users in sheet: ' + (usersData.length - 1)); // minus header
  Logger.log('');
  
  // Look for any user with "ethan" in the name (case insensitive)
  for (var i = 1; i < usersData.length; i++) {
    var firstName = String(usersData[i][1]).toLowerCase();
    var lastName = String(usersData[i][2]).toLowerCase();
    var fullName = firstName + ' ' + lastName;
    
    if (fullName.indexOf('ethan') > -1) {
      Logger.log('FOUND POTENTIAL MATCH:');
      Logger.log('Row: ' + (i+1));
      Logger.log('user_id: "' + usersData[i][0] + '"');
      Logger.log('  - Type: ' + typeof usersData[i][0]);
      Logger.log('  - Length: ' + String(usersData[i][0]).length);
      Logger.log('  - Trimmed: "' + String(usersData[i][0]).trim() + '"');
      Logger.log('first_name: "' + usersData[i][1] + '"');
      Logger.log('last_name: "' + usersData[i][2] + '"');
      Logger.log('instagram: "' + usersData[i][3] + '"');
      Logger.log('unique_url: "' + usersData[i][6] + '"');
      Logger.log('');
      
      // Test if we can extract the user_id from the URL
      if (usersData[i][6]) {
        var url = String(usersData[i][6]);
        if (url.indexOf('user_id=') > -1) {
          var urlUserId = url.split('user_id=')[1];
          Logger.log('user_id extracted from URL: "' + urlUserId + '"');
          Logger.log('Does URL user_id match sheet user_id? ' + (urlUserId === String(usersData[i][0]).trim()));
        }
      }
    }
  }
  
  Logger.log('=== END DIAGNOSTIC ===');
}

function testSpecificUrl(testUrl) {
  Logger.log('=== TESTING URL ===');
  Logger.log('URL: ' + testUrl);
  
  // Extract user_id from URL
  if (testUrl.indexOf('user_id=') > -1) {
    var userId = testUrl.split('user_id=')[1].split('&')[0]; // Get everything after user_id= until next param or end
    Logger.log('Extracted user_id: "' + userId + '"');
    Logger.log('Type: ' + typeof userId);
    Logger.log('Length: ' + userId.length);
    
    // Try to find this user
    var userData = getUserData(userId);
    if (userData) {
      Logger.log('SUCCESS: User found!');
      Logger.log('Name: ' + userData.first_name + ' ' + userData.last_name);
    } else {
      Logger.log('FAILED: User not found');
      
      // Now check why
      var sheets = getSheets();
      var usersData = sheets.users.getDataRange().getValues();
      Logger.log('');
      Logger.log('All user_ids in database:');
      for (var i = 1; i < usersData.length; i++) {
        Logger.log('  "' + String(usersData[i][0]).trim() + '"');
      }
    }
  } else {
    Logger.log('ERROR: No user_id parameter found in URL');
  }
}

function checkEthanData() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName('Users');
  var data = sheet.getDataRange().getValues();
  
  Logger.log('=== CHECKING ALL USERS ===');
  
  for (var i = 1; i < data.length; i++) {
    var userId = data[i][0];
    var firstName = data[i][1];
    var url = data[i][6];
    
    // Log each user with detailed info
    Logger.log('Row ' + (i+1) + ':');
    Logger.log('  user_id: "' + userId + '"');
    Logger.log('  Type: ' + typeof userId);
    Logger.log('  Length: ' + String(userId).length);
    Logger.log('  First char code: ' + String(userId).charCodeAt(0));
    Logger.log('  Name: ' + firstName);
    
    // Extract user_id from URL and compare
    if (url && url.indexOf('user_id=') > -1) {
      var urlUserId = url.split('user_id=')[1].split('&')[0];
      Logger.log('  URL has: "' + urlUserId + '"');
      Logger.log('  Match? ' + (String(userId).trim() === urlUserId.trim()));
    }
    Logger.log('');
  }
}