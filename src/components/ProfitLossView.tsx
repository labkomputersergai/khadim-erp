import React, { useState } from 'react';
import { ChartOfAccount, JournalEntry } from '../types';
import { formatIDR } from '../utils/formatters';
import {
  TrendingUp,
  Printer,
  Download,
  Calendar,
  Building,
  FileSpreadsheet,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';

interface ProfitLossViewProps {
  coaList: ChartOfAccount[];
  journals?: JournalEntry[];
}

export const ProfitLossView: React.FC<ProfitLossViewProps> = ({ coaList, journals = [] }) => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [startMonth, setStartMonth] = useState<number>(1); // 1 = Jan
  const [endMonth, setEndMonth] = useState<number>(12); // 12 = Dec

  const MONTH_NAMES = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  // Accounts filtering
  const revenueCoa = coaList.filter(a => a.category === 'REVENUE');
  const cogsCoa = coaList.filter(a => a.category === 'COGS');
  const expenseCoa = coaList.filter(a => a.category === 'EXPENSE');

  // Compute balance for an account considering date filters if journals exist
  const getAccountBalance = (account: ChartOfAccount) => {
    if (!journals || journals.length === 0) {
      return account.balance || 0;
    }

    // Filter journal lines for this account within month and year range
    let total = 0;
    let hasMatchingJournals = false;

    journals.forEach(j => {
      if (!j.transactionDate) return;
      const jDate = new Date(j.transactionDate);
      const jYear = jDate.getFullYear();
      const jMonth = jDate.getMonth() + 1; // 1-12

      if (jYear === selectedYear && jMonth >= startMonth && jMonth <= endMonth) {
        j.lines.forEach(l => {
          if (l.accountId === account.id || l.accountCode === account.code) {
            hasMatchingJournals = true;
            if (account.category === 'REVENUE') {
              total += (l.credit || 0) - (l.debit || 0);
            } else if (account.category === 'COGS' || account.category === 'EXPENSE') {
              total += (l.debit || 0) - (l.credit || 0);
            }
          }
        });
      }
    });

    // Fallback to COA default balance if no date-filtered journal entry exists for standard view
    if (!hasMatchingJournals && startMonth === 1 && endMonth === 12 && selectedYear === currentYear) {
      return account.balance || 0;
    }

    return total;
  };

  // Grouped Revenues
  const revUmrah = revenueCoa.filter(a => a.code === '4101').reduce((s, a) => s + getAccountBalance(a), 0);
  const revHaji = revenueCoa.filter(a => a.code === '4102').reduce((s, a) => s + getAccountBalance(a), 0);
  const revOther = revenueCoa.filter(a => !['4101', '4102'].includes(a.code)).reduce((s, a) => s + getAccountBalance(a), 0);
  const totalRevenue = revUmrah + revHaji + revOther;

  // Grouped COGS / HPP
  const cogsAirline = cogsCoa.filter(a => a.code === '5101').reduce((s, a) => s + getAccountBalance(a), 0);
  const cogsHotel = cogsCoa.filter(a => a.code === '5102').reduce((s, a) => s + getAccountBalance(a), 0);
  const cogsVisaAsuransi = cogsCoa.filter(a => a.code === '5103').reduce((s, a) => s + getAccountBalance(a), 0);
  const cogsLA = cogsCoa.filter(a => a.code === '5104').reduce((s, a) => s + getAccountBalance(a), 0);
  const cogsHandling = cogsCoa.filter(a => a.code === '5105').reduce((s, a) => s + getAccountBalance(a), 0);
  const cogsOther = cogsCoa.filter(a => !['5101', '5102', '5103', '5104', '5105'].includes(a.code)).reduce((s, a) => s + getAccountBalance(a), 0);
  const totalCogs = cogsAirline + cogsHotel + cogsVisaAsuransi + cogsLA + cogsHandling + cogsOther;

  // Gross Profit
  const grossProfit = totalRevenue - totalCogs;

  // Grouped Operating Expenses (OPEX)
  const expMitraCommission = expenseCoa.filter(a => a.code === '6104').reduce((s, a) => s + getAccountBalance(a), 0);
  const expOfficeOps = expenseCoa.filter(a => a.code === '6101').reduce((s, a) => s + getAccountBalance(a), 0);
  const expSalaries = expenseCoa.filter(a => a.code === '6102').reduce((s, a) => s + getAccountBalance(a), 0);
  const expMarketing = expenseCoa.filter(a => a.code === '6103').reduce((s, a) => s + getAccountBalance(a), 0);
  const expOther = expenseCoa.filter(a => !['6101', '6102', '6103', '6104'].includes(a.code)).reduce((s, a) => s + getAccountBalance(a), 0);
  const totalOpex = expMitraCommission + expOfficeOps + expSalaries + expMarketing + expOther;

  // Net Operating Income
  const netOperatingIncome = grossProfit - totalOpex;

  // Export to Excel / CSV
  const handleExportCSV = () => {
    const periodStr = `${MONTH_NAMES[startMonth - 1]} - ${MONTH_NAMES[endMonth - 1]} ${selectedYear}`;
    let csv = `PT. KHADIM ALHARAMAIN TOUR & TRAVEL\n`;
    csv += `LAPORAN LABA RUGI (INCOME STATEMENT)\n`;
    csv += `Periode: ${periodStr}\n\n`;
    csv += `Kategori Akun,Kode,Nama Akun,Nominal (IDR)\n`;

    csv += `PENDAPATAN OPERASIONAL,,,\n`;
    csv += `,4101,Pendapatan Paket Umrah,${revUmrah}\n`;
    csv += `,4102,Pendapatan Paket Haji Plus,${revHaji}\n`;
    csv += `,4103,Pendapatan Visa & Handling Add-on,${revOther}\n`;
    csv += `TOTAL PENDAPATAN OPERASIONAL,,,${totalRevenue}\n\n`;

    csv += `BEBAN HOK / HPP OPERASIONAL,,,\n`;
    csv += `,5101,HPP - Tiket Pesawat Maskapai,${cogsAirline}\n`;
    csv += `,5102,HPP - Hotel Makkah & Madinah,${cogsHotel}\n`;
    csv += `,5103,HPP - Visa & Asuransi Saudi,${cogsVisaAsuransi}\n`;
    csv += `,5104,HPP - Land Arrangement (LA) Saudi,${cogsLA}\n`;
    csv += `,5105,HPP - Perlengkapan & Handling Koper,${cogsHandling}\n`;
    csv += `TOTAL BEBAN HOK / HPP,,,${totalCogs}\n\n`;

    csv += `LABA KOTOR (GROSS PROFIT),,,${grossProfit}\n\n`;

    csv += `BEBAN OPERASIONAL & PEMASARAN (OPEX),,,\n`;
    csv += `,6104,Beban Komisi / Fee Mitra & Agen,${expMitraCommission}\n`;
    csv += `,6101,Beban Operasional Kantor,${expOfficeOps}\n`;
    csv += `,6102,Beban Gaji Staf & Muthawwif,${expSalaries}\n`;
    csv += `,6103,Beban Marketing & Syiar,${expMarketing}\n`;
    csv += `TOTAL BEBAN OPERASIONAL (OPEX),,,${totalOpex}\n\n`;

    csv += `LABA BERSIH OPERASIONAL (NET PROFIT),,,${netOperatingIncome}\n`;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Laporan_Laba_Rugi_${selectedYear}_${startMonth}-${endMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print PDF Layout
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4 sm:space-y-6 print:m-0 print:p-0 min-w-0 w-full max-w-full overflow-x-hidden">
      {/* Control Bar (Hidden on Print) */}
      <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4 print:hidden w-full min-w-0">
        {/* Date / Month Period Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full md:w-auto">
          <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 shrink-0">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <span>Periode Laporan:</span>
          </div>

          <div className="flex items-center space-x-1.5 w-full sm:w-auto">
            <select
              value={startMonth}
              onChange={(e) => setStartMonth(Number(e.target.value))}
              className="p-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg font-semibold outline-none flex-1 sm:flex-none"
            >
              {MONTH_NAMES.map((m, idx) => (
                <option key={idx} value={idx + 1}>{m}</option>
              ))}
            </select>

            <span className="text-xs font-bold text-slate-400 shrink-0">s/d</span>

            <select
              value={endMonth}
              onChange={(e) => setEndMonth(Number(e.target.value))}
              className="p-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg font-semibold outline-none flex-1 sm:flex-none"
            >
              {MONTH_NAMES.map((m, idx) => (
                <option key={idx} value={idx + 1}>{m}</option>
              ))}
            </select>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="p-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg font-mono font-bold outline-none shrink-0"
            >
              <option value={2026}>2026</option>
              <option value={2025}>2025</option>
              <option value={2024}>2024</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto justify-end">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 hover:bg-emerald-100 font-bold text-xs rounded-lg flex items-center justify-center space-x-1.5 transition-all w-full sm:w-auto"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Excel</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm flex items-center justify-center space-x-1.5 transition-all w-full sm:w-auto"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak PDF Laporan</span>
          </button>
        </div>
      </div>

      {/* Main Income Statement Document View */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-3.5 sm:p-6 md:p-8 print:p-0 print:border-none print:shadow-none max-w-4xl mx-auto min-w-0 w-full">
        
        {/* Kop Surat PT Khadim Alharamain */}
        <div className="border-b-2 border-slate-900 dark:border-slate-100 pb-4 sm:pb-5 mb-4 sm:mb-6 text-center">
          <div className="flex items-center justify-center space-x-2 text-emerald-600 dark:text-emerald-400 mb-1">
            <Building className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
            <span className="text-xs sm:text-sm font-black tracking-widest uppercase">PT. KHADIM ALHARAMAIN TOUR & TRAVEL</span>
          </div>
          <h1 className="text-base sm:text-xl font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight">
            LAPORAN LABA RUGI (INCOME STATEMENT)
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-1">
            Izin Umrah PPIU No. 9120201920831 — Kementerian Agama Republik Indonesia
          </p>
          <div className="text-xs font-mono font-extrabold text-emerald-700 dark:text-emerald-400 mt-2 bg-emerald-50 dark:bg-emerald-900/30 py-1 px-3 sm:px-4 rounded-full inline-block">
            Periode: {MONTH_NAMES[startMonth - 1]} - {MONTH_NAMES[endMonth - 1]} {selectedYear}
          </div>
        </div>

        {/* Multi-step Statement Table */}
        <div className="space-y-6 text-xs font-medium">
          
          {/* I. PENDAPATAN OPERASIONAL */}
          <div className="space-y-2">
            <div className="flex justify-between items-center bg-slate-100 dark:bg-slate-800/80 p-2.5 rounded-lg border-l-4 border-emerald-600 font-extrabold text-slate-900 dark:text-slate-100 uppercase tracking-wider text-[11px] sm:text-xs">
              <span>I. PENDAPATAN OPERASIONAL</span>
              <span>KODE COA</span>
            </div>

            <div className="pl-1 sm:pl-3 space-y-1 divide-y divide-slate-100 dark:divide-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 gap-1 sm:gap-4">
                <div className="flex items-start sm:items-center space-x-2 min-w-0">
                  <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono text-[10px] font-bold rounded shrink-0">4101</span>
                  <span className="text-slate-700 dark:text-slate-300 text-xs font-medium">
                    Pendapatan Paket Umrah <span className="text-[10px] text-slate-400 font-normal">(Pengakuan Pendapatan Kloter Selesai)</span>
                  </span>
                </div>
                <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm text-right self-end sm:self-auto shrink-0">
                  {formatIDR(revUmrah)}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 gap-1 sm:gap-4">
                <div className="flex items-center space-x-2 min-w-0">
                  <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono text-[10px] font-bold rounded shrink-0">4102</span>
                  <span className="text-slate-700 dark:text-slate-300 text-xs font-medium">Pendapatan Paket Haji Plus</span>
                </div>
                <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm text-right self-end sm:self-auto shrink-0">
                  {formatIDR(revHaji)}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 gap-1 sm:gap-4">
                <div className="flex items-center space-x-2 min-w-0">
                  <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono text-[10px] font-bold rounded shrink-0">4103</span>
                  <span className="text-slate-700 dark:text-slate-300 text-xs font-medium">Pendapatan Visa & Handling Add-on</span>
                </div>
                <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm text-right self-end sm:self-auto shrink-0">
                  {formatIDR(revOther)}
                </span>
              </div>
            </div>

            {/* Total Pendapatan */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2 border-t-2 border-slate-300 dark:border-slate-700 font-extrabold text-emerald-700 dark:text-emerald-400 text-xs px-2 gap-1">
              <span>TOTAL PENDAPATAN OPERASIONAL</span>
              <span className="font-mono text-sm sm:text-base self-end sm:self-auto">{formatIDR(totalRevenue)}</span>
            </div>
          </div>

          {/* II. BEBAN HOK / HPP OPERASIONAL */}
          <div className="space-y-2">
            <div className="flex justify-between items-center bg-slate-100 dark:bg-slate-800/80 p-2.5 rounded-lg border-l-4 border-rose-600 font-extrabold text-slate-900 dark:text-slate-100 uppercase tracking-wider text-[11px] sm:text-xs">
              <span>II. BEBAN HOK / HPP OPERASIONAL (COGS)</span>
              <span>KODE COA</span>
            </div>

            <div className="pl-1 sm:pl-3 space-y-1 divide-y divide-slate-100 dark:divide-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 gap-1 sm:gap-4">
                <div className="flex items-center space-x-2 min-w-0">
                  <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono text-[10px] font-bold rounded shrink-0">5101</span>
                  <span className="text-slate-700 dark:text-slate-300 text-xs font-medium">Biaya Tiket Pesawat Maskapai (Saudi/Garuda/Lion)</span>
                </div>
                <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm text-right self-end sm:self-auto shrink-0">
                  {formatIDR(cogsAirline)}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 gap-1 sm:gap-4">
                <div className="flex items-center space-x-2 min-w-0">
                  <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono text-[10px] font-bold rounded shrink-0">5102</span>
                  <span className="text-slate-700 dark:text-slate-300 text-xs font-medium">Biaya Hotel Makkah & Madinah</span>
                </div>
                <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm text-right self-end sm:self-auto shrink-0">
                  {formatIDR(cogsHotel)}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 gap-1 sm:gap-4">
                <div className="flex items-center space-x-2 min-w-0">
                  <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono text-[10px] font-bold rounded shrink-0">5103</span>
                  <span className="text-slate-700 dark:text-slate-300 text-xs font-medium">Biaya Visa & Asuransi Saudi</span>
                </div>
                <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm text-right self-end sm:self-auto shrink-0">
                  {formatIDR(cogsVisaAsuransi)}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 gap-1 sm:gap-4">
                <div className="flex items-center space-x-2 min-w-0">
                  <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono text-[10px] font-bold rounded shrink-0">5104</span>
                  <span className="text-slate-700 dark:text-slate-300 text-xs font-medium">Biaya Land Arrangement (LA) Saudi, Bus & Catering</span>
                </div>
                <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm text-right self-end sm:self-auto shrink-0">
                  {formatIDR(cogsLA)}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 gap-1 sm:gap-4">
                <div className="flex items-center space-x-2 min-w-0">
                  <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono text-[10px] font-bold rounded shrink-0">5105</span>
                  <span className="text-slate-700 dark:text-slate-300 text-xs font-medium">Biaya Perlengkapan, Batik & Handling Koper</span>
                </div>
                <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm text-right self-end sm:self-auto shrink-0">
                  {formatIDR(cogsHandling)}
                </span>
              </div>

              {cogsOther > 0 && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 gap-1 sm:gap-4">
                  <div className="flex items-center space-x-2 min-w-0">
                    <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono text-[10px] font-bold rounded shrink-0">51xx</span>
                    <span className="text-slate-700 dark:text-slate-300 text-xs font-medium">Beban HPP Lainnya</span>
                  </div>
                  <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm text-right self-end sm:self-auto shrink-0">
                    {formatIDR(cogsOther)}
                  </span>
                </div>
              )}
            </div>

            {/* Total HPP */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2 border-t-2 border-slate-300 dark:border-slate-700 font-extrabold text-rose-700 dark:text-rose-400 text-xs px-2 gap-1">
              <span>TOTAL BEBAN HOK / HPP OPERASIONAL</span>
              <span className="font-mono text-sm sm:text-base self-end sm:self-auto">({formatIDR(totalCogs)})</span>
            </div>
          </div>

          {/* GROSS PROFIT HIGHLIGHT */}
          <div className="p-3.5 sm:p-5 bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-500 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-sm w-full">
            <div>
              <div className="text-xs font-black uppercase text-emerald-900 dark:text-emerald-300 tracking-wider">
                LABA KOTOR OPERASIONAL (GROSS PROFIT)
              </div>
              <div className="text-[11px] text-emerald-700 dark:text-emerald-400">
                Laba sebelum dikurangi Beban Operasional Kantor & Pemasaran
              </div>
            </div>
            <div className="text-lg sm:text-2xl font-black font-mono text-emerald-700 dark:text-emerald-300 break-words self-end sm:self-auto">
              {formatIDR(grossProfit)}
            </div>
          </div>

          {/* III. BEBAN OPERASIONAL & PEMASARAN (OPEX) */}
          <div className="space-y-2">
            <div className="flex justify-between items-center bg-slate-100 dark:bg-slate-800/80 p-2.5 rounded-lg border-l-4 border-amber-500 font-extrabold text-slate-900 dark:text-slate-100 uppercase tracking-wider text-[11px] sm:text-xs">
              <span>III. BEBAN OPERASIONAL & PEMASARAN (OPEX)</span>
              <span>KODE COA</span>
            </div>

            <div className="pl-1 sm:pl-3 space-y-1 divide-y divide-slate-100 dark:divide-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 gap-1 sm:gap-4">
                <div className="flex items-center space-x-2 min-w-0">
                  <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono text-[10px] font-bold rounded shrink-0">6104</span>
                  <span className="text-slate-700 dark:text-slate-300 text-xs font-medium">Beban Komisi / Fee Referral Mitra & Agen</span>
                </div>
                <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm text-right self-end sm:self-auto shrink-0">
                  {formatIDR(expMitraCommission)}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 gap-1 sm:gap-4">
                <div className="flex items-center space-x-2 min-w-0">
                  <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono text-[10px] font-bold rounded shrink-0">6101</span>
                  <span className="text-slate-700 dark:text-slate-300 text-xs font-medium">Beban Operasional Kantor, Sewa & Listrik</span>
                </div>
                <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm text-right self-end sm:self-auto shrink-0">
                  {formatIDR(expOfficeOps)}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 gap-1 sm:gap-4">
                <div className="flex items-center space-x-2 min-w-0">
                  <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono text-[10px] font-bold rounded shrink-0">6102</span>
                  <span className="text-slate-700 dark:text-slate-300 text-xs font-medium">Beban Gaji Staf, Muthawwif & Tour Leader</span>
                </div>
                <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm text-right self-end sm:self-auto shrink-0">
                  {formatIDR(expSalaries)}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 gap-1 sm:gap-4">
                <div className="flex items-center space-x-2 min-w-0">
                  <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono text-[10px] font-bold rounded shrink-0">6103</span>
                  <span className="text-slate-700 dark:text-slate-300 text-xs font-medium">Beban Pemasaran, Iklan & Syiar</span>
                </div>
                <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm text-right self-end sm:self-auto shrink-0">
                  {formatIDR(expMarketing)}
                </span>
              </div>

              {expOther > 0 && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 gap-1 sm:gap-4">
                  <div className="flex items-center space-x-2 min-w-0">
                    <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono text-[10px] font-bold rounded shrink-0">61xx</span>
                    <span className="text-slate-700 dark:text-slate-300 text-xs font-medium">Beban Operasional Lainnya</span>
                  </div>
                  <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm text-right self-end sm:self-auto shrink-0">
                    {formatIDR(expOther)}
                  </span>
                </div>
              )}
            </div>

            {/* Total OPEX */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2 border-t-2 border-slate-300 dark:border-slate-700 font-extrabold text-amber-700 dark:text-amber-400 text-xs px-2 gap-1">
              <span>TOTAL BEBAN OPERASIONAL (OPEX)</span>
              <span className="font-mono text-sm sm:text-base self-end sm:self-auto">({formatIDR(totalOpex)})</span>
            </div>
          </div>

          {/* NET OPERATING INCOME / NET PROFIT HIGHLIGHT */}
          <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-md w-full">
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-emerald-100">
                LABA BERSIH OPERASIONAL (NET PROFIT)
              </div>
              <div className="text-[11px] text-emerald-200 mt-0.5">
                Hasil bersih akhir periode PT. Khadim Alharamain
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black font-mono text-white break-words self-end sm:self-auto">
              {formatIDR(netOperatingIncome)}
            </div>
          </div>

          {/* Printable Signature Footer (Appears on Print) */}
          <div className="pt-12 hidden print:grid grid-cols-3 gap-8 text-center text-xs">
            <div>
              <p className="font-bold">Disiapkan Oleh,</p>
              <div className="h-16"></div>
              <p className="font-bold underline">Senior Accountant</p>
              <p className="text-[10px] text-slate-500">Divisi Keuangan & Akuntansi</p>
            </div>
            <div>
              <p className="font-bold">Diverifikasi Oleh,</p>
              <div className="h-16"></div>
              <p className="font-bold underline">Finance Manager</p>
              <p className="text-[10px] text-slate-500">Manajer Keuangan Travel</p>
            </div>
            <div>
              <p className="font-bold">Disetujui Oleh,</p>
              <div className="h-16"></div>
              <p className="font-bold underline">Direktur Utama</p>
              <p className="text-[10px] text-slate-500">PT. Khadim Alharamain</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
