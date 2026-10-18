import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  parseCSV,
  mapAndValidateProducts,
  generateSampleCsv,
  CsvMappingResult,
} from '../../utils/csvParser';
import {
  Upload,
  FileSpreadsheet,
  Download,
  AlertCircle,
  CheckCircle2,
  X,
  FileText,
  Boxes,
  HelpCircle,
  ArrowRight,
  Sparkles,
  Layers,
  Store,
  RefreshCw,
} from 'lucide-react';
import { CandyButton } from '../../design-system/components/CandyButton';
import { StatusBadge } from '../../design-system/components/StatusBadge';

interface CsvBulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CsvBulkUploadModal: React.FC<CsvBulkUploadModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const {
    products,
    currentLocation,
    currentBusiness,
    bulkImportProducts,
  } = useApp();

  const [inputMode, setInputMode] = useState<'file' | 'paste'>('file');
  const [csvRawText, setCsvRawText] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [parseResult, setParseResult] = useState<CsvMappingResult | null>(null);
  const [targetLocationId, setTargetLocationId] = useState<string>(currentLocation.id);
  const [stockMode, setStockMode] = useState<'replace' | 'adjust' | 'metadata_only'>('replace');
  const [isProcessing, setIsProcessing] = useState(false);
  const [importSummary, setImportSummary] = useState<{
    success: boolean;
    createdCount: number;
    updatedCount: number;
    totalProcessed: number;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const targetLocation =
    currentBusiness.locations.find((l) => l.id === targetLocationId) || currentLocation;

  // Process raw text through parser and validator
  const processCsvText = (text: string, sourceName: string) => {
    setFileName(sourceName);
    setCsvRawText(text);
    setImportSummary(null);

    const parsed = parseCSV(text);
    if (parsed.errors.length > 0 && parsed.rows.length === 0) {
      alert(`CSV Parsing Error: ${parsed.errors.join(', ')}`);
      return;
    }

    const mapping = mapAndValidateProducts(
      parsed.rows,
      products,
      targetLocation,
      currentBusiness.locations
    );
    setParseResult(mapping);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      processCsvText(content, file.name);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file && (file.name.endsWith('.csv') || file.type.includes('csv') || file.type.includes('text'))) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        processCsvText(content, file.name);
      };
      reader.readAsText(file);
    } else {
      alert('Please drop a valid .csv file.');
    }
  };

  const handleDownloadSample = () => {
    const csvContent = generateSampleCsv(undefined, currentBusiness.locations);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'dukaaniq_inventory_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportCurrent = () => {
    const csvContent = generateSampleCsv(products, currentBusiness.locations);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${currentBusiness.name.toLowerCase().replace(/\s+/g, '_')}_inventory.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLoadDemoData = () => {
    const demo = generateSampleCsv(undefined, currentBusiness.locations);
    processCsvText(demo, 'demo_retail_inventory.csv');
  };

  const handleExecuteImport = () => {
    if (!parseResult || parseResult.validItems.length === 0) return;

    setIsProcessing(true);
    try {
      const result = bulkImportProducts(parseResult.validItems, targetLocationId, stockMode);
      setImportSummary({
        success: true,
        createdCount: result.createdCount,
        updatedCount: result.updatedCount,
        totalProcessed: result.totalProcessed,
      });
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      alert(`Failed to import products: ${err?.message || 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setParseResult(null);
    setCsvRawText('');
    setFileName('');
    setImportSummary(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 shadow-xs">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 font-heading">
                  Bulk CSV Inventory & Metadata Upload
                </h3>
                <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded-full">
                  RFC-4180
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Bulk import products, SKU catalogs, prices, HSN tax codes, and warehouse stock counts
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Success Notification Banner */}
          {importSummary && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start justify-between gap-3 animate-in fade-in">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-sm">Bulk Import Succeeded!</div>
                  <div className="text-xs text-emerald-700 mt-0.5">
                    Processed <strong>{importSummary.totalProcessed}</strong> rows: updated{' '}
                    <strong>{importSummary.updatedCount}</strong> existing products and registered{' '}
                    <strong>{importSummary.createdCount}</strong> new SKUs at {targetLocation.name}. Stock audit movements have been logged.
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleReset}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  Upload Another File
                </button>
                <button
                  onClick={onClose}
                  className="px-3 py-1.5 bg-white border border-emerald-300 text-emerald-800 rounded-lg text-xs font-bold hover:bg-emerald-100/50 transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          )}

          {!parseResult ? (
            /* Upload & Input Selection View */
            <div className="space-y-4">
              {/* Quick Actions Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-600">Templates:</span>
                  <button
                    onClick={handleDownloadSample}
                    className="flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors cursor-pointer shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Download Blank CSV Template</span>
                  </button>
                  <button
                    onClick={handleExportCurrent}
                    className="flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors cursor-pointer shadow-2xs"
                  >
                    <FileText className="w-3.5 h-3.5 text-slate-500" />
                    <span>Export Existing Catalog ({products.length} SKUs)</span>
                  </button>
                </div>

                <button
                  onClick={handleLoadDemoData}
                  className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Load Sample Retail Data</span>
                </button>
              </div>

              {/* Mode Tabs */}
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                <button
                  onClick={() => setInputMode('file')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    inputMode === 'file'
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  Upload .CSV File
                </button>
                <button
                  onClick={() => setInputMode('paste')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    inputMode === 'paste'
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  Paste Raw CSV Text
                </button>
              </div>

              {inputMode === 'file' ? (
                /* Drag and drop zone */
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                    isDragging
                      ? 'border-indigo-600 bg-indigo-50/50 scale-[1.005]'
                      : 'border-slate-300 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-50'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,text/csv,application/vnd.ms-excel"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-center text-indigo-600 mb-3">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div className="text-sm font-bold text-slate-800 font-heading">
                    Click to browse or drop your CSV file here
                  </div>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm">
                    Supports comma and semicolon-separated files with UTF-8 encoding. Column headers are automatically detected.
                  </p>
                  <div className="mt-4 flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                    <span>.csv</span>
                    <span>•</span>
                    <span>Auto Header Mapping</span>
                    <span>•</span>
                    <span>Multi-Location Stock</span>
                  </div>
                </div>
              ) : (
                /* Raw text paste zone */
                <div className="space-y-3">
                  <textarea
                    rows={8}
                    value={csvRawText}
                    onChange={(e) => setCsvRawText(e.target.value)}
                    placeholder="sku,name,stock,selling_price,cost_price,category&#10;AUDIO-ANC-01,SonicPro Wireless Headphones,35,3499,2400,Electronics&#10;PWR-65W,HyperCharge 65W GaN,50,1899,1100,Accessories"
                    className="w-full p-4 font-mono text-xs border border-slate-200 rounded-xl bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600 resize-y"
                  />
                  <div className="flex justify-end">
                    <CandyButton
                      size="sm"
                      variant="primary"
                      disabled={!csvRawText.trim()}
                      onClick={() => processCsvText(csvRawText, 'pasted_data.csv')}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Parse CSV Data</span>
                    </CandyButton>
                  </div>
                </div>
              )}

              {/* Supported Columns Guide */}
              <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 text-blue-950 space-y-2 text-xs">
                <div className="font-bold flex items-center gap-1.5 text-blue-900">
                  <HelpCircle className="w-4 h-4 text-blue-600" />
                  <span>Smart Column Recognition & Supported Headers</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px] text-slate-600 pt-1">
                  <div>
                    <strong className="text-slate-900">SKU / Code:</strong> sku, item_code, code
                  </div>
                  <div>
                    <strong className="text-slate-900">Product Name:</strong> name, title, item_name
                  </div>
                  <div>
                    <strong className="text-slate-900">Stock Count:</strong> stock, qty, quantity
                  </div>
                  <div>
                    <strong className="text-slate-900">Selling Price:</strong> selling_price, price, sp
                  </div>
                  <div>
                    <strong className="text-slate-900">Cost Price:</strong> cost_price, cost, cp
                  </div>
                  <div>
                    <strong className="text-slate-900">MRP / List:</strong> mrp, maximum_retail_price
                  </div>
                  <div>
                    <strong className="text-slate-900">GST Rate %:</strong> tax_rate, gst, tax
                  </div>
                  <div>
                    <strong className="text-slate-900">HSN Code:</strong> hsn, hsn_code, sac
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Parsed Preview & Configuration View */
            <div className="space-y-5">
              {/* File Info & Back Button */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
                  <span className="font-bold text-sm text-slate-900">{fileName}</span>
                  <span className="text-xs text-slate-500 font-mono">
                    ({parseResult.summary.totalRows} rows parsed)
                  </span>
                </div>

                <button
                  onClick={handleReset}
                  className="text-xs text-slate-600 hover:text-slate-900 font-semibold underline cursor-pointer"
                >
                  Choose another file
                </button>
              </div>

              {/* Import Configuration Strip */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                {/* Target Store Location */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Store className="w-3.5 h-3.5 text-slate-500" />
                    <span>Apply Stock Level To Store:</span>
                  </label>
                  <select
                    value={targetLocationId}
                    onChange={(e) => {
                      setTargetLocationId(e.target.value);
                      // Re-validate against new location
                      if (csvRawText) {
                        const parsed = parseCSV(csvRawText);
                        const selectedLoc =
                          currentBusiness.locations.find((l) => l.id === e.target.value) || currentLocation;
                        setParseResult(
                          mapAndValidateProducts(
                            parsed.rows,
                            products,
                            selectedLoc,
                            currentBusiness.locations
                          )
                        );
                      }
                    }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  >
                    {currentBusiness.locations.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name} ({loc.city}) {loc.isWarehouse ? '— Central Hub' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Stock Update Mode */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Boxes className="w-3.5 h-3.5 text-slate-500" />
                    <span>Stock Update Behavior:</span>
                  </label>
                  <div className="grid grid-cols-3 gap-1.5 bg-white p-1 rounded-lg border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setStockMode('replace')}
                      className={`px-2 py-1.5 text-[11px] font-bold rounded-md transition-colors cursor-pointer ${
                        stockMode === 'replace'
                          ? 'bg-indigo-600 text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Set Absolute
                    </button>
                    <button
                      type="button"
                      onClick={() => setStockMode('adjust')}
                      className={`px-2 py-1.5 text-[11px] font-bold rounded-md transition-colors cursor-pointer ${
                        stockMode === 'adjust'
                          ? 'bg-indigo-600 text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Add/Sub Delta
                    </button>
                    <button
                      type="button"
                      onClick={() => setStockMode('metadata_only')}
                      className={`px-2 py-1.5 text-[11px] font-bold rounded-md transition-colors cursor-pointer ${
                        stockMode === 'metadata_only'
                          ? 'bg-indigo-600 text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Catalog Only
                    </button>
                  </div>
                </div>
              </div>

              {/* KPI Summary Chips */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                  <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                    Total Rows
                  </div>
                  <div className="text-xl font-extrabold text-slate-900 font-mono mt-0.5">
                    {parseResult.summary.totalRows}
                  </div>
                </div>

                <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 shadow-2xs">
                  <div className="text-[10px] text-blue-700 uppercase font-bold tracking-wider">
                    Update Existing SKUs
                  </div>
                  <div className="text-xl font-extrabold text-blue-900 font-mono mt-0.5">
                    {parseResult.summary.updateProductsCount}
                  </div>
                </div>

                <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 shadow-2xs">
                  <div className="text-[10px] text-emerald-700 uppercase font-bold tracking-wider">
                    New SKUs To Create
                  </div>
                  <div className="text-xl font-extrabold text-emerald-900 font-mono mt-0.5">
                    {parseResult.summary.newProductsCount}
                  </div>
                </div>

                <div className={`p-3 rounded-xl border shadow-2xs ${
                  parseResult.summary.errorCount > 0
                    ? 'bg-rose-50/60 border-rose-200'
                    : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className={`text-[10px] uppercase font-bold tracking-wider ${
                    parseResult.summary.errorCount > 0 ? 'text-rose-700' : 'text-slate-500'
                  }`}>
                    Errors / Skipped
                  </div>
                  <div className={`text-xl font-extrabold font-mono mt-0.5 ${
                    parseResult.summary.errorCount > 0 ? 'text-rose-700' : 'text-slate-700'
                  }`}>
                    {parseResult.summary.errorCount}
                  </div>
                </div>
              </div>

              {/* Preview Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                  <span>Data Mapping Preview (Showing up to 25 rows)</span>
                  <span>Target: {targetLocation.name}</span>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden bg-white max-h-72 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase font-semibold text-[10px] sticky top-0 z-10">
                      <tr>
                        <th className="py-2.5 px-3 w-12">#</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3">SKU</th>
                        <th className="py-2.5 px-3">Product Name</th>
                        <th className="py-2.5 px-3">Category</th>
                        <th className="py-2.5 px-3 text-right">Stock</th>
                        <th className="py-2.5 px-3 text-right">Cost Price</th>
                        <th className="py-2.5 px-3 text-right">Selling Price</th>
                        <th className="py-2.5 px-3 text-right">MRP</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      {parseResult.rowPreviews.slice(0, 25).map((row) => (
                        <tr
                          key={row.rowNumber}
                          className={`hover:bg-slate-50/70 transition-colors ${
                            row.hasErrors ? 'bg-rose-50/40 text-rose-900' : ''
                          }`}
                        >
                          <td className="py-2 px-3 text-slate-400 text-[11px]">
                            {row.rowNumber}
                          </td>
                          <td className="py-2 px-3">
                            {row.hasErrors ? (
                              <span className="inline-flex items-center gap-1 text-[10px] bg-rose-100 text-rose-800 font-sans font-bold px-1.5 py-0.5 rounded">
                                <AlertCircle className="w-3 h-3" />
                                <span>Error</span>
                              </span>
                            ) : row.isExisting ? (
                              <span className="inline-flex items-center gap-1 text-[10px] bg-blue-100 text-blue-800 font-sans font-bold px-1.5 py-0.5 rounded">
                                <span>Update</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-100 text-emerald-800 font-sans font-bold px-1.5 py-0.5 rounded">
                                <span>New</span>
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-3 font-bold text-slate-900 font-mono">
                            {row.sku}
                          </td>
                          <td className="py-2 px-3 font-sans text-slate-800 max-w-[200px] truncate" title={row.name}>
                            {row.name}
                            {row.issues.length > 0 && (
                              <div className="text-[10px] text-rose-600 font-normal">
                                {row.issues.join(' · ')}
                              </div>
                            )}
                          </td>
                          <td className="py-2 px-3 font-sans text-slate-500">
                            {row.category}
                          </td>
                          <td className="py-2 px-3 text-right font-bold text-slate-900">
                            {stockMode === 'metadata_only' ? '—' : row.stock}
                          </td>
                          <td className="py-2 px-3 text-right text-slate-600">
                            ₹{row.costPrice.toLocaleString()}
                          </td>
                          <td className="py-2 px-3 text-right font-semibold text-emerald-700">
                            ₹{row.sellingPrice.toLocaleString()}
                          </td>
                          <td className="py-2 px-3 text-right text-slate-400">
                            ₹{row.mrp.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold rounded-xl text-xs transition-colors cursor-pointer"
          >
            Cancel
          </button>

          {parseResult && (
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500">
                Ready to import <strong>{parseResult.validItems.length}</strong> valid products
              </span>
              <CandyButton
                size="md"
                variant="primary"
                disabled={isProcessing || parseResult.validItems.length === 0}
                onClick={handleExecuteImport}
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Importing...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Apply Import ({parseResult.validItems.length} SKUs)</span>
                  </>
                )}
              </CandyButton>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
