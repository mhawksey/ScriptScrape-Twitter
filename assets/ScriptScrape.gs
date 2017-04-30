// LICENSES http://www.apache.org/licenses/LICENSE-2.0
var DOC_ID = '1H8lN1Y13MOhgTHc_lt7-sGyy9JWf-MeEeKzb7eH7s-M'; // TAGS Template file 
         
/**
 * Add a row of data to a sheet.
 * @param {Object} parameters passed from script.
 * @return {Object} result.
 */
function setData(parameters) {  
  try {
    // next set where we write the data - you could write to multiple/alternate destinations
    var doc = SpreadsheetApp.openById(DOC_ID).copy('TAGS - '+parameters.searchTerm);
    doc.getSheetByName('Readme/Settings').getRange('B9').setValue(parameters.searchTerm);
    var sheet = doc.insertSheet('ID', 3);
    sheet.getRange("A:A").setNumberFormat("");
    var ids = parameters.data;
    sheet.getRange(1, 1, ids.length, 1).setValues(ids);
    return {"status":"ok", 'doc':doc.getUrl()};
  } catch(e){
    // if error return this
    Logger.log(e);
    return {"status": JSON.stringify(e)};
  }
}