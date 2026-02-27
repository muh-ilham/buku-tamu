// ====== KONFIGURASI ======
const FOLDER_NAME = "FOTO_BUKU_TAMU";
const SCRIPT_PROP_USERNAME = "ADMIN_USER";
const SCRIPT_PROP_PASSWORD = "ADMIN_PASSWORD";
const DEFAULT_USER = "admin";
const DEFAULT_PASS = "admin123";

function doGet(e) {
  // === TANGKAP REQUEST API GET (Untung mengurangi masalah CORS POST) ===
  if (e.parameter && e.parameter.action) {
    var action = e.parameter.action;
    var resultData = null;
    try {
      if (action === "getAllGuestData") { resultData = getAllGuestData(); }
      else if (action === "getDashboardStats") { resultData = getDashboardStats(); }
      else if (action === "getSettings") { resultData = getSettings(); }
      else if (action === "getStatuses") { resultData = getStatuses(); }
      else if (action === "getRuangans") { resultData = getRuangans(); }
      else { throw new Error("Aksi GET tidak valid"); }
      
      return ContentService.createTextOutput(JSON.stringify({
        error: false,
        data: resultData
      })).setMimeType(ContentService.MimeType.JSON);
    } catch(err) {
      return ContentService.createTextOutput(JSON.stringify({
        error: true,
        message: err.toString()
      })).setMimeType(ContentService.MimeType.JSON);
    }
  }

  // === RENDER HALAMAN HTML JIKA BUKAN API GET ===
  var page = e.parameter.page || 'index';
  var template;
  
  if (page === 'admin') {
    template = HtmlService.createTemplateFromFile('admin');
  } else if (page === 'login') {
    template = HtmlService.createTemplateFromFile('login');
  } else {
    template = HtmlService.createTemplateFromFile('index');
  }
  
  return template.evaluate()
      .setTitle('Buku Tamu Digital')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// ====== SETUP DATABASE (Jalankan sekali) ======
function setup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Sheet 1: DATA_BUKU_TAMU
  var sheetData = ss.getSheetByName("DATA_BUKU_TAMU");
  if (!sheetData) {
    sheetData = ss.insertSheet("DATA_BUKU_TAMU");
    sheetData.appendRow(["ID", "Tanggal", "Jam", "Nama", "NIK", "No HP", "Instansi", "Keperluan", "Tujuan", "Status", "Link Foto", "Timestamp"]);
    sheetData.getRange("A1:L1").setFontWeight("bold").setBackground("#e0e0e0");
    sheetData.setFrozenRows(1);
  }
  
  // Sheet 2: MASTER_STATUS
  var sheetStatus = ss.getSheetByName("MASTER_STATUS");
  if (!sheetStatus) {
    sheetStatus = ss.insertSheet("MASTER_STATUS");
    sheetStatus.appendRow(["ID", "Nama Status", "Status Aktif"]);
    sheetStatus.appendRow(["ST-1", "Tamu Umum", true]);
    sheetStatus.appendRow(["ST-2", "Internal", true]);
    sheetStatus.appendRow(["ST-3", "Vendor", true]);
    sheetStatus.appendRow(["ST-4", "Mitra Kerja", true]);
    sheetStatus.getRange("A1:C1").setFontWeight("bold").setBackground("#e0e0e0");
    sheetStatus.setFrozenRows(1);
  }
  
  // Sheet 3: PENGATURAN
  var sheetSettings = ss.getSheetByName("PENGATURAN");
  if (!sheetSettings) {
    sheetSettings = ss.insertSheet("PENGATURAN");
    sheetSettings.appendRow(["Nama Setting", "Nilai Setting"]);
    sheetSettings.appendRow(["APP_TITLE", "Buku Tamu"]);
    sheetSettings.appendRow(["APP_SUBTITLE", "RS Pelamonia"]);
    sheetSettings.getRange("A1:B1").setFontWeight("bold").setBackground("#e0e0e0");
    sheetSettings.setFrozenRows(1);
  }
  
  // Sheet 4: MASTER_RUANGAN
  var sheetRuangan = ss.getSheetByName("MASTER_RUANGAN");
  if (!sheetRuangan) {
    sheetRuangan = ss.insertSheet("MASTER_RUANGAN");
    sheetRuangan.appendRow(["ID", "Nama Ruangan", "Status Aktif"]);
    sheetRuangan.appendRow(["RU-1", "Poli Bedah", true]);
    sheetRuangan.appendRow(["RU-2", "IGD", true]);
    sheetRuangan.appendRow(["RU-3", "Poli Gigi", true]);
    sheetRuangan.getRange("A1:C1").setFontWeight("bold").setBackground("#e0e0e0");
    sheetRuangan.setFrozenRows(1);
  }
  
  // Folder Drive
  var folders = DriveApp.getFoldersByName(FOLDER_NAME);
  if (!folders.hasNext()) {
    DriveApp.createFolder(FOLDER_NAME);
  }
  
  // Script Properties (Default Admin)
  var props = PropertiesService.getScriptProperties();
  if (!props.getProperty(SCRIPT_PROP_USERNAME)) {
    props.setProperty(SCRIPT_PROP_USERNAME, DEFAULT_USER);
    props.setProperty(SCRIPT_PROP_PASSWORD, DEFAULT_PASS);
  }
  
  return "Setup Database dan Folder Berhasil!";
}

// ====== GET DATA UNTUK FRONTEND ======
function getSettings() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("PENGATURAN");
  var data = sheet.getDataRange().getValues();
  var settings = {};
  for (var i = 1; i < data.length; i++) {
    settings[data[i][0]] = data[i][1];
  }
  return settings;
}

function getStatuses() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("MASTER_STATUS");
  var data = sheet.getDataRange().getValues();
  var statuses = [];
  for (var i = 1; i < data.length; i++) {
    if (data[i][2] === true || data[i][2] === "TRUE" || data[i][2] === "true") {
      statuses.push({ id: data[i][0], name: data[i][1] });
    }
  }
  return statuses;
}

function getAllStatusesAdmin() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("MASTER_STATUS");
  var data = sheet.getDataRange().getValues();
  var statuses = [];
  for (var i = 1; i < data.length; i++) {
    statuses.push({
      id: data[i][0],
      name: data[i][1],
      active: data[i][2]
    });
  }
  return statuses;
}

function getRuangans() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("MASTER_RUANGAN");
  var data = sheet.getDataRange().getValues();
  var ruangans = [];
  for (var i = 1; i < data.length; i++) {
    if (data[i][2] === true || data[i][2] === "TRUE" || data[i][2] === "true") {
      ruangans.push({ id: data[i][0], name: data[i][1] });
    }
  }
  return ruangans;
}

function getAllRuangansAdmin() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("MASTER_RUANGAN");
  var data = sheet.getDataRange().getValues();
  var ruangans = [];
  for (var i = 1; i < data.length; i++) {
    ruangans.push({
      id: data[i][0],
      name: data[i][1],
      active: data[i][2]
    });
  }
  return ruangans;
}

// ====== SAVE DATA TAMU ======
function saveGuestData(formData) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("DATA_BUKU_TAMU");
    
    var dateObj = new Date();
    var dateStr = Utilities.formatDate(dateObj, Session.getScriptTimeZone(), "yyyy-MM-dd");
    var timeStr = Utilities.formatDate(dateObj, Session.getScriptTimeZone(), "HH:mm:ss");
    
    // Validasi NIK hari ini
    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
        // Kolom NIK ada di index ke-4 (i.e. 'E')
        if (data[i][1] == dateStr && data[i][4] == formData.nik) {
            return { success: false, message: "Pendaftaran gagal: NIK (" + formData.nik + ") sudah terdaftar pada hari ini!" };
        }
    }
    
    // Upload Foto ke GDrive
    var photoUrl = "";
    if (formData.photoBase64) {
      photoUrl = uploadPhoto(formData.photoBase64, formData.nama, dateStr, Utilities.formatDate(dateObj, Session.getScriptTimeZone(), "HHmmss"));
    }
    
    // Generate ID unik
    var lastRow = sheet.getLastRow();
    var randomNum = Math.floor(Math.random() * 90) + 10; // dua digit random untuk keamanan concurrency ringan
    var newId = "GT-" + dateStr.replace(/-/g, "") + "-" + (lastRow) + randomNum;
    
    sheet.appendRow([
      newId,
      dateStr, // Tanggal
      timeStr, // Jam
      formData.nama,
      formData.nik,
      formData.hp,
      formData.instansi,
      formData.keperluan,
      formData.tujuan,
      formData.status,
      photoUrl,
      dateObj // Timestamp asli
    ]);
    
    return { success: true, message: "Data tamu berhasil disimpan!" };
  } catch (error) {
    return { success: false, message: error.toString() };
  }
}

function uploadPhoto(base64Data, name, dateStr, timeStr) {
  var mainFolders = DriveApp.getFoldersByName(FOLDER_NAME);
  var mainFolder = mainFolders.hasNext() ? mainFolders.next() : DriveApp.createFolder(FOLDER_NAME);
  
  // Buat subfolder berdasarkan Tanggal di dalam folder utama
  var dateFolders = mainFolder.getFoldersByName(dateStr);
  var dateFolder = dateFolders.hasNext() ? dateFolders.next() : mainFolder.createFolder(dateStr);
  
  var contentType = 'image/jpeg';
  // Hapus prefix
  var base64 = base64Data.split(',')[1];
  // Sanitasi nama file
  var cleanName = name.replace(/[^a-zA-Z0-9 ]/g, "").replace(/\s+/g, '_');
  var fileName = cleanName + "_" + timeStr + ".jpg";
  
  var blob = Utilities.newBlob(Utilities.base64Decode(base64), contentType, fileName);
  var file = dateFolder.createFile(blob); // Simpan di dalam subfolder tanggal
  
  // Opsional: Buat file bisa dilihat oleh siapa saja dengan link, agar preview foto bisa tampil di Sheet/Dashboard
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  
  return file.getUrl();
}

// ====== PENGATURAN API (ADMIN) ======
function updateSetting(key, value) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("PENGATURAN");
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === key) {
      sheet.getRange(i + 1, 2).setValue(value);
      return { success: true };
    }
  }
  sheet.appendRow([key, value]);
  return { success: true };
}

function saveStatus(id, name, isActive) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("MASTER_STATUS");
  var data = sheet.getDataRange().getValues();
  
  if (id) {
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] === id) {
        sheet.getRange(i + 1, 2).setValue(name);
        sheet.getRange(i + 1, 3).setValue(isActive);
        return { success: true };
      }
    }
  } else {
    var newId = "ST-" + new Date().getTime();
    sheet.appendRow([newId, name, isActive]);
  }
  return { success: true };
}

function deleteStatus(id) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("MASTER_STATUS");
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      sheet.deleteRow(i + 1);
      return { success: true };
    }
  }
  return { success: false, message: "Status tidak ditemukan" };
}

function saveRuangan(id, name, isActive) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("MASTER_RUANGAN");
  var data = sheet.getDataRange().getValues();
  
  if (id) {
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] === id) {
        sheet.getRange(i + 1, 2).setValue(name);
        sheet.getRange(i + 1, 3).setValue(isActive);
        return { success: true };
      }
    }
  } else {
    var newId = "RU-" + new Date().getTime();
    sheet.appendRow([newId, name, isActive]);
  }
  return { success: true };
}

function deleteRuangan(id) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("MASTER_RUANGAN");
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      sheet.deleteRow(i + 1);
      return { success: true };
    }
  }
  return { success: false, message: "Ruangan tidak ditemukan" };
}

// ====== DASHBOARD ADMIN ======
function getDashboardStats() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("DATA_BUKU_TAMU");
  var data = sheet.getDataRange().getValues();
  
  var dateObj = new Date();
  var todayStr = Utilities.formatDate(dateObj, Session.getScriptTimeZone(), "yyyy-MM-dd");
  var monthStr = Utilities.formatDate(dateObj, Session.getScriptTimeZone(), "yyyy-MM");
  
  var stats = {
    today: 0,
    month: 0,
    all: data.length > 1 ? data.length - 1 : 0,
    dailyChart: {},
    statusChart: {},
    instansiChart: {}
  };
  
  // Urutkan data berdasarkan tanggal untuk dailyChart urutan ASC
  // data dimulai dari index 1 (skip header)
  
  for (var i = 1; i < data.length; i++) {
    // Tanggal
    var rowDate = data[i][1]; 
    if(rowDate && rowDate instanceof Date) {
      rowDate = Utilities.formatDate(rowDate, Session.getScriptTimeZone(), "yyyy-MM-dd");
    } else if(typeof rowDate === 'string') {
      // jika tersimpan sebagai string 'yyyy-MM-dd'
    } else {
      continue;
    }
    
    // Bulan
    var rowMonth = rowDate.substring(0, 7);
    
    if (rowDate === todayStr) stats.today++;
    if (rowMonth === monthStr) stats.month++;
    
    // Daily
    stats.dailyChart[rowDate] = (stats.dailyChart[rowDate] || 0) + 1;
    // Status
    var status = data[i][9];
    stats.statusChart[status] = (stats.statusChart[status] || 0) + 1;
    // Instansi
    var instansi = data[i][6] || "Lainnya";
    stats.instansiChart[instansi] = (stats.instansiChart[instansi] || 0) + 1;
  }
  
  // Format dailyChart menjadi array (terbatas misal 7-14 hari terakhir)
  return stats;
}

function getAllGuestData() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("DATA_BUKU_TAMU");
  var data = sheet.getDataRange().getDisplayValues(); // Gunakan getDisplayValues untuk string rendering
  var headers = data[0];
  var result = [];
  
  for (var i = data.length - 1; i > 0; i--) { // Urutkan terbaru dulu
     var row = {};
     for (var j = 0; j < headers.length; j++) {
        row[headers[j]] = data[i][j];
     }
     result.push(row);
  }
  return result;
}

// ====== HAPUS DATA BUKU TAMU ======
function deleteGuestData(id) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("DATA_BUKU_TAMU");
  var data = sheet.getDataRange().getValues();
  
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      sheet.deleteRow(i + 1);
      return { success: true, message: "Data berhasil dihapus" };
    }
  }
  return { success: false, message: "Data tidak ditemukan" };
}

function deleteAllGuestData() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("DATA_BUKU_TAMU");
  var lastRow = sheet.getLastRow();
  
  if (lastRow > 1) {
    sheet.deleteRows(2, lastRow - 1); // Hapus semua baris mulai dari baris ke-2
    return { success: true, message: "Semua data kunjungan berhasil dikosongkan" };
  }
  return { success: false, message: "Data sudah kosong" };
}

// ====== AUTHENTICATION ======
function adminLogin(username, password) {
  var props = PropertiesService.getScriptProperties();
  var validUser = props.getProperty(SCRIPT_PROP_USERNAME);
  var validPass = props.getProperty(SCRIPT_PROP_PASSWORD);
  
  if (username === validUser && password === validPass) {
    var token = Utilities.base64Encode(username + ":" + new Date().getTime());
    return { success: true, token: token };
  }
  return { success: false, message: "Username atau Password salah." };
}

// ====== FUNGSI PENERIMA DATA DARI CPANEL (API REST POST) ======
function doPost(e) {
  try {
    // Mode x-www-form-urlencoded membaca lewat e.parameter
    var action = e.parameter.action;
    var payloadStr = e.parameter.data || "{}";
    var payload = JSON.parse(payloadStr);
    var resultData = null;
    
    // Sistem Route
    if (action === "saveGuestData") {
      resultData = saveGuestData(payload);
    } 
    else {
      throw new Error("Perintah POST tidak valid atau gunakan metode GET.");
    }
    
    // Kembalikan hasil yang sukses ke Cpanel
    return ContentService.createTextOutput(JSON.stringify({
      error: false,
      data: resultData
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    // Jika gagal, kabari Cpanel pesan error-nya
    return ContentService.createTextOutput(JSON.stringify({
      error: true,
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}


