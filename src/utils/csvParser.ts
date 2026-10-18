import { BulkProductImportItem, Product, StoreLocation } from '../types';

/**
 * Robust CSV parser supporting RFC 4180:
 * - Quoted fields with commas
 * - Escaped quotes ("")
 * - Handles Windows (\r\n) and Unix (\n) line breaks
 * - Strips UTF-8 BOM
 * - Flexible separator detection (comma or semicolon)
 */
export function parseCSV(text: string): {
  headers: string[];
  rows: Record<string, string>[];
  errors: string[];
} {
  const errors: string[] = [];
  if (!text || !text.trim()) {
    return { headers: [], rows: [], errors: ['CSV content is empty'] };
  }

  // Strip BOM if present
  let cleanText = text.replace(/^\uFEFF/, '').trim();

  // Detect delimiter: check first line for comma vs semicolon
  const firstLine = cleanText.split(/\r\n|\n|\r/)[0] || '';
  const delimiter = firstLine.includes(';') && !firstLine.includes(',') ? ';' : ',';

  const lines: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let insideQuotes = false;

  for (let i = 0; i < cleanText.length; i++) {
    const char = cleanText[i];
    const nextChar = cleanText[i + 1];

    if (insideQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          // Escaped quote: "" -> "
          currentField += '"';
          i++;
        } else {
          // End of quote
          insideQuotes = false;
        }
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        insideQuotes = true;
      } else if (char === delimiter) {
        currentRow.push(currentField.trim());
        currentField = '';
      } else if (char === '\r') {
        if (nextChar === '\n') {
          i++; // Skip \n
        }
        currentRow.push(currentField.trim());
        currentField = '';
        if (currentRow.length > 0 && currentRow.some((f) => f !== '')) {
          lines.push(currentRow);
        }
        currentRow = [];
      } else if (char === '\n') {
        currentRow.push(currentField.trim());
        currentField = '';
        if (currentRow.length > 0 && currentRow.some((f) => f !== '')) {
          lines.push(currentRow);
        }
        currentRow = [];
      } else {
        currentField += char;
      }
    }
  }

  // Push last field & row
  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some((f) => f !== '')) {
      lines.push(currentRow);
    }
  }

  if (lines.length === 0) {
    return { headers: [], rows: [], errors: ['No data rows found in CSV'] };
  }

  const rawHeaders = lines[0];
  const headers = rawHeaders.map((h) => h.trim());

  const rows: Record<string, string>[] = [];
  for (let r = 1; r < lines.length; r++) {
    const line = lines[r];
    const rowObj: Record<string, string> = {};
    for (let c = 0; c < headers.length; c++) {
      rowObj[headers[c]] = line[c] !== undefined ? line[c].trim() : '';
    }
    rows.push(rowObj);
  }

  return { headers, rows, errors };
}

/**
 * Standardize and map arbitrary CSV column names to DukaanIQ product fields
 */
function normalizeKey(key: string): string {
  return key.toLowerCase().replace(/[\s_\-\.]+/g, '');
}

export interface CsvMappingResult {
  validItems: BulkProductImportItem[];
  rowPreviews: {
    rowNumber: number;
    sku: string;
    name: string;
    stock: number;
    sellingPrice: number;
    costPrice: number;
    mrp: number;
    category: string;
    isExisting: boolean;
    hasErrors: boolean;
    issues: string[];
  }[];
  summary: {
    totalRows: number;
    validCount: number;
    newProductsCount: number;
    updateProductsCount: number;
    errorCount: number;
  };
}

export function mapAndValidateProducts(
  rows: Record<string, string>[],
  currentProducts: Product[],
  targetLocation: StoreLocation,
  availableLocations: StoreLocation[]
): CsvMappingResult {
  const validItems: BulkProductImportItem[] = [];
  const rowPreviews: CsvMappingResult['rowPreviews'] = [];

  let newCount = 0;
  let updateCount = 0;
  let errorCount = 0;

  // Build lookup index for existing products by SKU and barcode
  const skuMap = new Map<string, Product>();
  const barcodeMap = new Map<string, Product>();
  currentProducts.forEach((p) => {
    skuMap.set(p.sku.toLowerCase(), p);
    if (p.barcode) {
      barcodeMap.set(p.barcode.toLowerCase(), p);
    }
  });

  rows.forEach((row, idx) => {
    const rowNumber = idx + 2; // Line 1 is headers
    const issues: string[] = [];

    // Map fields
    let sku = '';
    let name = '';
    let barcode = '';
    let category = 'General';
    let brand = '';
    let unit = 'pcs';
    let hsnCode = '';
    let costPrice: number | undefined;
    let sellingPrice: number | undefined;
    let mrp: number | undefined;
    let taxRate: number | undefined = undefined;
    let stock: number | undefined;
    let reorderPoint: number | undefined;
    let packSize: number | undefined = undefined;
    let supplierId = '';
    let description = '';

    const stockByLocation: { [locId: string]: number } = {};

    for (const [colName, val] of Object.entries(row)) {
      const norm = normalizeKey(colName);
      const cleanVal = val.trim();

      if (['sku', 'itemsku', 'productcode', 'code', 'itemcode', 'id'].includes(norm)) {
        sku = cleanVal;
      } else if (['name', 'productname', 'title', 'itemname'].includes(norm)) {
        name = cleanVal;
      } else if (['barcode', 'upc', 'ean', 'gtin', 'qr'].includes(norm)) {
        barcode = cleanVal;
      } else if (['category', 'cat', 'department', 'type'].includes(norm)) {
        category = cleanVal || category;
      } else if (['brand', 'make', 'manufacturer'].includes(norm)) {
        brand = cleanVal;
      } else if (['unit', 'uom', 'measuringunit'].includes(norm)) {
        unit = cleanVal || unit;
      } else if (['hsn', 'hsncode', 'sac', 'saccode'].includes(norm)) {
        hsnCode = cleanVal;
      } else if (['costprice', 'cost', 'buyprice', 'purchaseprice', 'cp'].includes(norm)) {
        const num = parseFloat(cleanVal.replace(/[^0-9.-]/g, ''));
        if (!isNaN(num) && num >= 0) costPrice = num;
        else if (cleanVal) issues.push(`Invalid cost price: "${cleanVal}"`);
      } else if (['sellingprice', 'price', 'saleprice', 'retailprice', 'sp'].includes(norm)) {
        const num = parseFloat(cleanVal.replace(/[^0-9.-]/g, ''));
        if (!isNaN(num) && num >= 0) sellingPrice = num;
        else if (cleanVal) issues.push(`Invalid selling price: "${cleanVal}"`);
      } else if (['mrp', 'maximumretailprice', 'listprice'].includes(norm)) {
        const num = parseFloat(cleanVal.replace(/[^0-9.-]/g, ''));
        if (!isNaN(num) && num >= 0) mrp = num;
        else if (cleanVal) issues.push(`Invalid MRP: "${cleanVal}"`);
      } else if (['taxrate', 'tax', 'gst', 'gstrate', 'gstpercent', 'vat'].includes(norm)) {
        const num = parseFloat(cleanVal.replace(/[^0-9.-]/g, ''));
        if (!isNaN(num) && num >= 0) taxRate = num;
        else if (cleanVal) issues.push(`Invalid GST rate: "${cleanVal}"`);
      } else if (['stock', 'stockonhand', 'qty', 'quantity', 'inventory', 'count', 'units'].includes(norm)) {
        const num = parseFloat(cleanVal.replace(/[^0-9.-]/g, ''));
        if (!isNaN(num)) stock = num;
        else if (cleanVal) issues.push(`Invalid stock quantity: "${cleanVal}"`);
      } else if (['reorderpoint', 'reorderlevel', 'minstock', 'safetystock'].includes(norm)) {
        const num = parseFloat(cleanVal.replace(/[^0-9.-]/g, ''));
        if (!isNaN(num) && num >= 0) reorderPoint = num;
      } else if (['packsize', 'casepack'].includes(norm)) {
        const num = parseFloat(cleanVal.replace(/[^0-9.-]/g, ''));
        if (!isNaN(num) && num > 0) packSize = num;
      } else if (['supplier', 'supplierid', 'vendor'].includes(norm)) {
        supplierId = cleanVal;
      } else if (['description', 'desc', 'notes'].includes(norm)) {
        description = cleanVal;
      }

      // Check for location-specific stock headers e.g. "stock_delhi", "delhi_stock", "stock_loc_delhi"
      for (const loc of availableLocations) {
        const locNormName = normalizeKey(loc.name);
        const locNormCode = normalizeKey(loc.code);
        const locNormId = normalizeKey(loc.id);

        if (
          norm.includes(locNormName) ||
          norm.includes(locNormCode) ||
          norm.includes(locNormId)
        ) {
          const num = parseFloat(cleanVal.replace(/[^0-9.-]/g, ''));
          if (!isNaN(num)) {
            stockByLocation[loc.id] = num;
          }
        }
      }
    }

    // Existing product lookup
    const existingProduct =
      (sku ? skuMap.get(sku.toLowerCase()) : undefined) ||
      (barcode ? barcodeMap.get(barcode.toLowerCase()) : undefined);

    const isExisting = !!existingProduct;

    // If existing, inherit missing fields from existing product
    if (existingProduct) {
      if (!sku) sku = existingProduct.sku;
      if (!name) name = existingProduct.name;
      if (!barcode) barcode = existingProduct.barcode;
      if (category === 'General') category = existingProduct.category;
      if (!brand) brand = existingProduct.brand;
      if (unit === 'pcs') unit = existingProduct.unit;
      if (!hsnCode) hsnCode = existingProduct.hsnCode;
      if (costPrice === undefined) costPrice = existingProduct.costPrice;
      if (sellingPrice === undefined) sellingPrice = existingProduct.sellingPrice;
      if (mrp === undefined) mrp = existingProduct.mrp;
      if (taxRate === undefined) taxRate = existingProduct.taxRate;
      if (reorderPoint === undefined) reorderPoint = existingProduct.reorderPoint;
      if (packSize === undefined) packSize = existingProduct.packSize;
      if (supplierId === '') supplierId = existingProduct.supplierId;
      if (stock === undefined && stockByLocation[targetLocation.id] === undefined) {
        stock = existingProduct.stockOnHand[targetLocation.id] ?? 0;
      }
    } else {
      if (taxRate === undefined) taxRate = 18;
      if (packSize === undefined) packSize = 1;

      // New product requires either SKU or Name
      if (!sku && !name) {
        issues.push('Missing both SKU and Name. At least one is required.');
      } else if (!sku && name) {
        // Auto-generate SKU from name
        sku = name
          .toUpperCase()
          .replace(/[^A-Z0-9]/g, '-')
          .slice(0, 10) + '-' + Math.floor(Math.random() * 900 + 100);
      } else if (sku && !name) {
        name = `Product (${sku})`;
      }

      if (sellingPrice === undefined) {
        if (mrp !== undefined) sellingPrice = mrp;
        else if (costPrice !== undefined) sellingPrice = Math.round(costPrice * 1.3);
        else sellingPrice = 100;
      }

      if (costPrice === undefined) {
        costPrice = Math.round(sellingPrice * 0.75);
      }

      if (mrp === undefined) {
        mrp = sellingPrice;
      }

      if (stock === undefined) {
        stock = 0;
      }

      if (reorderPoint === undefined) {
        reorderPoint = 10;
      }

      if (!barcode) {
        barcode = '890' + Math.floor(1000000000 + Math.random() * 9000000000);
      }
    }

    const hasErrors = issues.length > 0;
    if (hasErrors) {
      errorCount++;
    } else {
      if (isExisting) updateCount++;
      else newCount++;

      const validItem: BulkProductImportItem = {
        sku,
        name,
        barcode,
        category,
        brand,
        unit,
        hsnCode,
        costPrice,
        sellingPrice,
        mrp,
        taxRate,
        stock,
        stockByLocation,
        reorderPoint,
        packSize,
        supplierId,
        description,
      };
      validItems.push(validItem);
    }

    rowPreviews.push({
      rowNumber,
      sku: sku || '—',
      name: name || '—',
      stock: stock !== undefined ? stock : 0,
      sellingPrice: sellingPrice !== undefined ? sellingPrice : 0,
      costPrice: costPrice !== undefined ? costPrice : 0,
      mrp: mrp !== undefined ? mrp : 0,
      category,
      isExisting,
      hasErrors,
      issues,
    });
  });

  return {
    validItems,
    rowPreviews,
    summary: {
      totalRows: rows.length,
      validCount: validItems.length,
      newProductsCount: newCount,
      updateProductsCount: updateCount,
      errorCount,
    },
  };
}

/**
 * Generate a ready-to-use CSV template pre-filled with either current inventory or starter sample rows
 */
export function generateSampleCsv(currentProducts?: Product[], locations?: StoreLocation[]): string {
  if (currentProducts && currentProducts.length > 0) {
    const locHeaders = (locations || []).map((l) => `stock_${l.code.toLowerCase()}`);
    const headers = [
      'sku',
      'barcode',
      'name',
      'category',
      'brand',
      'unit',
      'hsn_code',
      'cost_price',
      'selling_price',
      'mrp',
      'tax_rate_percent',
      'stock_on_hand',
      ...locHeaders,
      'reorder_point',
      'supplier_id',
    ];

    const rows = currentProducts.slice(0, 15).map((p) => {
      const locStocks = (locations || []).map((l) => p.stockOnHand[l.id] || 0);
      const totalStock = Object.values(p.stockOnHand).reduce((a, b) => a + b, 0);

      return [
        `"${p.sku}"`,
        `"${p.barcode}"`,
        `"${p.name.replace(/"/g, '""')}"`,
        `"${p.category}"`,
        `"${p.brand}"`,
        `"${p.unit}"`,
        `"${p.hsnCode}"`,
        p.costPrice,
        p.sellingPrice,
        p.mrp,
        p.taxRate,
        totalStock,
        ...locStocks,
        p.reorderPoint,
        `"${p.supplierId}"`,
      ].join(',');
    });

    return [headers.join(','), ...rows].join('\r\n');
  }

  // Generic retail sample
  const sampleHeaders = [
    'sku',
    'barcode',
    'name',
    'category',
    'brand',
    'unit',
    'hsn_code',
    'cost_price',
    'selling_price',
    'mrp',
    'tax_rate_percent',
    'stock_on_hand',
    'reorder_point',
  ];

  const sampleRows = [
    'AUDIO-ANC-01,890123456701,SonicPro Wireless ANC Headphones,Electronics,SonicPro,pcs,85183000,2400,3499,3999,18,35,15',
    'PWR-65W-GAN,890123456702,HyperCharge 65W GaN Fast Charger,Accessories,HyperCharge,pcs,85044090,1100,1899,2299,18,50,20',
    'CBL-TC-2M,890123456703,Braided USB-C to USB-C 100W Cable 2M,Accessories,AnkerTech,pcs,85444299,260,599,799,18,120,40',
    'SPK-BT-MINI,890123456704,BoomPulse Rugged Waterproof BT Speaker,Electronics,BoomPulse,pcs,85182100,1350,2199,2499,18,24,10',
    'MOU-ERG-WL,890123456705,ErgoTrack Wireless Multi-Device Mouse,Peripherals,LogiCore,pcs,84716060,820,1499,1799,18,40,15',
    'STAND-ALUM-01,890123456706,AeroLift Aluminum Laptop Riser,Accessories,AeroLift,pcs,76169990,750,1299,1599,18,18,8',
  ];

  return [sampleHeaders.join(','), ...sampleRows].join('\r\n');
}
