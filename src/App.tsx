/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  BookOpen, 
  Award, 
  Copy, 
  FileText, 
  Printer, 
  RotateCcw, 
  CheckCircle, 
  AlertCircle, 
  ArrowRight, 
  ChevronDown, 
  ChevronUp, 
  Info, 
  Coins, 
  TrendingUp, 
  Flame, 
  ExternalLink,
  Percent,
  TrendingDown,
  RefreshCw
} from 'lucide-react';

// --- Types & Interfaces ---
interface BonusState {
  oldStrike: number;
  oldFutures: number;
  oldLotSize: number;
  bonusRatioNum: number;
  bonusRatioDen: number;
}

interface SplitState {
  oldStrike: number;
  oldFutures: number;
  oldLotSize: number;
  splitRatio: number;
}

interface DividendState {
  dividendAmount: number;
  settlementPrice: number;
  existingStrike: number;
}

interface RightsState {
  oldStrike: number;
  oldFutures: number;
  oldLotSize: number;
  rightsShares: number;
  existingShares: number;
  rightsIssuePrice: number;
  cumRightsPrice: number;
}

export default function App() {
  // Navigation Tabs: 'calculator' | 'methodology' | 'examples' | 'upcoming'
  const [activeNav, setActiveNav] = useState<'calculator' | 'methodology' | 'examples' | 'upcoming'>('calculator');

  // Upcoming CA States & Function
  const [upcomingCA, setUpcomingCA] = useState<any[]>([]);
  const [upcomingLoading, setUpcomingLoading] = useState<boolean>(false);
  const [upcomingError, setUpcomingError] = useState<string | null>(null);
  const [upcomingFilter, setUpcomingFilter] = useState<string>('All');
  const [upcomingSearch, setUpcomingSearch] = useState<string>('');
  const [upcomingSources, setUpcomingSources] = useState<any[]>([]);
  const [upcomingSourceType, setUpcomingSourceType] = useState<string>('');

  const fetchUpcomingCA = async () => {
    setUpcomingLoading(true);
    setUpcomingError(null);
    try {
      const res = await fetch("/api/upcoming-ca");
      const json = await res.json();
      if (json.success) {
        setUpcomingCA(json.data || []);
        setUpcomingSources(json.sources || []);
        setUpcomingSourceType(json.source || 'local');
      } else {
        setUpcomingError(json.error || "Failed to load upcoming events.");
      }
    } catch (err) {
      console.error(err);
      setUpcomingError("Unable to communicate with the server API.");
    } finally {
      setUpcomingLoading(false);
    }
  };

  useEffect(() => {
    if (activeNav === 'upcoming' && upcomingCA.length === 0) {
      fetchUpcomingCA();
    }
  }, [activeNav, upcomingCA.length]);
  
  // Calculator Tabs: 'bonus' | 'split' | 'dividend' | 'rights'
  const [activeCalcTab, setActiveCalcTab] = useState<'bonus' | 'split' | 'dividend' | 'rights'>('bonus');

  // Toasts
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Default States
  const defaultBonus: BonusState = {
    oldStrike: 200,
    oldFutures: 205.5,
    oldLotSize: 3000,
    bonusRatioNum: 1,
    bonusRatioDen: 3,
  };

  const defaultSplit: SplitState = {
    oldStrike: 5000,
    oldFutures: 5035,
    oldLotSize: 125,
    splitRatio: 2,
  };

  const defaultDividend: DividendState = {
    dividendAmount: 22.75,
    settlementPrice: 310,
    existingStrike: 300,
  };

  const defaultRights: RightsState = {
    oldStrike: 180,
    oldFutures: 184.2,
    oldLotSize: 1500,
    rightsShares: 1,
    existingShares: 9,
    rightsIssuePrice: 104.5,
    cumRightsPrice: 150,
  };

  // Live Calculator inputs
  const [bonusInputs, setBonusInputs] = useState<BonusState>(defaultBonus);
  const [splitInputs, setSplitInputs] = useState<SplitState>(defaultSplit);
  const [dividendInputs, setDividendInputs] = useState<DividendState>(defaultDividend);
  const [rightsInputs, setRightsInputs] = useState<RightsState>(defaultRights);

  // Methodology Accordion States
  const [accordionOpen, setAccordionOpen] = useState({
    bonus: true,
    split: false,
    dividend: false,
    rights: false,
  });

  // Action messages / toasts
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Calculations for Bonus
  const calcBonusFactor = (bonusInputs.bonusRatioNum + bonusInputs.bonusRatioDen) / bonusInputs.bonusRatioDen;
  const bonusNewStrike = bonusInputs.oldStrike / calcBonusFactor;
  const bonusNewFutures = bonusInputs.oldFutures / calcBonusFactor;
  const bonusNewLotSize = bonusInputs.oldLotSize * calcBonusFactor;

  // Calculations for Split
  const splitNewStrike = splitInputs.oldStrike / splitInputs.splitRatio;
  const splitNewFutures = splitInputs.oldFutures / splitInputs.splitRatio;
  const splitNewLotSize = splitInputs.oldLotSize * splitInputs.splitRatio;

  // Calculations for Dividend
  const divRatio = (dividendInputs.dividendAmount / dividendInputs.settlementPrice) * 100;
  const divAdjustmentThresholdMet = divRatio >= 5.0;
  
  // Note: Standard National Stock Exchange (NSE) / SEBI FNO regulations state that
  // if the dividend declared is >= 5% of the market/settlement price, or is an extraordinary dividend, 
  // adjustments are made to option strikes and futures base prices.
  const divNewFutures = divAdjustmentThresholdMet
    ? dividendInputs.settlementPrice - dividendInputs.dividendAmount
    : dividendInputs.settlementPrice;
  const divNewStrike = divAdjustmentThresholdMet
    ? dividendInputs.existingStrike - dividendInputs.dividendAmount
    : dividendInputs.existingStrike;

  // Calculations for Rights
  // TERP = [(Existing Shares × Cum Rights Price) + (Rights Shares × Rights Issue Price)] / (Total Shares)
  const totalShares = rightsInputs.existingShares + rightsInputs.rightsShares;
  const terp = totalShares > 0 
    ? ((rightsInputs.existingShares * rightsInputs.cumRightsPrice) + (rightsInputs.rightsShares * rightsInputs.rightsIssuePrice)) / totalShares
    : 0;
  const rightsFactor = rightsInputs.cumRightsPrice > 0 ? terp / rightsInputs.cumRightsPrice : 1;
  const rightsNewStrike = rightsInputs.oldStrike * rightsFactor;
  const rightsNewFutures = rightsInputs.oldFutures * rightsFactor;
  const rightsNewLotSize = rightsFactor > 0 ? rightsInputs.oldLotSize / rightsFactor : rightsInputs.oldLotSize;

  // Real world examples list
  const examplesList = [
    {
      id: 'ex1',
      title: 'POWERGRID Bonus Issue',
      type: 'Bonus Issue',
      ratioText: '1:3 (1 Bonus Share for every 3 shares held)',
      inputs: {
        bonusRatioNum: 1,
        bonusRatioDen: 3,
        oldStrike: 200,
        oldFutures: 204.8,
        oldLotSize: 2000
      },
      explanation: 'With a 1:3 ratio, the adjustment factor is (1 + 3) / 3 = 1.333333. The strike price changes from 200 to 200 / 1.333333 = 150. The lot size scales proportionally from 2,000 to 2,000 * 1.33 = 2,667.',
      action: () => {
        setBonusInputs({
          oldStrike: 200,
          oldFutures: 204.8,
          oldLotSize: 2000,
          bonusRatioNum: 1,
          bonusRatioDen: 3
        });
        setActiveCalcTab('bonus');
        setActiveNav('calculator');
        triggerToast("Loaded POWERGRID Bonus Issue Example!");
      }
    },
    {
      id: 'ex2',
      title: 'IPCALAB Stock Split',
      type: 'Stock Split',
      ratioText: '2:1 Split (Split Ratio of 2)',
      inputs: {
        splitRatio: 2,
        oldStrike: 5000,
        oldFutures: 5080,
        oldLotSize: 200
      },
      explanation: 'With a 2-for-1 split, the split ratio is 2. The new strike is 5000 / 2 = 2500. The new futures price is 5080 / 2 = 2540. The market lot size is doubled from 200 to 400 to maintain equivalent contract value.',
      action: () => {
        setSplitInputs({
          oldStrike: 5000,
          oldFutures: 5080,
          oldLotSize: 200,
          splitRatio: 2
        });
        setActiveCalcTab('split');
        setActiveNav('calculator');
        triggerToast("Loaded IPCALAB Stock Split Example!");
      }
    },
    {
      id: 'ex3',
      title: 'HINDPETRO Dividend',
      type: 'Dividend Adjustment',
      ratioText: 'Dividend of ₹22.75 on Futures Price of ₹310',
      inputs: {
        dividendAmount: 22.75,
        settlementPrice: 310,
        existingStrike: 300
      },
      explanation: 'Since ₹22.75 is 7.34% of the settlement price (>= 5% threshold), the dividend is considered extraordinary. The adjusted futures base price is 310 - 22.75 = 287.25 and the options strike is adjusted to 300 - 22.75 = 277.25.',
      action: () => {
        setDividendInputs({
          dividendAmount: 22.75,
          settlementPrice: 310,
          existingStrike: 300
        });
        setActiveCalcTab('dividend');
        setActiveNav('calculator');
        triggerToast("Loaded HINDPETRO Dividend Example!");
      }
    },
    {
      id: 'ex4',
      title: 'INDHOTEL Rights Issue',
      type: 'Rights Issue',
      ratioText: 'Ratio 1:9 (1 Rights share for every 9 held)',
      inputs: {
        rightsShares: 1,
        existingShares: 9,
        rightsIssuePrice: 104.5,
        cumRightsPrice: 150,
        oldStrike: 180,
        oldFutures: 184.2,
        oldLotSize: 1500
      },
      explanation: `Theoretical Ex-Rights Price (TERP) is [(9 * 150) + (1 * 104.5)] / (9 + 1) = 145.45.
      The adjustment factor is 145.45 / 150 = 0.969667.
      The strike price is adjusted to 180 * 0.969667 = 174.54.
      The futures price adjusts to 184.2 * 0.969667 = 178.61.
      The lot size is adjusted to 1500 / 0.969667 = 1547.`,
      action: () => {
        setRightsInputs({
          oldStrike: 180,
          oldFutures: 184.2,
          oldLotSize: 1500,
          rightsShares: 1,
          existingShares: 9,
          rightsIssuePrice: 104.5,
          cumRightsPrice: 150
        });
        setActiveCalcTab('rights');
        setActiveNav('calculator');
        triggerToast("Loaded INDHOTEL Rights Issue Example!");
      }
    }
  ];

  // Apply upcoming corporate actions to the calculators
  const applyUpcomingToCalculator = (event: any) => {
    const sym = event.symbol;
    const num = Number(event.ratioNumerator) || 1;
    const den = Number(event.ratioDenominator) || 1;

    if (event.type === 'Bonus Issue') {
      setBonusInputs({
        oldStrike: 300,
        oldFutures: 305.5,
        oldLotSize: 1500,
        bonusRatioNum: num,
        bonusRatioDen: den
      });
      setActiveCalcTab('bonus');
      setActiveNav('calculator');
      triggerToast(`Loaded upcoming ${sym} Bonus Issue (${num}:${den}) into active calculator!`);
    } else if (event.type === 'Stock Split') {
      setSplitInputs({
        oldStrike: 1000,
        oldFutures: 1010,
        oldLotSize: 200,
        splitRatio: num
      });
      setActiveCalcTab('split');
      setActiveNav('calculator');
      triggerToast(`Loaded upcoming ${sym} Stock Split (Ratio ${num}:1) into active calculator!`);
    } else if (event.type === 'Dividend') {
      setDividendInputs({
        dividendAmount: num,
        settlementPrice: den && den > num ? den : 300,
        existingStrike: den && den > num ? Math.round(den / 10) * 10 : 300
      });
      setActiveCalcTab('dividend');
      setActiveNav('calculator');
      triggerToast(`Loaded upcoming ${sym} Dividend (₹${num}) into active calculator!`);
    } else if (event.type === 'Rights Issue') {
      setRightsInputs({
        oldStrike: 200,
        oldFutures: 205,
        oldLotSize: 1500,
        rightsShares: num,
        existingShares: den,
        rightsIssuePrice: Math.round((den && den > 50 ? den : 150) * 0.75),
        cumRightsPrice: den && den > 50 ? den : 150
      });
      setActiveCalcTab('rights');
      setActiveNav('calculator');
      triggerToast(`Loaded upcoming ${sym} Rights Issue (${num}:${den}) into active calculator!`);
    }
  };

  // Reset function
  const handleReset = () => {
    if (activeCalcTab === 'bonus') {
      setBonusInputs(defaultBonus);
      triggerToast("Bonus Issue inputs reset to defaults.");
    } else if (activeCalcTab === 'split') {
      setSplitInputs(defaultSplit);
      triggerToast("Stock Split inputs reset to defaults.");
    } else if (activeCalcTab === 'dividend') {
      setDividendInputs(defaultDividend);
      triggerToast("Dividend inputs reset to defaults.");
    } else if (activeCalcTab === 'rights') {
      setRightsInputs(defaultRights);
      triggerToast("Rights Issue inputs reset to defaults.");
    }
  };

  // Copy Results function
  const handleCopyResults = () => {
    let text = `--- Corporate Action FNO Adjustment Results ---\n`;
    text += `Timestamp: ${new Date().toLocaleString()}\n\n`;

    if (activeCalcTab === 'bonus') {
      text += `Action: BONUS ISSUE ADJUSTMENT\n`;
      text += `Bonus Ratio: ${bonusInputs.bonusRatioNum} : ${bonusInputs.bonusRatioDen}\n`;
      text += `Old Strike Price: ₹${bonusInputs.oldStrike}\n`;
      text += `Old Futures Price: ₹${bonusInputs.oldFutures}\n`;
      text += `Old Lot Size: ${bonusInputs.oldLotSize}\n`;
      text += `-----------------------------------------------\n`;
      text += `Adjustment Factor: ${calcBonusFactor.toFixed(6)}\n`;
      text += `New Strike Price: ₹${bonusNewStrike.toFixed(2)}\n`;
      text += `New Futures Price: ₹${bonusNewFutures.toFixed(2)}\n`;
      text += `New Lot Size: ${Math.round(bonusNewLotSize)} (Exact: ${bonusNewLotSize.toFixed(4)})\n`;
    } else if (activeCalcTab === 'split') {
      text += `Action: STOCK SPLIT ADJUSTMENT\n`;
      text += `Split Ratio: ${splitInputs.splitRatio} : 1\n`;
      text += `Old Strike Price: ₹${splitInputs.oldStrike}\n`;
      text += `Old Futures Price: ₹${splitInputs.oldFutures}\n`;
      text += `Old Lot Size: ${splitInputs.oldLotSize}\n`;
      text += `-----------------------------------------------\n`;
      text += `New Strike Price: ₹${splitNewStrike.toFixed(2)}\n`;
      text += `New Futures Price: ₹${splitNewFutures.toFixed(2)}\n`;
      text += `New Lot Size: ${Math.round(splitNewLotSize)} (Exact: ${splitNewLotSize.toFixed(4)})\n`;
    } else if (activeCalcTab === 'dividend') {
      text += `Action: EXTRAORDINARY DIVIDEND ADJUSTMENT\n`;
      text += `Dividend Amount: ₹${dividendInputs.dividendAmount}\n`;
      text += `Futures Settlement Price: ₹${dividendInputs.settlementPrice}\n`;
      text += `Existing Option Strike: ₹${dividendInputs.existingStrike}\n`;
      text += `-----------------------------------------------\n`;
      text += `Dividend % of Market Value: ${divRatio.toFixed(2)}%\n`;
      text += `Adjustment Applicable? ${divAdjustmentThresholdMet ? "YES (>= 5% threshold)" : "NO (< 5% threshold)"}\n`;
      text += `New Futures Base Price: ₹${divNewFutures.toFixed(2)}\n`;
      text += `New Option Strike Price: ₹${divNewStrike.toFixed(2)}\n`;
    } else if (activeCalcTab === 'rights') {
      text += `Action: RIGHTS ISSUE ADJUSTMENT\n`;
      text += `Rights Ratio: ${rightsInputs.rightsShares} : ${rightsInputs.existingShares}\n`;
      text += `Rights Issue Price: ₹${rightsInputs.rightsIssuePrice}\n`;
      text += `Cum-Rights Market Price: ₹${rightsInputs.cumRightsPrice}\n`;
      text += `Old Strike Price: ₹${rightsInputs.oldStrike}\n`;
      text += `Old Futures Price: ₹${rightsInputs.oldFutures}\n`;
      text += `Old Lot Size: ${rightsInputs.oldLotSize}\n`;
      text += `-----------------------------------------------\n`;
      text += `Theoretical Ex-Rights Price (TERP): ₹${terp.toFixed(2)}\n`;
      text += `Adjustment Factor: ${rightsFactor.toFixed(6)}\n`;
      text += `New Strike Price: ₹${rightsNewStrike.toFixed(2)}\n`;
      text += `New Futures Price: ₹${rightsNewFutures.toFixed(2)}\n`;
      text += `New Lot Size: ${Math.round(rightsNewLotSize)} (Exact: ${rightsNewLotSize.toFixed(4)})\n`;
    }

    navigator.clipboard.writeText(text).then(() => {
      triggerToast("Results copied to clipboard!");
    }).catch(() => {
      triggerToast("Failed to copy results.");
    });
  };

  // Print results
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans transition-colors duration-300">
      
      {/* --- Toast System --- */}
      {toastMessage && (
        <div id="toast-notification" className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-bounce">
          <CheckCircle className="text-emerald-400 w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* --- Dashboard Header --- */}
      <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white border-b border-indigo-900 shadow-md py-6 px-4 sm:px-8 no-print">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-indigo-500/20 text-indigo-300 px-2.5 py-1 rounded text-xs font-semibold tracking-wider uppercase border border-indigo-500/30">
                FNO Trades & Derivatives
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <Calculator className="text-indigo-400 w-8 h-8" />
              Corporate Action Calculator
            </h1>
            <p className="text-slate-300 text-sm sm:text-base mt-1 font-light">
              Futures & Options adjustments for Bonus Issues, Stock Splits, Dividends, and Rights Issues
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 font-mono bg-slate-950 px-3 py-1.5 rounded border border-slate-800">
              NSE / SEBI Compliant Rules
            </span>
          </div>
        </div>
      </header>

      {/* --- Navigation Bar --- */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex gap-1 md:gap-4 overflow-x-auto py-3">
            <button
              onClick={() => setActiveNav('calculator')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
                activeNav === 'calculator' 
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Calculator className="w-4 h-4" />
              Adjustment Calculators
            </button>
            <button
              onClick={() => setActiveNav('methodology')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
                activeNav === 'methodology' 
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              FNO Regulatory Methodology
            </button>
            <button
              onClick={() => setActiveNav('examples')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
                activeNav === 'examples' 
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Award className="w-4 h-4" />
              Real Corporate Examples
            </button>
            <button
              id="upcoming-events-tab"
              onClick={() => setActiveNav('upcoming')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
                activeNav === 'upcoming' 
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              Upcoming Exchange Events
              <span className="ml-1 bg-indigo-500/10 text-indigo-600 text-[10px] px-1.5 py-0.5 rounded font-bold">
                Live Fetch
              </span>
            </button>
          </div>
        </div>
      </nav>

      {/* --- Main Contents Space --- */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8">
        
        {/* =========================================================================
            NAV TAB 1 : CALCULATOR SECTION 
            ========================================================================= */}
        {activeNav === 'calculator' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 print-full-width">
            
            {/* Sidebar / Subtabs Selector */}
            <div className="lg:col-span-3 space-y-2 no-print">
              <span className="text-xs uppercase text-slate-400 font-bold tracking-widest pl-2">Select Corporate Event</span>
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
                <button
                  onClick={() => setActiveCalcTab('bonus')}
                  className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all duration-200 ${
                    activeCalcTab === 'bonus'
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-950 ring-2 ring-indigo-500/20'
                      : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="font-semibold text-sm">Bonus Issue</span>
                  <span className="text-xs font-light text-slate-500 mt-1">Free shares in proportion</span>
                </button>

                <button
                  onClick={() => setActiveCalcTab('split')}
                  className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all duration-200 ${
                    activeCalcTab === 'split'
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-950 ring-2 ring-indigo-500/20'
                      : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="font-semibold text-sm">Stock Split</span>
                  <span className="text-xs font-light text-slate-500 mt-1">Dividing existing shares</span>
                </button>

                <button
                  onClick={() => setActiveCalcTab('dividend')}
                  className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all duration-200 ${
                    activeCalcTab === 'dividend'
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-950 ring-2 ring-indigo-500/20'
                      : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="font-semibold text-sm">Dividend Adjustment</span>
                  <span className="text-xs font-light text-slate-500 mt-1">Ex-dividend adjustments</span>
                </button>

                <button
                  onClick={() => setActiveCalcTab('rights')}
                  className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all duration-200 ${
                    activeCalcTab === 'rights'
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-950 ring-2 ring-indigo-500/20'
                      : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="font-semibold text-sm">Rights Issue</span>
                  <span className="text-xs font-light text-slate-500 mt-1">Subscription rights for holders</span>
                </button>
              </div>

              {/* Quick info panel */}
              <div className="bg-slate-900 text-slate-300 p-4 rounded-xl border border-slate-800 text-xs leading-relaxed space-y-2 mt-4 shadow-sm">
                <div className="flex items-center gap-1.5 font-bold text-white uppercase tracking-wider mb-1">
                  <Info className="w-3.5 h-3.5 text-indigo-400" /> Key Directive
                </div>
                <p>Derivatives (FnO) contract adjustments ensure that the overall option premium value and futures contracts remain financially neutral pre & post corporate actions.</p>
                <p className="font-mono text-[10px] text-slate-500 border-t border-slate-800 pt-2">All output values calculated instantly using standard exchange methodologies.</p>
              </div>
            </div>

            {/* Main Interactive Work Stage */}
            <div className="lg:col-span-9 space-y-6 print-full-width">
              
              {/* Toolbar Section */}
              <div className="bg-slate-900 text-white rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm no-print">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm bg-indigo-600/30 text-indigo-300 px-2.5 py-1 rounded-md border border-indigo-500/30">
                    {activeCalcTab === 'bonus' && "Bonus Issue Calculator"}
                    {activeCalcTab === 'split' && "Stock Split Calculator"}
                    {activeCalcTab === 'dividend' && "Dividend Adjustment Calculator"}
                    {activeCalcTab === 'rights' && "Rights Issue Calculator"}
                  </span>
                </div>
                
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold rounded-lg transition-all"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                    Reset
                  </button>
                  <button
                    onClick={handleCopyResults}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold rounded-lg transition-all"
                  >
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    Copy Results
                  </button>
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold rounded-lg transition-all"
                  >
                    <Printer className="w-3.5 h-3.5 text-slate-400" />
                    Print
                  </button>
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold rounded-lg transition-all"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Export to PDF
                  </button>
                </div>
              </div>

              {/* Active Tab: BONUS ISSUE CALCULATOR */}
              {activeCalcTab === 'bonus' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print-full-width">
                  {/* Inputs Card */}
                  <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4">
                    <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2 text-base">
                      <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                      Input Parameters
                    </h3>

                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                        Bonus Ratio (Numerator : Denominator)
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <input 
                            type="number" 
                            className="bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white w-full px-3 py-2 rounded-lg text-sm font-semibold transition-all"
                            value={bonusInputs.bonusRatioNum} 
                            placeholder="Numerator"
                            min="1"
                            onChange={(e) => setBonusInputs({...bonusInputs, bonusRatioNum: Math.max(1, parseInt(e.target.value) || 1)})}
                          />
                          <span className="text-[10px] text-slate-400 mt-1 block">Bonus Shares Granted</span>
                        </div>
                        <div>
                          <input 
                            type="number" 
                            className="bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white w-full px-3 py-2 rounded-lg text-sm font-semibold transition-all"
                            value={bonusInputs.bonusRatioDen} 
                            placeholder="Denominator"
                            min="1"
                            onChange={(e) => setBonusInputs({...bonusInputs, bonusRatioDen: Math.max(1, parseInt(e.target.value) || 1)})}
                          />
                          <span className="text-[10px] text-slate-400 mt-1 block">Existing Shares Held</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                        Old Strike Price (₹)
                      </label>
                      <input 
                        type="number" 
                        step="0.05"
                        className="bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white w-full px-3 py-2 rounded-lg text-sm font-semibold transition-all"
                        value={bonusInputs.oldStrike} 
                        onChange={(e) => setBonusInputs({...bonusInputs, oldStrike: Math.max(0, parseFloat(e.target.value) || 0)})}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                        Old Futures Price (₹)
                      </label>
                      <input 
                        type="number" 
                        step="0.05"
                        className="bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white w-full px-3 py-2 rounded-lg text-sm font-semibold transition-all"
                        value={bonusInputs.oldFutures} 
                        onChange={(e) => setBonusInputs({...bonusInputs, oldFutures: Math.max(0, parseFloat(e.target.value) || 0)})}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                        Old Market Lot Size
                      </label>
                      <input 
                        type="number" 
                        className="bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white w-full px-3 py-2 rounded-lg text-sm font-semibold transition-all"
                        value={bonusInputs.oldLotSize} 
                        onChange={(e) => setBonusInputs({...bonusInputs, oldLotSize: Math.max(1, parseInt(e.target.value) || 1)})}
                      />
                    </div>
                  </div>

                  {/* Calculations Output Card */}
                  <div id="results-bonus" className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl shadow-xl p-6 flex flex-col justify-between border border-indigo-950">
                    <div>
                      <h3 className="font-bold border-b border-indigo-900/50 pb-3 flex items-center justify-between text-base">
                        <span className="flex items-center gap-2">
                          <CheckCircle className="text-indigo-400 w-5 h-5" />
                          Adjustment Results
                        </span>
                        <span className="text-[10px] uppercase tracking-wider font-mono bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/20">
                          Live Active
                        </span>
                      </h3>

                      <div className="space-y-4 py-4">
                        {/* Adjustment Factor Display */}
                        <div className="bg-indigo-950/40 p-3 rounded-lg border border-indigo-900/30 flex justify-between items-center">
                          <div>
                            <span className="text-xs text-indigo-200 block font-semibold">Adjustment Factor</span>
                            <span className="text-2xl font-bold font-mono text-emerald-400">
                              {calcBonusFactor.toFixed(6)}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 max-w-[120px] text-right">
                            ({bonusInputs.bonusRatioNum} + {bonusInputs.bonusRatioDen}) / {bonusInputs.bonusRatioDen}
                          </span>
                        </div>

                        {/* Adjustments table */}
                        <div className="space-y-3 font-mono text-sm">
                          <div className="flex justify-between items-center py-2 border-b border-indigo-900/30">
                            <span className="text-slate-300">New Strike Price</span>
                            <div className="text-right">
                              <div className="text-white font-bold text-lg">
                                ₹{bonusNewStrike.toFixed(2)}
                              </div>
                              <div className="text-[10px] text-slate-400">
                                {bonusInputs.oldStrike} / {calcBonusFactor.toFixed(4)}
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-between items-center py-2 border-b border-indigo-900/30">
                            <span className="text-slate-300">New Futures Price</span>
                            <div className="text-right">
                              <div className="text-white font-bold">
                                ₹{bonusNewFutures.toFixed(2)}
                              </div>
                              <div className="text-[10px] text-slate-400">
                                {bonusInputs.oldFutures} / {calcBonusFactor.toFixed(4)}
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-between items-center py-2">
                            <span className="text-slate-300">New Lot Size</span>
                            <div className="text-right">
                              <div className="text-emerald-400 font-bold text-lg">
                                {Math.round(bonusNewLotSize)}
                              </div>
                              <div className="text-[10px] text-slate-400">
                                Exact: {bonusNewLotSize.toFixed(4)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-300 bg-white/5 p-3 rounded-lg border border-white/5 font-sans leading-relaxed">
                      <strong>Methodology Note:</strong> Bonus ratio of {bonusInputs.bonusRatioNum}:{bonusInputs.bonusRatioDen} results in an adjustment factor of {calcBonusFactor.toFixed(4)}. Strike and Futures prices are divided by this factor, while lot sizes are multiplied.
                    </div>
                  </div>
                </div>
              )}

              {/* Active Tab: STOCK SPLIT CALCULATOR */}
              {activeCalcTab === 'split' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print-full-width">
                  {/* Inputs Card */}
                  <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4">
                    <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2 text-base">
                      <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                      Input Parameters
                    </h3>

                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                        Split Ratio
                      </label>
                      <input 
                        type="number" 
                        className="bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white w-full px-3 py-2 rounded-lg text-sm font-semibold transition-all"
                        value={splitInputs.splitRatio} 
                        placeholder="e.g. 2 for a 2-for-1 split"
                        min="1"
                        onChange={(e) => setSplitInputs({...splitInputs, splitRatio: Math.max(1, parseFloat(e.target.value) || 1)})}
                      />
                      <span className="text-[11px] text-slate-400 mt-1 block">Specify splitting factor (e.g. 2 means 2 shares for every 1 existing share, i.e., split ratio of 2)</span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                        Old Strike Price (₹)
                      </label>
                      <input 
                        type="number" 
                        step="0.05"
                        className="bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white w-full px-3 py-2 rounded-lg text-sm font-semibold transition-all"
                        value={splitInputs.oldStrike} 
                        onChange={(e) => setSplitInputs({...splitInputs, oldStrike: Math.max(0, parseFloat(e.target.value) || 0)})}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                        Old Futures Price (₹)
                      </label>
                      <input 
                        type="number" 
                        step="0.05"
                        className="bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white w-full px-3 py-2 rounded-lg text-sm font-semibold transition-all"
                        value={splitInputs.oldFutures} 
                        onChange={(e) => setSplitInputs({...splitInputs, oldFutures: Math.max(0, parseFloat(e.target.value) || 0)})}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                        Old Market Lot Size
                      </label>
                      <input 
                        type="number" 
                        className="bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white w-full px-3 py-2 rounded-lg text-sm font-semibold transition-all"
                        value={splitInputs.oldLotSize} 
                        onChange={(e) => setSplitInputs({...splitInputs, oldLotSize: Math.max(1, parseInt(e.target.value) || 1)})}
                      />
                    </div>
                  </div>

                  {/* Calculations Output Card */}
                  <div id="results-split" className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl shadow-xl p-6 flex flex-col justify-between border border-indigo-950">
                    <div>
                      <h3 className="font-bold border-b border-indigo-900/50 pb-3 flex items-center justify-between text-base">
                        <span className="flex items-center gap-2">
                          <CheckCircle className="text-indigo-400 w-5 h-5" />
                          Adjustment Results
                        </span>
                        <span className="text-[10px] uppercase tracking-wider font-mono bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/20">
                          Live Active
                        </span>
                      </h3>

                      <div className="space-y-4 py-4">
                        {/* Adjustment Factor Display */}
                        <div className="bg-indigo-950/40 p-3 rounded-lg border border-indigo-900/30 flex justify-between items-center">
                          <div>
                            <span className="text-xs text-indigo-200 block font-semibold">Stock Split Ratio</span>
                            <span className="text-2xl font-bold font-mono text-emerald-400">
                              {splitInputs.splitRatio.toFixed(2)} : 1
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400">
                            Split factor of {splitInputs.splitRatio}
                          </span>
                        </div>

                        {/* Adjustments table */}
                        <div className="space-y-3 font-mono text-sm">
                          <div className="flex justify-between items-center py-2 border-b border-indigo-900/30">
                            <span className="text-slate-300">New Strike Price</span>
                            <div className="text-right">
                              <div className="text-white font-bold text-lg">
                                ₹{splitNewStrike.toFixed(2)}
                              </div>
                              <div className="text-[10px] text-slate-400">
                                {splitInputs.oldStrike} / {splitInputs.splitRatio}
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-between items-center py-2 border-b border-indigo-900/30">
                            <span className="text-slate-300">New Futures Price</span>
                            <div className="text-right">
                              <div className="text-white font-bold">
                                ₹{splitNewFutures.toFixed(2)}
                              </div>
                              <div className="text-[10px] text-slate-400">
                                {splitInputs.oldFutures} / {splitInputs.splitRatio}
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-between items-center py-2">
                            <span className="text-slate-300">New Lot Size</span>
                            <div className="text-right">
                              <div className="text-emerald-400 font-bold text-lg">
                                {Math.round(splitNewLotSize)}
                              </div>
                              <div className="text-[10px] text-slate-400">
                                Exact: {splitNewLotSize.toFixed(4)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-300 bg-white/5 p-3 rounded-lg border border-white/5 font-sans leading-relaxed">
                      <strong>Methodology Note:</strong> A stock split replaces old contracts with new adjusted contracts. Prices are divided by the split factor, and the FNO lot size is scaled up proportionally so that overall contract face value is unchanged.
                    </div>
                  </div>
                </div>
              )}

              {/* Active Tab: DIVIDEND ADJUSTMENT CALCULATOR */}
              {activeCalcTab === 'dividend' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print-full-width">
                  {/* Inputs Card */}
                  <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4">
                    <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2 text-base">
                      <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                      Input Parameters
                    </h3>

                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                        Dividend Amount (₹)
                      </label>
                      <input 
                        type="number" 
                        step="0.05"
                        className="bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white w-full px-3 py-2 rounded-lg text-sm font-semibold transition-all"
                        value={dividendInputs.dividendAmount} 
                        onChange={(e) => setDividendInputs({...dividendInputs, dividendAmount: Math.max(0, parseFloat(e.target.value) || 0)})}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                        Futures Settlement/Market Price (₹)
                      </label>
                      <input 
                        type="number" 
                        step="0.05"
                        className="bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white w-full px-3 py-2 rounded-lg text-sm font-semibold transition-all"
                        value={dividendInputs.settlementPrice} 
                        onChange={(e) => setDividendInputs({...dividendInputs, settlementPrice: Math.max(0.01, parseFloat(e.target.value) || 0.01)})}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                        Existing Option Strike Price (₹)
                      </label>
                      <input 
                        type="number" 
                        step="0.05"
                        className="bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white w-full px-3 py-2 rounded-lg text-sm font-semibold transition-all"
                        value={dividendInputs.existingStrike} 
                        onChange={(e) => setDividendInputs({...dividendInputs, existingStrike: Math.max(0, parseFloat(e.target.value) || 0)})}
                      />
                    </div>
                  </div>

                  {/* Calculations Output Card */}
                  <div id="results-dividend" className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl shadow-xl p-6 flex flex-col justify-between border border-indigo-950">
                    <div>
                      <h3 className="font-bold border-b border-indigo-900/50 pb-3 flex items-center justify-between text-base">
                        <span className="flex items-center gap-2">
                          <CheckCircle className="text-indigo-400 w-5 h-5" />
                          Adjustment Results
                        </span>
                        <span className="text-[10px] uppercase tracking-wider font-mono bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/20">
                          Live Active
                        </span>
                      </h3>

                      <div className="space-y-4 py-4">
                        {/* Threshold Indicator Warning */}
                        <div className={`p-3.5 rounded-xl border flex gap-3 items-start ${
                          divAdjustmentThresholdMet 
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200' 
                            : 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                        }`}>
                          {divAdjustmentThresholdMet ? (
                            <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                          )}
                          <div className="text-xs">
                            <span className="font-bold block">
                              {divAdjustmentThresholdMet ? "EXTRAORDINARY DIVIDEND: ADJUSTED" : "REGULAR DIVIDEND: NO CHANGE"}
                            </span>
                            Dividend is <span className="font-mono font-bold text-white bg-slate-900/50 px-1 py-0.5 rounded">{divRatio.toFixed(2)}%</span> of Market Value. 
                            {divAdjustmentThresholdMet 
                              ? " This exceeds the regulatory 5% threshold, triggering F&O strike/basis reductions." 
                              : " Regular dividends below 5% do not cause F&O contract adjustments."
                            }
                          </div>
                        </div>

                        {/* Adjustments table */}
                        <div className="space-y-3 font-mono text-sm leading-relaxed">
                          <div className="flex justify-between items-center py-2 border-b border-indigo-900/30">
                            <span className="text-slate-300">Dividend Adjustment</span>
                            <span className="text-emerald-400 font-bold">
                              ₹{dividendInputs.dividendAmount.toFixed(2)}
                            </span>
                          </div>

                          <div className="flex justify-between items-center py-2 border-b border-indigo-900/30">
                            <span className="text-slate-300">New Futures Base Price</span>
                            <div className="text-right">
                              <span className="text-white font-bold text-lg">
                                ₹{divNewFutures.toFixed(2)}
                              </span>
                              {!divAdjustmentThresholdMet && (
                                <span className="text-[10px] text-slate-400 block font-sans">No reduction applied</span>
                              )}
                            </div>
                          </div>

                          <div className="flex justify-between items-center py-2">
                            <span className="text-slate-300">New Option Strike Price</span>
                            <div className="text-right">
                              <span className="text-white font-bold text-lg">
                                ₹{divNewStrike.toFixed(2)}
                              </span>
                              {!divAdjustmentThresholdMet && (
                                <span className="text-[10px] text-slate-400 block font-sans">No reduction applied</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-[11px] text-indigo-200 bg-indigo-950/60 p-3 rounded-lg border border-indigo-900/30 font-sans leading-relaxed">
                      <strong>SEBI Rules Summary:</strong> F&O lot sizes never change for dividend distributions. Only the stock futures base price and option strike prices are lowered by the dividend amount if the dividend is 5% or more of market price.
                    </div>
                  </div>
                </div>
              )}

              {/* Active Tab: RIGHTS ISSUE CALCULATOR */}
              {activeCalcTab === 'rights' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print-full-width">
                  {/* Inputs Card */}
                  <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4">
                    <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2 text-base">
                      <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                      Input Parameters
                    </h3>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                          Rights Shares (Granted)
                        </label>
                        <input 
                          type="number" 
                          className="bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white w-full px-3 py-2 rounded-lg text-sm font-semibold transition-all"
                          value={rightsInputs.rightsShares} 
                          placeholder="Rights share"
                          min="0"
                          onChange={(e) => setRightsInputs({...rightsInputs, rightsShares: Math.max(0, parseInt(e.target.value) || 0)})}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                          Existing Shares (Held)
                        </label>
                        <input 
                          type="number" 
                          className="bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white w-full px-3 py-2 rounded-lg text-sm font-semibold transition-all"
                          value={rightsInputs.existingShares} 
                          placeholder="Existing shares"
                          min="1"
                          onChange={(e) => setRightsInputs({...rightsInputs, existingShares: Math.max(1, parseInt(e.target.value) || 1)})}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                        Rights Issue Subscription Price (₹)
                      </label>
                      <input 
                        type="number" 
                        step="0.05"
                        className="bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white w-full px-3 py-2 rounded-lg text-sm font-semibold transition-all"
                        value={rightsInputs.rightsIssuePrice} 
                        onChange={(e) => setRightsInputs({...rightsInputs, rightsIssuePrice: Math.max(0, parseFloat(e.target.value) || 0)})}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                        Cum-Rights Market Price (₹)
                      </label>
                      <input 
                        type="number" 
                        step="0.05"
                        className="bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white w-full px-3 py-2 rounded-lg text-sm font-semibold transition-all"
                        value={rightsInputs.cumRightsPrice} 
                        onChange={(e) => setRightsInputs({...rightsInputs, cumRightsPrice: Math.max(0.01, parseFloat(e.target.value) || 0.01)})}
                      />
                    </div>

                    <div className="border-t border-slate-100 pt-3">
                      <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider mb-2">Options/Futures Settings</span>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1">Old Strike Price (₹)</label>
                          <input 
                            type="number" 
                            step="0.05"
                            className="bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white w-full px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                            value={rightsInputs.oldStrike} 
                            onChange={(e) => setRightsInputs({...rightsInputs, oldStrike: Math.max(0, parseFloat(e.target.value) || 0)})}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1">Old Futures Price (₹)</label>
                          <input 
                            type="number" 
                            step="0.05"
                            className="bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white w-full px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                            value={rightsInputs.oldFutures} 
                            onChange={(e) => setRightsInputs({...rightsInputs, oldFutures: Math.max(0, parseFloat(e.target.value) || 0)})}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1">Old Lot Size</label>
                          <input 
                            type="number" 
                            className="bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white w-full px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                            value={rightsInputs.oldLotSize} 
                            onChange={(e) => setRightsInputs({...rightsInputs, oldLotSize: Math.max(1, parseInt(e.target.value) || 1)})}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Calculations Output Card */}
                  <div id="results-rights" className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl shadow-xl p-6 flex flex-col justify-between border border-indigo-950">
                    <div>
                      <h3 className="font-bold border-b border-indigo-900/50 pb-3 flex items-center justify-between text-base">
                        <span className="flex items-center gap-2">
                          <CheckCircle className="text-indigo-400 w-5 h-5" />
                          Adjustment Results
                        </span>
                        <span className="text-[10px] uppercase tracking-wider font-mono bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/20">
                          Live Active
                        </span>
                      </h3>

                      <div className="space-y-4 py-4">
                        {/* Theoretical Ex-rights price */}
                        <div className="bg-indigo-950/40 p-3 rounded-lg border border-indigo-900/30 grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-xs text-indigo-200 block font-semibold text-nowrap">Ex-Rights Price (TERP)</span>
                            <span className="text-xl font-bold font-mono text-emerald-400">
                              ₹{terp.toFixed(2)}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-xs text-indigo-200 block font-semibold text-nowrap">Adjustment Factor</span>
                            <span className="text-xl font-bold font-mono text-indigo-300">
                              {rightsFactor.toFixed(6)}
                            </span>
                          </div>
                        </div>

                        {/* Adjustments table */}
                        <div className="space-y-3 font-mono text-sm leading-relaxed">
                          <div className="flex justify-between items-center py-2 border-b border-indigo-900/30">
                            <span className="text-slate-300">New Strike Price</span>
                            <div className="text-right">
                              <span className="text-white font-bold text-lg">
                                ₹{rightsNewStrike.toFixed(2)}
                              </span>
                              <span className="text-[10px] text-slate-400 block font-sans">
                                {rightsInputs.oldStrike} × {rightsFactor.toFixed(4)}
                              </span>
                            </div>
                          </div>

                          <div className="flex justify-between items-center py-2 border-b border-indigo-900/30">
                            <span className="text-slate-300">New Futures Price</span>
                            <div className="text-right">
                              <span className="text-white font-bold">
                                ₹{rightsNewFutures.toFixed(2)}
                              </span>
                              <span className="text-[10px] text-slate-400 block font-sans">
                                {rightsInputs.oldFutures} × {rightsFactor.toFixed(4)}
                              </span>
                            </div>
                          </div>

                          <div className="flex justify-between items-center py-2">
                            <span className="text-slate-300">New Lot Size</span>
                            <div className="text-right">
                              <span className="text-emerald-400 font-bold text-lg">
                                {Math.round(rightsNewLotSize)}
                              </span>
                              <span className="text-[10px] text-slate-400 block font-sans">
                                Exact: {rightsNewLotSize.toFixed(4)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-300 bg-white/5 p-3 rounded-lg border border-white/5 font-sans leading-relaxed">
                      <strong>Methodology Note:</strong> For Rights adjustments, Theoretical Ex-Rights Price (TERP) is computed first. The adjustment factor (TERP/CumPrice) is less than 1. Striking prices are multiplied by this factor, and lot sizes are divided by it.
                    </div>
                  </div>
                </div>
              )}

              {/* Interactive Info Board */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3 relative overflow-hidden no-print">
                <div className="absolute right-0 top-0 translate-y-3 translate-x-3 w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center -z-1">
                  <Info className="w-10 h-10 text-indigo-100" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5 uppercase tracking-wider">
                  <Coins className="text-indigo-600 w-4 h-4" /> Action Verification Check
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                  In options, striking pricing adjustment rules are designed to prevent structural arbitrage during corporate splits or dividend issues. For lot size adjustments, standard exchange guidelines recommend rounding to the nearest integer. Fractional contract adjustments are offset by exchange credit adjustments where applicable.
                </p>
                <div className="pt-2 flex items-center gap-2">
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md font-semibold border border-slate-200">
                    SEBI Circular Ref: SEBI/HO/MRD/DoP/CIR/P/2018/125
                  </span>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* =========================================================================
            NAV TAB 2 : REGULATORY METHODOLOGY SECTION
            ========================================================================= */}
        {activeNav === 'methodology' && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-8 space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="text-indigo-600 w-6 h-6" />
                FNO Regulatory Corporate Action Adjustments Methodology
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                Official derivatives exchange guidelines and formulas utilized for contract adjustments during corporate events.
              </p>
            </div>

            {/* Accordion Component */}
            <div className="space-y-4">
              
              {/* Accordion 1: Bonus Issue */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <button
                  onClick={() => setAccordionOpen({...accordionOpen, bonus: !accordionOpen.bonus})}
                  className="w-full bg-slate-50 px-6 py-4 flex justify-between items-center text-left hover:bg-slate-100 transition-all"
                >
                  <span className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-indigo-600 rounded-full"></span>
                    Bonus Issue Methodology
                  </span>
                  {accordionOpen.bonus ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
                </button>
                
                {accordionOpen.bonus && (
                  <div className="p-6 bg-white space-y-4 border-t border-slate-200 text-sm text-slate-600 leading-relaxed">
                    <p>
                      When a listed company issues bonus shares, additional stock is delivered to holders without any financial cost, changing the total shares outstanding.
                    </p>
                    
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                      <span className="text-slate-800 font-bold block text-xs uppercase text-indigo-900">Adjustment Factor Formula:</span>
                      <code className="block bg-slate-950 text-emerald-400 font-mono text-xs p-3 rounded-lg leading-relaxed">
                        Adjustment Factor = (Bonus Ratio Numerator + Bonus Ratio Denominator) / Bonus Ratio Denominator
                      </code>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                      <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-100">
                        <span className="font-bold text-slate-900 block text-xs uppercase mb-1">Option Strike Prices</span>
                        Divided by the adjustment factor, rounding to the nearest tick size of ₹0.05.
                      </div>
                      <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-100">
                        <span className="font-bold text-slate-900 block text-xs uppercase mb-1">Futures Base Prices</span>
                        Divided by the adjustment factor and rounded to standard market format.
                      </div>
                      <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-100">
                        <span className="font-bold text-slate-900 block text-xs uppercase mb-1">Market Lot Sizes</span>
                        Multiplied by the adjustment factor so that total exposure value is conserved.
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Accordion 2: Stock Split */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <button
                  onClick={() => setAccordionOpen({...accordionOpen, split: !accordionOpen.split})}
                  className="w-full bg-slate-50 px-6 py-4 flex justify-between items-center text-left hover:bg-slate-100 transition-all"
                >
                  <span className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-indigo-600 rounded-full"></span>
                    Stock Split Adjustment Methodology
                  </span>
                  {accordionOpen.split ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
                </button>
                
                {accordionOpen.split && (
                  <div className="p-6 bg-white space-y-4 border-t border-slate-200 text-sm text-slate-600 leading-relaxed">
                    <p>
                      A stock split increases the number of shares in a company while lowering the par value. For example, a 10-for-1 split divides each existing share into ten.
                    </p>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                      <span className="text-slate-800 font-bold block text-xs uppercase text-indigo-900">Formulas:</span>
                      <div className="space-y-1.5 font-mono text-xs">
                        <code className="block bg-slate-950 text-emerald-400 p-2.5 rounded">New Strike Price = Old Strike Price / Split Ratio</code>
                        <code className="block bg-slate-950 text-emerald-400 p-2.5 rounded">New Futures Price = Old Futures Price / Split Ratio</code>
                        <code className="block bg-slate-950 text-emerald-400 p-2.5 rounded">New Lot Size = Old Lot Size × Split Ratio</code>
                      </div>
                    </div>

                    <p>
                      Because the total holding of option contracts remains identical in economic value, splits do not distribute fresh cash, but split ratios must perfectly divide strikes and scale FNO lot sizes.
                    </p>
                  </div>
                )}
              </div>

              {/* Accordion 3: Extraordinary Dividend */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <button
                  onClick={() => setAccordionOpen({...accordionOpen, dividend: !accordionOpen.dividend})}
                  className="w-full bg-slate-50 px-6 py-4 flex justify-between items-center text-left hover:bg-slate-100 transition-all"
                >
                  <span className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-indigo-600 rounded-full"></span>
                    Dividend Adjustment Methodology
                  </span>
                  {accordionOpen.dividend ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
                </button>
                
                {accordionOpen.dividend && (
                  <div className="p-6 bg-white space-y-4 border-t border-slate-200 text-sm text-slate-600 leading-relaxed">
                    <p>
                      Dividend distributions are classified under two categories: regular dividend payments and extraordinary dividends. Under SEBI and global guidelines:
                    </p>

                    <ul className="list-disc leading-loose pl-5 space-y-2">
                      <li>
                        <strong>Regular Dividend:</strong> Any dividend payout that accounts for <strong>less than 5%</strong> of the underlying market price is classified as regular. No adjustments are done on futures or options contracts.
                      </li>
                      <li>
                        <strong>Extraordinary Dividend:</strong> If the proposed dividend per share is <strong>5% or more</strong> of the closing stock price on the day prior to announcement (or cumulative ex-dividend date), it is extraordinary.
                      </li>
                    </ul>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                      <span className="text-slate-800 font-bold block text-xs uppercase text-indigo-900">Extraordinary Dividend Adjustments:</span>
                      <div className="space-y-1.5 font-mono text-xs">
                        <code className="block bg-slate-950 text-emerald-400 p-2.5 rounded">Adjusted Futures Price = Settlement Price - Dividend Amount</code>
                        <code className="block bg-slate-950 text-emerald-400 p-2.5 rounded">Adjusted Strike Price = Option Strike Price - Dividend Amount</code>
                        <code className="block bg-slate-950 text-white p-2.5 rounded">Adjusted Lot Size = Old Lot Size (UNCHANGED)</code>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Accordion 4: Rights Issue */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <button
                  onClick={() => setAccordionOpen({...accordionOpen, rights: !accordionOpen.rights})}
                  className="w-full bg-slate-50 px-6 py-4 flex justify-between items-center text-left hover:bg-slate-100 transition-all"
                >
                  <span className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-indigo-600 rounded-full"></span>
                    Rights Issue Adjustment Methodology
                  </span>
                  {accordionOpen.rights ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
                </button>
                
                {accordionOpen.rights && (
                  <div className="p-6 bg-white space-y-4 border-t border-slate-200 text-sm text-slate-600 leading-relaxed">
                    <p>
                      A rights issue distributes subscription offer options allowing current stockholders first right to buy new shares at a discount (the "Rights Subscription Price") before general public release.
                    </p>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                      <div>
                        <span className="text-slate-800 font-bold block text-xs uppercase text-indigo-900">Step 1: Calculate Theoretical Ex-Rights Price (TERP)</span>
                        <code className="block bg-slate-950 text-emerald-400 font-mono text-xs p-3 rounded-lg leading-relaxed mt-1">
                          TERP = [(Existing Shares × Cum Rights Market Price) + (Rights Shares × Rights Issue Price)] / (Existing Shares + Rights Shares)
                        </code>
                      </div>
                      <div>
                        <span className="text-slate-800 font-bold block text-xs uppercase text-indigo-900">Step 2: Calculate Adjustment Factor</span>
                        <code className="block bg-slate-950 text-emerald-400 font-mono text-xs p-3 rounded-lg mt-1">
                          Adjustment Factor = Theoretical Ex-Rights Price (TERP) / Cum Rights Market Price
                        </code>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 font-sans">
                      <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-100">
                        <span className="font-bold text-slate-900 block text-xs uppercase mb-1">New Striking Price</span>
                        Old Strike Price × Adjustment Factor
                      </div>
                      <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-100">
                        <span className="font-bold text-slate-900 block text-xs uppercase mb-1">New Futures Price</span>
                        Old Futures Price × Adjustment Factor
                      </div>
                      <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-100">
                        <span className="font-bold text-slate-900 block text-xs uppercase mb-1">New Market Lot</span>
                        Old Lot Size / Adjustment Factor
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* =========================================================================
            NAV TAB 3 : EXAMPLES SECTION
            ========================================================================= */}
        {activeNav === 'examples' && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-8">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Award className="text-indigo-600 w-6 h-6" />
                Real Corporate Action Examples (NSE / Derivatives Market)
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                Explore real historic corporate event adjustments in the Indian derivatives market. Click <strong>"Apply to Calculator"</strong> on any example to load the numbers and experiment live.
              </p>
            </div>

            {/* Grid of Examples */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Example 1 card */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded text-xs font-semibold tracking-wider uppercase border border-indigo-100">
                      Bonus Issue
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">Ratio 1:3</span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-slate-900 mb-1">POWERGRID Bonus Issue</h3>
                  <p className="text-xs text-slate-500 leading-relaxed mb-4">
                    POWERGRID declared a 1:3 bonus issue (1 bonus share for every 3 shares held by shareholders on the record date).
                  </p>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 mb-4 font-mono text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Adjustment Factor:</span>
                      <span className="font-bold text-slate-800">1.333333</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Old Strike Price:</span>
                      <span className="font-bold text-slate-800">₹200.00</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-200 pt-2 text-indigo-900">
                      <span className="font-bold">New Strike Price:</span>
                      <span className="font-bold">₹150.00</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={examplesList[0].action}
                  className="w-full bg-slate-900 hover:bg-indigo-950 text-white font-semibold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors group"
                >
                  Apply to Calculator
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Example 2 card */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded text-xs font-semibold tracking-wider uppercase border border-indigo-100">
                      Stock Split
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">Ratio 2:1</span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-slate-900 mb-1">IPCALAB Stock Split</h3>
                  <p className="text-xs text-slate-500 leading-relaxed mb-4">
                    IPCA Laboratories declared a stock split from ₹2 face value to ₹1 face value (effectively 2 shares for every 1 existing share).
                  </p>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 mb-4 font-mono text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Split Ratio:</span>
                      <span className="font-bold text-slate-800">2.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Old Strike Price:</span>
                      <span className="font-bold text-slate-800">₹5000.00</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-200 pt-2 text-indigo-900">
                      <span className="font-bold">New Strike Price:</span>
                      <span className="font-bold">₹2500.00</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={examplesList[1].action}
                  className="w-full bg-slate-900 hover:bg-indigo-950 text-white font-semibold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors group"
                >
                  Apply to Calculator
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Example 3 card */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded text-xs font-semibold tracking-wider uppercase border border-indigo-100">
                      Dividend Adjustment
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">₹22.75 Payout</span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-slate-900 mb-1">HINDPETRO Dividend Distribution</h3>
                  <p className="text-xs text-slate-500 leading-relaxed mb-4">
                    Hindustan Petroleum Corporation announced a dividend payout of ₹22.75 per share, representing over 7% of its underlying price.
                  </p>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 mb-4 font-mono text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Proposed Payout:</span>
                      <span className="font-bold text-slate-800">₹22.75</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Old Option Strike:</span>
                      <span className="font-bold text-slate-800">₹300.00</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-200 pt-2 text-indigo-900">
                      <span className="font-bold">New Option Strike:</span>
                      <span className="font-bold">₹277.25</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={examplesList[2].action}
                  className="w-full bg-slate-900 hover:bg-indigo-950 text-white font-semibold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors group"
                >
                  Apply to Calculator
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Example 4 card */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded text-xs font-semibold tracking-wider uppercase border border-indigo-100">
                      Rights Issue
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">Ratio 1:9</span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-slate-900 mb-1">INDHOTEL Rights Adjustment</h3>
                  <p className="text-xs text-slate-500 leading-relaxed mb-4">
                    Indian Hotels declared a rights issue of 1 shares for every 9 held, priced at ₹104.50 against a pre-announcement price of ₹150.00.
                  </p>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 mb-4 font-mono text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Theoretical ex-rights price (TERP):</span>
                      <span className="font-bold text-slate-800">₹145.45</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Adjustment Factor:</span>
                      <span className="font-bold text-slate-800">0.969670</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-200 pt-2 text-indigo-900">
                      <span className="font-bold">New Strike (Old ₹180):</span>
                      <span className="font-bold">₹174.54</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={examplesList[3].action}
                  className="w-full bg-slate-900 hover:bg-indigo-950 text-white font-semibold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors group"
                >
                  Apply to Calculator
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

            </div>
          </div>
        )}

        {activeNav === 'upcoming' && (
          <div className="space-y-6 animate-fade-in">
            {/* Header Dashboard Card */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="text-indigo-600 w-6 h-6 animate-pulse" />
                  Upcoming Corporate Actions (NSE India)
                </h2>
                <p className="text-slate-500 text-sm mt-1">
                  Discover upcoming market corporate events verified dynamically using AI search grounding on public exchange websites.
                </p>
              </div>
              <button
                disabled={upcomingLoading}
                onClick={fetchUpcomingCA}
                className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 text-sm font-semibold transition-all disabled:opacity-50 whitespace-nowrap cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${upcomingLoading ? 'animate-spin' : ''}`} />
                {upcomingLoading ? 'Fetching Live...' : 'Refresh Live Data'}
              </button>
            </div>

            {/* Grounding Source Info Block */}
            {upcomingSources && upcomingSources.length > 0 && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
                <div className="flex items-center gap-2">
                  <span className="bg-emerald-500/20 text-emerald-800 text-xs px-2.5 py-1 rounded-md font-bold uppercase border border-emerald-500/30">
                    Grounded Search
                  </span>
                  <p className="text-emerald-950 text-xs font-semibold">
                    Verified and synthesized from public exchange disclosures & announcements:
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {upcomingSources.slice(0, 3).map((src: any, idx: number) => (
                    <a
                      key={idx}
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 bg-white border border-emerald-200 hover:border-emerald-400 rounded-md text-[10px] text-emerald-800 font-semibold flex items-center gap-1 transition-all"
                    >
                      {src.title.length > 20 ? src.title.slice(0, 18) + '...' : src.title}
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Filter Toolbar Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-xs">
              {/* Type Pills */}
              <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
                {['All', 'Dividend', 'Bonus Issue', 'Stock Split', 'Rights Issue'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setUpcomingFilter(type)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      upcomingFilter === type
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative w-full md:w-80">
                <input
                  type="text"
                  placeholder="Filter by Symbol or Company Name..."
                  value={upcomingSearch}
                  onChange={(e) => setUpcomingSearch(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white px-3 py-2 text-xs rounded-lg font-semibold transition-all text-slate-800"
                />
                {upcomingSearch && (
                  <button
                    onClick={() => setUpcomingSearch('')}
                    className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 font-bold text-xs cursor-pointer"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            {/* Main Stage Grid or Loading States */}
            {upcomingLoading ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center space-y-4 shadow-sm">
                <div className="inline-block animate-spin border-4 border-slate-300 border-t-indigo-600 w-10 h-10 rounded-full"></div>
                <p className="text-slate-600 text-sm font-semibold animate-pulse">
                  Searching exchange announcements and compiling upcoming corporate actions...
                </p>
                <p className="text-xs text-slate-400 font-mono">
                  Using Google Search Grounding to verify actual upcoming corporate events
                </p>
              </div>
            ) : upcomingError ? (
              <div className="bg-rose-50 border border-rose-200 text-rose-950 p-6 rounded-2xl flex flex-col items-center text-center space-y-4 shadow-xs">
                <AlertCircle className="w-8 h-8 text-rose-600 animate-bounce" />
                <h3 className="font-bold text-base">Communication interruption</h3>
                <p className="text-xs text-rose-700 max-w-md">
                  {upcomingError}. We have loaded high-fidelity offline cached metrics below for reference in the meantime.
                </p>
                <button
                  onClick={fetchUpcomingCA}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg transition-all cursor-pointer animate-pulse"
                >
                  Retry Live Fetch
                </button>
              </div>
            ) : (
              <div>
                {/* Event Cards Grid */}
                {(() => {
                  const filtered = upcomingCA.filter((item: any) => {
                    const matchesType = upcomingFilter === 'All' || item.type === upcomingFilter;
                    const matchesSearch =
                      !upcomingSearch ||
                      item.symbol.toLowerCase().includes(upcomingSearch.toLowerCase()) ||
                      item.company.toLowerCase().includes(upcomingSearch.toLowerCase());
                    return matchesType && matchesSearch;
                  });

                  if (filtered.length === 0) {
                    return (
                      <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center shadow-xs">
                        <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                        <h3 className="font-bold text-slate-800 text-sm">No match found</h3>
                        <p className="text-xs text-slate-400 mt-1">
                          Try resetting your search query or selecting another event category.
                        </p>
                      </div>
                    );
                  }

                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filtered.map((item: any, idx: number) => {
                        const exDate = new Date(item.exDate);
                        const today = new Date();
                        const diffTime = exDate.getTime() - today.getTime();
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        
                        let badgeColorClass = "bg-slate-100 text-slate-800 border-slate-200";
                        if (item.type === 'Dividend') badgeColorClass = "bg-emerald-50 text-emerald-700 border-emerald-100";
                        else if (item.type === 'Bonus Issue') badgeColorClass = "bg-indigo-50 text-indigo-700 border-indigo-100";
                        else if (item.type === 'Stock Split') badgeColorClass = "bg-rose-50 text-rose-700 border-rose-100";
                        else if (item.type === 'Rights Issue') badgeColorClass = "bg-amber-50 text-amber-700 border-amber-100";

                        return (
                          <div
                            key={idx}
                            className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md transition-all flex flex-col justify-between"
                          >
                            <div>
                              {/* Header Card */}
                              <div className="flex justify-between items-start mb-3">
                                <div>
                                  <span className="font-mono font-bold text-xs bg-slate-900 text-white px-2.5 py-1 rounded">
                                    {item.symbol}
                                  </span>
                                  <span className="text-[10px] text-slate-400 pointer-events-none select-none ml-2">
                                    NSE Listed
                                  </span>
                                </div>
                                <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase border ${badgeColorClass}`}>
                                  {item.type}
                                </span>
                              </div>

                              {/* Title */}
                              <h3 className="font-bold text-slate-900 text-sm leading-tight line-clamp-1">
                                {item.company}
                              </h3>
                              
                              {/* Purpose Detail Box */}
                              <div className="mt-2.5 p-3 bg-slate-50 border border-slate-100 rounded-xl">
                                <span className="text-[10px] font-mono text-slate-500 block uppercase font-bold tracking-wider mb-0.5">
                                  Action Narrative
                                </span>
                                <p className="text-secondary text-xs text-slate-800 font-semibold leading-relaxed">
                                  {item.purpose}
                                </p>
                              </div>

                              {/* Dates Display section */}
                              <div className="grid grid-cols-2 gap-2 my-4 font-mono text-[11px] border-b border-t border-slate-100 py-3">
                                <div>
                                  <span className="text-slate-400 block uppercase font-sans font-bold text-[10px]">Ex-Date</span>
                                  <span className="font-bold text-slate-700">{item.exDate}</span>
                                </div>
                                <div>
                                  <span className="text-slate-400 block uppercase font-sans font-bold text-[10px]">Record Date</span>
                                  <span className="font-bold text-slate-700">
                                    {item.recordDate || 'N/A'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Sticky Bottom Actions */}
                            <div className="space-y-3">
                              {/* Days countdown alert */}
                              <div className="flex justify-between items-center bg-indigo-50/30 px-3 py-1.5 rounded-lg border border-indigo-100/30 text-xs">
                                <span className="font-semibold text-slate-500">Days to Ex-Date</span>
                                {diffDays < 0 ? (
                                  <span className="text-slate-400 font-bold">Passed</span>
                                ) : diffDays === 0 ? (
                                  <span className="text-rose-600 font-bold uppercase animate-pulse">TODAY</span>
                                ) : diffDays === 1 ? (
                                  <span className="text-amber-600 font-bold">TOMORROW</span>
                                ) : (
                                  <span className="text-indigo-600 font-bold">{diffDays} days left</span>
                                )}
                              </div>

                              <button
                                onClick={() => applyUpcomingToCalculator(item)}
                                className="w-full bg-slate-900 hover:bg-indigo-950 text-white font-semibold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors group cursor-pointer"
                              >
                                Load in FNO Calculator
                                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}

      </main>

      {/* --- Footer & Credit Section --- */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-8 px-4 text-center text-xs space-y-2 select-none no-print">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-left space-y-1">
            <p className="font-bold text-slate-200">Corporate Action Calculator (FNO Adjustments Methodology & Examples)</p>
            <p className="font-light">Premium financial decision calculator compliant with regulatory derivatives contract specifications.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-slate-500 font-mono">v1.2.0</span>
            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
            <span className="text-slate-300 font-semibold uppercase tracking-wider">Premium Dashboard</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
