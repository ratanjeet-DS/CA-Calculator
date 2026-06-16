/**
 * Corporate Action Calculator - Client Side Calculator Logic
 */

document.addEventListener("DOMContentLoaded", () => {
    // Collect DOM elements
    // Bonus Inputs
    const bNum = document.getElementById("b-num");
    const bDen = document.getElementById("b-den");
    const bStrike = document.getElementById("b-strike");
    const bFutures = document.getElementById("b-futures");
    const bLot = document.getElementById("b-lot");

    // Bonus Outputs
    const outBFac = document.getElementById("out-b-fac");
    const outBStrike = document.getElementById("out-b-strike");
    const outBFutures = document.getElementById("out-b-futures");
    const outBLot = document.getElementById("out-b-lot");
    const outBFormula = document.getElementById("out-b-formula");

    // Split Inputs
    const sRatio = document.getElementById("s-ratio");
    const sStrike = document.getElementById("s-strike");
    const sFutures = document.getElementById("s-futures");
    const sLot = document.getElementById("s-lot");

    // Split Outputs
    const outSFac = document.getElementById("out-s-fac");
    const outSStrike = document.getElementById("out-s-strike");
    const outSFutures = document.getElementById("out-s-futures");
    const outSLot = document.getElementById("out-s-lot");

    // Dividend Inputs
    const dDiv = document.getElementById("d-dividend");
    const dSettle = document.getElementById("d-settle");
    const dStrike = document.getElementById("d-strike");

    // Dividend Outputs
    const outDAlert = document.getElementById("out-d-alert");
    const outDHeader = document.getElementById("out-d-header");
    const outDBody = document.getElementById("out-d-body");
    const outDAmount = document.getElementById("out-d-amount");
    const outDFutures = document.getElementById("out-d-futures");
    const outDStrike = document.getElementById("out-d-strike");

    // Rights Inputs
    const rNum = document.getElementById("r-num");
    const rDen = document.getElementById("r-den");
    const rIssueP = document.getElementById("r-issue-p");
    const rCumP = document.getElementById("r-cum-p");
    const rStrike = document.getElementById("r-strike");
    const rFutures = document.getElementById("r-futures");
    const rLot = document.getElementById("r-lot");

    // Rights Outputs
    const outRTerp = document.getElementById("out-r-terp");
    const outRFac = document.getElementById("out-r-fac");
    const outRStrike = document.getElementById("out-r-strike");
    const outRFutures = document.getElementById("out-r-futures");
    const outRLot = document.getElementById("out-r-lot");

    // Global Toolbar Action Buttons
    const resetBtn = document.getElementById("reset-btn");
    const copyBtn = document.getElementById("copy-btn");
    const printBtn = document.getElementById("print-btn");
    const pdfBtn = document.getElementById("pdf-btn");

    // Toast alert handlers
    const actionToast = document.getElementById("action-toast");
    const toastText = document.getElementById("toast-text");
    
    function showToast(message, isSuccess = true) {
        toastText.innerText = message;
        
        // Remove old background styles
        actionToast.classList.remove("bg-dark", "bg-danger", "bg-success");
        if (isSuccess) {
            actionToast.classList.add("bg-dark");
        } else {
            actionToast.classList.add("bg-danger");
        }
        
        const bToast = new bootstrap.Toast(actionToast);
        bToast.show();
    }

    // Dynamic Calculations
    function calculateBonus() {
        const num = Math.max(1, parseInt(bNum.value) || 1);
        const den = Math.max(1, parseInt(bDen.value) || 1);
        const strike = Math.max(0, parseFloat(bStrike.value) || 0);
        const futures = Math.max(0, parseFloat(bFutures.value) || 0);
        const lot = Math.max(1, parseInt(bLot.value) || 1);

        const factor = (num + den) / den;
        const newStrike = strike / factor;
        const newFutures = futures / factor;
        const newLot = lot * factor;

        outBFac.innerText = factor.toFixed(6);
        outBStrike.innerText = "₹" + newStrike.toFixed(2);
        outBFutures.innerText = "₹" + newFutures.toFixed(2);
        outBLot.innerText = Math.round(newLot).toString();
        outBFormula.innerText = `ratio (${num} + ${den})/${den}`;
    }

    function calculateSplit() {
        const ratio = Math.max(1, parseFloat(sRatio.value) || 1);
        const strike = Math.max(0, parseFloat(sStrike.value) || 0);
        const futures = Math.max(0, parseFloat(sFutures.value) || 0);
        const lot = Math.max(1, parseInt(sLot.value) || 1);

        const newStrike = strike / ratio;
        const newFutures = futures / ratio;
        const newLot = lot * ratio;

        outSFac.innerText = ratio.toFixed(2) + " : 1";
        outSStrike.innerText = "₹" + newStrike.toFixed(2);
        outSFutures.innerText = "₹" + newFutures.toFixed(2);
        outSLot.innerText = Math.round(newLot).toString();
    }

    function calculateDividend() {
        const div = Math.max(0, parseFloat(dDiv.value) || 0);
        const settle = Math.max(0.01, parseFloat(dSettle.value) || 0.01);
        const strike = Math.max(0, parseFloat(dStrike.value) || 0);

        const ratio = (div / settle) * 100;
        const qualifies = ratio >= 5.0;

        outDAmount.innerText = "₹" + div.toFixed(2);

        // Update CSS style for qualify alerts
        outDAlert.className = "p-3 rounded-3 mb-4 border d-flex gap-2 " + 
            (qualifies ? "bg-success-subtle border-success text-success-emphasis" : "bg-warning-subtle border-warning text-warning-emphasis");

        if (qualifies) {
            outDHeader.innerText = "EXTRAORDINARY DIVIDEND: ADJUSTED";
            outDBody.innerText = `Dividend is ${ratio.toFixed(2)}% (>= 5%) of settlement price. Contract adjustment applied.`;
            outDFutures.innerText = "₹" + (settle - div).toFixed(2);
            outDStrike.innerText = "₹" + (strike - div).toFixed(2);
        } else {
            outDHeader.innerText = "REGULAR DIVIDEND: NO CHANGE";
            outDBody.innerText = `Dividend is ${ratio.toFixed(2)}% (< 5%) of settlement price. F&O values remain unchanged.`;
            outDFutures.innerText = "₹" + settle.toFixed(2);
            outDStrike.innerText = "₹" + strike.toFixed(2);
        }
    }

    function calculateRights() {
        const num = Math.max(0, parseInt(rNum.value) || 0);
        const den = Math.max(1, parseInt(rDen.value) || 1);
        const issueP = Math.max(0, parseFloat(rIssueP.value) || 0);
        const cumP = Math.max(0.01, parseFloat(rCumP.value) || 0.01);

        const oldS = Math.max(0, parseFloat(rStrike.value) || 0);
        const oldF = Math.max(0, parseFloat(rFutures.value) || 0);
        const oldL = Math.max(0, parseInt(rLot.value) || 0);

        const totalShares = den + num;
        const terp = ((den * cumP) + (num * issueP)) / totalShares;
        const factor = terp / cumP;

        const newS = oldS * factor;
        const newF = oldF * factor;
        const newL = factor > 0 ? (oldL / factor) : oldL;

        outRTerp.innerText = "₹" + terp.toFixed(2);
        outRFac.innerText = factor.toFixed(6);
        outRStrike.innerText = "₹" + newS.toFixed(2);
        outRFutures.innerText = "₹" + newF.toFixed(2);
        outRLot.innerText = Math.round(newL).toString();
    }

    // Attach real-time input triggers
    [bNum, bDen, bStrike, bFutures, bLot].forEach(el => el.addEventListener("input", calculateBonus));
    [sRatio, sStrike, sFutures, sLot].forEach(el => el.addEventListener("input", calculateSplit));
    [dDiv, dSettle, dStrike].forEach(el => el.addEventListener("input", calculateDividend));
    [rNum, rDen, rIssueP, rCumP, rStrike, rFutures, rLot].forEach(el => el.addEventListener("input", calculateRights));

    // Active sub-tab detection
    let activeCalcType = "bonus"; // 'bonus' | 'split' | 'dividend' | 'rights'
    
    document.querySelectorAll('#calcSelector button').forEach(button => {
        button.addEventListener('shown.bs.tab', (e) => {
            const targetHref = e.target.getAttribute("href");
            activeCalcType = targetHref.replace("-calc", "").replace("#", "");
        });
    });

    // Reset Trigger
    resetBtn.addEventListener("click", () => {
        if (activeCalcType === "bonus") {
            bNum.value = "1";
            bDen.value = "3";
            bStrike.value = "200";
            bFutures.value = "205.5";
            bLot.value = "3000";
            calculateBonus();
            showToast("Bonus Issue inputs reset.");
        } else if (activeCalcType === "split") {
            sRatio.value = "2";
            sStrike.value = "5000";
            sFutures.value = "5035";
            sLot.value = "125";
            calculateSplit();
            showToast("Stock Split inputs reset.");
        } else if (activeCalcType === "dividend") {
            dDiv.value = "22.75";
            dSettle.value = "310";
            dStrike.value = "300";
            calculateDividend();
            showToast("Dividend inputs reset.");
        } else if (activeCalcType === "rights") {
            rNum.value = "1";
            rDen.value = "9";
            rIssueP.value = "104.5";
            rCumP.value = "150";
            rStrike.value = "180";
            rFutures.value = "184.2";
            rLot.value = "1500";
            calculateRights();
            showToast("Rights Issue inputs reset.");
        }
    });

    // Copy to clipboard
    copyBtn.addEventListener("click", () => {
        let text = `--- Corporate Action F&O Calculations ---\n`;
        text += `System Timestamp: ${new Date().toLocaleString()}\n\n`;

        if (activeCalcType === "bonus") {
            text += `Action Type: BONUS ISSUE\n`;
            text += `Bonus Ratio: ${bNum.value} : ${bDen.value}\n`;
            text += `Old Strike Price: ₹${bStrike.value}\n`;
            text += `Old Futures Price: ₹${bFutures.value}\n`;
            text += `Old Lot Size: ${bLot.value}\n`;
            text += `------------------------------------\n`;
            text += `Adjustment Factor: ${outBFac.innerText}\n`;
            text += `New Strike Price: ${outBStrike.innerText}\n`;
            text += `New Futures Price: ${outBFutures.innerText}\n`;
            text += `New Market Lot: ${outBLot.innerText}\n`;
        } else if (activeCalcType === "split") {
            text += `Action Type: STOCK SPLIT\n`;
            text += `Split Ratio: ${sRatio.value} : 1\n`;
            text += `Old Strike Price: ₹${sStrike.value}\n`;
            text += `Old Futures Price: ₹${sFutures.value}\n`;
            text += `Old Lot Size: ${sLot.value}\n`;
            text += `------------------------------------\n`;
            text += `New Strike Price: ${outSStrike.innerText}\n`;
            text += `New Futures Price: ${outSFutures.innerText}\n`;
            text += `New Market Lot: ${outSLot.innerText}\n`;
        } else if (activeCalcType === "dividend") {
            text += `Action Type: DIVIDEND DISTRIBUTION\n`;
            text += `Proposed Payout: ₹${dDiv.value}\n`;
            text += `Futures Settlement Price: ₹${dSettle.value}\n`;
            text += `Existing Option Strike: ₹${dStrike.value}\n`;
            text += `------------------------------------\n`;
            text += `Qualifies for Adjustment: ${(parseFloat(dDiv.value)/parseFloat(dSettle.value)*100 >= 5.0) ? "YES" : "NO"}\n`;
            text += `New Futures base price: ${outDFutures.innerText}\n`;
            text += `New Strike Price: ${outDStrike.innerText}\n`;
        } else if (activeCalcType === "rights") {
            text += `Action Type: RIGHTS ISSUE\n`;
            text += `Rights Ratio: ${rNum.value} : ${rDen.value}\n`;
            text += `Subscription Issue Price: ₹${rIssueP.value}\n`;
            text += `Cum-Rights Market Price: ₹${rCumP.value}\n`;
            text += `Old Strike Price: ₹${rStrike.value}\n`;
            text += `Old Futures Price: ₹${rFutures.value}\n`;
            text += `Old Lot Size: ${rLot.value}\n`;
            text += `------------------------------------\n`;
            text += `Theoretical Ex-Rights Price (TERP): ${outRTerp.innerText}\n`;
            text += `Adjustment Factor: ${outRFac.innerText}\n`;
            text += `New Strike Price: ${outRStrike.innerText}\n`;
            text += `New Futures Price: ${outRFutures.innerText}\n`;
            text += `New Market Lot: ${outRLot.innerText}\n`;
        }

        navigator.clipboard.writeText(text).then(() => {
            showToast("Copied inputs & outputs to clipboard.");
        }).catch(() => {
            showToast("Clipboard copy failed.", false);
        });
    });

    // Print & PDF
    printBtn.addEventListener("click", () => window.print());
    pdfBtn.addEventListener("click", () => window.print());

    // Run core calculations on load
    calculateBonus();
    calculateSplit();
    calculateDividend();
    calculateRights();

    // Global listeners for example selection triggers
    window.loadPowergrid = () => {
        bNum.value = "1";
        bDen.value = "3";
        bStrike.value = "200";
        bFutures.value = "204.8";
        bLot.value = "2000";
        calculateBonus();

        // Switch panel to Calculator & Bonus tab list
        bootstrap.Tab.getInstance(document.getElementById("calcs-tab-btn")).show();
        bootstrap.Tab.getInstance(document.getElementById("bonus-list-btn")).show();
        showToast("Powergrid Corp Bonus Issue example loaded!");
    };

    window.loadIpcalab = () => {
        sRatio.value = "2";
        sStrike.value = "5000";
        sFutures.value = "5080";
        sLot.value = "200";
        calculateSplit();

        bootstrap.Tab.getInstance(document.getElementById("calcs-tab-btn")).show();
        bootstrap.Tab.getInstance(document.getElementById("split-list-btn")).show();
        showToast("Ipca Laboratories stock split example loaded!");
    };

    window.loadHindpetro = () => {
        dDiv.value = "22.75";
        dSettle.value = "310";
        dStrike.value = "300";
        calculateDividend();

        bootstrap.Tab.getInstance(document.getElementById("calcs-tab-btn")).show();
        bootstrap.Tab.getInstance(document.getElementById("dividend-list-btn")).show();
        showToast("HPCL dividend distribution example loaded!");
    };

    window.loadIndhotel = () => {
        rNum.value = "1";
        rDen.value = "9";
        rIssueP.value = "104.5";
        rCumP.value = "150";
        rStrike.value = "180";
        rFutures.value = "184.2";
        rLot.value = "1500";
        calculateRights();

        bootstrap.Tab.getInstance(document.getElementById("calcs-tab-btn")).show();
        bootstrap.Tab.getInstance(document.getElementById("rights-list-btn")).show();
        showToast("Indian Hotels rights issue example loaded!");
    };
});
