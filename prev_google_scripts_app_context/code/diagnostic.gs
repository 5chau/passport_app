// Add this to your Code.gs file and run it
function testGetUserDataDirect() {
  var testUserId = '132TDIJ3';
  
  Logger.log('═══════════════════════════════════════');
  Logger.log('DIRECT TEST OF getUserData');
  Logger.log('═══════════════════════════════════════');
  Logger.log('Calling getUserData("' + testUserId + '")');
  Logger.log('');
  
  var result = getUserData(testUserId);
  
  Logger.log('RESULT:');
  Logger.log('Type: ' + typeof result);
  Logger.log('Value: ' + JSON.stringify(result, null, 2));
  Logger.log('');
  
  if (result === null) {
    Logger.log('⚠️ Result is NULL');
  } else if (result && result.first_name) {
    Logger.log('✓ Valid user object returned');
    Logger.log('Name: ' + result.first_name + ' ' + result.last_name);
  } else if (result && result._error) {
    Logger.log('❌ Error object returned');
    Logger.log('Error: ' + result._error);
    Logger.log('Debug: ' + result._debug);
  } else {
    Logger.log('❓ Unexpected result type');
  }
  
  Logger.log('═══════════════════════════════════════');
}