
const SPREADSHEET_ID = 'ضع_هنا_معرف_جدولك_الخاص';


function doGet(e) {
  try {
    // فتح الجدول
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);

    // الحصول على نوع العملية المطلوبة
    const action = e.parameter.action;
    const dataType = e.parameter.type || 'projects';

    // معالجة العمليات المختلفة
    if (action === 'addStockOut') {
      return handleAddStockOut(e, spreadsheet);
    } else if (action === 'addStockIn') {
      return handleAddStockIn(e, spreadsheet);
    } else if (dataType === 'projects') {
      return getProjects(spreadsheet);
    } else if (dataType === 'stock_out_projects') {
      return getStockOutProjects(spreadsheet);
    } else if (dataType === 'stock_out_products') {
      const projectName = e.parameter.project;
      return getStockOutProductsByProject(spreadsheet, projectName);
    } else if (dataType === 'stock_out_unit') {
      const projectName = e.parameter.project;
      const productName = e.parameter.product;
      return getStockOutUnitByProjectAndProduct(spreadsheet, projectName, productName);
    } else if (dataType === 'products') {
      return getProducts(spreadsheet);
    } else if (dataType === 'search') {
      const barcode = e.parameter.barcode;
      return searchProductByBarcode(spreadsheet, barcode);
    } else {
      throw new Error('نوع البيانات غير مدعوم');
    }

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    // فتح الجدول
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);

    // تحليل البيانات المرسلة
    const postData = JSON.parse(e.postData.contents);
    const action = postData.action;

    if (action === 'addStockOut') {
      return addStockOutData(spreadsheet, postData.data);
    } else if (action === 'addStockIn') {
      return addStockInData(spreadsheet, postData.data);
    } else {
      throw new Error('Action غير مدعوم');
    }

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ==========================================
// دوال معالجة البيانات من GET
// ==========================================

function handleAddStockOut(e, spreadsheet) {
  const count = parseInt(e.parameter.count) || 0;
  const stockData = [];

  // استخراج البيانات من المعاملات
  for (let i = 0; i < count; i++) {
    const item = {
      date: e.parameter[`data[${i}][date]`] || '',
      projectName: e.parameter[`data[${i}][projectName]`] || '',
      product: e.parameter[`data[${i}][product]`] || '',
      quantity: e.parameter[`data[${i}][quantity]`] || '',
      unit: e.parameter[`data[${i}][unit]`] || '',
      timestamp: e.parameter[`data[${i}][timestamp]`] || ''
    };

    if (item.date && item.projectName && item.product && item.quantity) {
      stockData.push(item);
    }
  }

  return addStockOutData(spreadsheet, stockData);
}

function handleAddStockIn(e, spreadsheet) {
  const count = parseInt(e.parameter.count) || 0;
  const stockData = [];

  // استخراج البيانات من المعاملات
  for (let i = 0; i < count; i++) {
    const item = {
      date: e.parameter[`data[${i}][date]`] || '',
      projectName: e.parameter[`data[${i}][projectName]`] || '',
      product: e.parameter[`data[${i}][product]`] || '',
      quantity: e.parameter[`data[${i}][quantity]`] || '',
      unit: e.parameter[`data[${i}][unit]`] || '',
      timestamp: e.parameter[`data[${i}][timestamp]`] || ''
    };

    if (item.date && item.projectName && item.product && item.quantity) {
      stockData.push(item);
    }
  }

  return addStockInData(spreadsheet, stockData);
}

// ==========================================
// دوال إضافة البيانات
// ==========================================

function addStockOutData(spreadsheet, stockData) {
  const SHEET_NAME = 'Stock_Out';

  // البحث عن الشيت أو إنشاؤه
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = createStockSheet(spreadsheet, SHEET_NAME);
  }

  return insertStockData(sheet, stockData, SHEET_NAME);
}

function addStockInData(spreadsheet, stockData) {
  const SHEET_NAME = 'Stock_In';

  // البحث عن الشيت أو إنشاؤه
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = createStockSheet(spreadsheet, SHEET_NAME);
  }

  return insertStockData(sheet, stockData, SHEET_NAME);
}

// ==========================================
// دوال إنشاء وتنسيق الشيتات
// ==========================================

function createStockSheet(spreadsheet, sheetName) {
  // إنشاء شيت جديد مع العناوين
  const sheet = spreadsheet.insertSheet(sheetName);

  // إضافة أعمدة العناوين
  const headers = ['التاريخ', 'اسم المشروع', 'المنتج', 'الكمية', 'الوحدة', 'وقت الإدخال'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

  // تنسيق العناوين
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground('#20B2AA');
  headerRange.setFontColor('white');
  headerRange.setFontWeight('bold');
  headerRange.setHorizontalAlignment('center');

  // تجميد الصف الأول
  sheet.setFrozenRows(1);

  return sheet;
}

function insertStockData(sheet, stockData, sheetName) {
  // الحصول على آخر صف فارغ
  const lastRow = sheet.getLastRow();
  const startRow = lastRow + 1;

  // تحضير البيانات للإدراج
  const rowsData = stockData.map(item => [
    item.date,
    item.projectName,
    item.product,
    item.quantity,
    item.unit,
    new Date(item.timestamp).toLocaleString('ar-SA', {
      timeZone: 'Asia/Riyadh',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  ]);

  // إدراج البيانات
  if (rowsData.length > 0) {
    const range = sheet.getRange(startRow, 1, rowsData.length, 6);
    range.setValues(rowsData);

    // تنسيق البيانات
    range.setHorizontalAlignment('center');
    range.setBorder(true, true, true, true, true, true);

    // تلوين الصفوف بالتناوب
    for (let i = 0; i < rowsData.length; i++) {
      const rowRange = sheet.getRange(startRow + i, 1, 1, 6);
      if ((startRow + i) % 2 === 0) {
        rowRange.setBackground('#F0FFFF');
      }
    }

    // ضبط عرض الأعمدة تلقائياً
    sheet.autoResizeColumns(1, 6);
  }

  return ContentService
    .createTextOutput(JSON.stringify({
      success: true,
      message: `تم إدراج ${rowsData.length} عنصر بنجاح في شيت ${sheetName}`,
      rowsAdded: rowsData.length,
      sheetName: sheetName
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ==========================================
// دوال الحصول على البيانات
// ==========================================

function getProjects(spreadsheet) {
  const sheet = spreadsheet.getSheetByName('Projects');

  if (!sheet) {
    throw new Error('Sheet "Projects" not found');
  }

  const range = sheet.getRange('B2:B');
  const values = range.getValues();

  const projects = values
    .filter(row => row[0] && row[0].toString().trim() !== '')
    .map(row => row[0].toString().trim());

  return ContentService
    .createTextOutput(JSON.stringify({
      success: true,
      data: projects,
      count: projects.length
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

function getProducts(spreadsheet) {
  const sheet = spreadsheet.getSheetByName('Products');

  if (!sheet) {
    throw new Error('Sheet "Products" not found');
  }

  const range = sheet.getRange('B2:D');
  const values = range.getValues();

  const products = values
    .filter(row => row[0] && row[1] && row[0].toString().trim() !== '' && row[1].toString().trim() !== '')
    .map(row => ({
      barcode: row[0].toString().trim(),
      name: row[1].toString().trim(),
      unit: row[2] ? row[2].toString().trim() : 'قطعة'
    }));

  return ContentService
    .createTextOutput(JSON.stringify({
      success: true,
      data: products,
      count: products.length
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

function getStockOutProjects(spreadsheet) {
  const sheet = spreadsheet.getSheetByName('Stock_Out');

  if (!sheet) {
    throw new Error('Sheet "Stock_Out" not found');
  }

  const range = sheet.getRange('B2:B');
  const values = range.getValues();

  const projectsSet = new Set();
  values.forEach(row => {
    if (row[0] && row[0].toString().trim() !== '') {
      projectsSet.add(row[0].toString().trim());
    }
  });

  const projects = Array.from(projectsSet);

  return ContentService
    .createTextOutput(JSON.stringify({
      success: true,
      data: projects,
      count: projects.length
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

function getStockOutProductsByProject(spreadsheet, projectName) {
  const sheet = spreadsheet.getSheetByName('Stock_Out');

  if (!sheet) {
    throw new Error('Sheet "Stock_Out" not found');
  }

  if (!projectName) {
    throw new Error('لم يتم تحديد اسم المشروع');
  }

  const range = sheet.getRange('A2:E');
  const values = range.getValues();

  const productsSet = new Set();
  values.forEach(row => {
    const rowProject = row[1] ? row[1].toString().trim() : '';
    const rowProduct = row[2] ? row[2].toString().trim() : '';
    const rowUnit = row[4] ? row[4].toString().trim() : 'قطعة';

    if (rowProject === projectName && rowProduct !== '') {
      const productKey = `${rowProduct}|${rowUnit}`;
      productsSet.add(productKey);
    }
  });

  const products = Array.from(productsSet).map(productKey => {
    const [name, unit] = productKey.split('|');
    return {
      name: name,
      unit: unit || 'قطعة'
    };
  });

  return ContentService
    .createTextOutput(JSON.stringify({
      success: true,
      data: products,
      count: products.length,
      project: projectName
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

function getStockOutUnitByProjectAndProduct(spreadsheet, projectName, productName) {
  const sheet = spreadsheet.getSheetByName('Stock_Out');

  if (!sheet) {
    throw new Error('Sheet "Stock_Out" not found');
  }

  if (!projectName || !productName) {
    throw new Error('لم يتم تحديد اسم المشروع أو المنتج');
  }

  const range = sheet.getRange('A2:E');
  const values = range.getValues();

  for (let i = 0; i < values.length; i++) {
    const row = values[i];
    const rowProject = row[1] ? row[1].toString().trim() : '';
    const rowProduct = row[2] ? row[2].toString().trim() : '';
    const rowQuantity = row[3] ? row[3].toString().trim() : '';
    const rowUnit = row[4] ? row[4].toString().trim() : 'قطعة';

    if (rowProject === projectName && rowProduct === productName) {
      return ContentService
        .createTextOutput(JSON.stringify({
          success: true,
          data: {
            quantity: rowQuantity,
            unit: rowUnit
          },
          project: projectName,
          product: productName
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }

  return ContentService
    .createTextOutput(JSON.stringify({
      success: false,
      error: `لم يتم العثور على المنتج "${productName}" في المشروع "${projectName}"`
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ==========================================
// دوال البحث والمساعدة
// ==========================================

function searchProductByBarcode(spreadsheet, barcode) {
  if (!barcode) {
    throw new Error('لم يتم تحديد الباركود للبحث');
  }

  const sheet = spreadsheet.getSheetByName('Products');

  if (!sheet) {
    throw new Error('Sheet "Products" not found');
  }

  const range = sheet.getRange('B2:D');
  const values = range.getValues();

  const foundProduct = values.find(row =>
    row[0] && row[0].toString().trim() === barcode.toString().trim()
  );

  if (foundProduct) {
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        found: true,
        data: {
          barcode: foundProduct[0].toString().trim(),
          name: foundProduct[1].toString().trim(),
          unit: foundProduct[2] ? foundProduct[2].toString().trim() : 'قطعة'
        }
      }))
      .setMimeType(ContentService.MimeType.JSON);
  } else {
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        found: false,
        message: 'لم يتم العثور على منتج بهذا الباركود'
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ==========================================
// دوال الاختبار والتطوير
// ==========================================

function testFunction() {
  const result = doGet();
  const output = result.getContent();
  console.log(output);
  return JSON.parse(output);
}

/*
خطوات النشر المهمة:
1. انسخ هذا الكود في Google Apps Script Editor
2. احفظ المشروع باسم "Cafe Stock Management API"
3. اذهب إلى Deploy > New Deployment
4. اختر Type: Web app
5. Execute as: Me (مهم جداً)
6. Who has access: Anyone (مهم جداً)
7. انقر Deploy
8. انسخ الرابط الناتج واستخدمه في صفحة الإعدادات

ملاحظات مهمة:
- تأكد من أن الرابط يحتوي على script.google.com
- يجب أن ينتهي الرابط بـ /exec وليس /dev
- عند تحديث الكود، اختر "New deployment" لا "Manage deployments"
- تأكد من وجود الصلاحيات للوصول إلى Google Sheets

مثال للرابط الصحيح:
https://script.google.com/macros/s/AKfycbxXXXXXXXXXXXXXXXXXXXXX/exec
*/