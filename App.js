import React from 'react';
import { StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { WebView } from 'react-native-webview';

export default function App() {
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="am">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>ስማርት የጨረታ ዋጋ መሙያ (Pro V3)</title>
        <script src="https://cdn.jsdelivr.net/npm/tesseract.js@4/dist/tesseract.min.js"></script>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background-color: #eef2f7;
                margin: 0;
                padding: 10px;
                color: #333;
            }
            .container {
                max-width: 650px;
                margin: 0 auto;
                background: #ffffff;
                padding: 20px;
                border-radius: 15px;
                box-shadow: 0 5px 15px rgba(0,0,0,0.15);
            }
            h2, h3 {
                text-align: center;
                color: #1a365d;
            }
            .section {
                background: #f8fafc;
                padding: 15px;
                border-radius: 10px;
                margin-bottom: 15px;
                border-left: 5px solid #2b6cb0;
            }
            label {
                display: block;
                margin-top: 10px;
                font-weight: bold;
                color: #4a5568;
            }
            input, select {
                width: 100%;
                padding: 10px;
                margin-top: 5px;
                box-sizing: border-box;
                border: 1px solid #cbd5e0;
                border-radius: 6px;
                font-size: 16px;
            }
            .flex-inputs {
                display: flex;
                gap: 10px;
            }
            .btn {
                width: 100%;
                color: white;
                padding: 12px;
                border: none;
                border-radius: 6px;
                font-size: 16px;
                cursor: pointer;
                font-weight: bold;
                margin-top: 10px;
            }
            .btn-blue { background-color: #2b6cb0; }
            .btn-green { background-color: #28a745; }
            .btn-orange { background-color: #fd7e14; }
            .btn-danger { background-color: #dc3545; padding: 5px 10px; font-size: 12px; width: auto; margin-top: 0; }
            
            table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 15px;
            }
            th, td {
                border: 1px solid #cbd5e0;
                padding: 8px;
                text-align: left;
                font-size: 14px;
            }
            th { background-color: #edf2f7; }
            
            .result-box {
                background: #f0fff4;
                border-left: 5px solid #38a169;
                padding: 15px;
                margin-top: 15px;
                border-radius: 10px;
                display: none;
            }
            .result-item {
                display: flex;
                justify-content: space-between;
                margin-bottom: 8px;
                font-size: 16px;
            }
            .adjustment-info {
                color: #e67e22;
                font-style: italic;
                font-size: 14px;
            }
            .subtotal-style { font-weight: bold; color: #2b6cb0; border-top: 1px dashed #cbd5e0; padding-top: 8px; }
            .total { font-weight: bold; color: #e53e3e; border-top: 2px solid #cbd5e0; padding-top: 8px; font-size: 18px; }
            #loading { display: none; text-align: center; color: #fd7e14; font-weight: bold; margin: 10px 0; }
        </style>
    </head>
    <body>

    <div class="container">
        <h2>ስማርት የጨረታ ዋጋ መሙያ (V3 - Adjustments)</h2>

        <div class="section">
            <h3>የBOQ መሙያ መንገድ ይምረጡ</h3>
            <button class="btn btn-blue" onclick="showMode('manual')">በእጅ ፅፎ ማስገቢያ</button>
            <button class="btn btn-orange" onclick="showMode('scan')">ከሰነድ ላይ ፎቶ አንሺ (AI Scan)</button>
        </div>

        <div id="manualSection" class="section" style="display:none;">
            <h3>የእቃ/የስራ ዝርዝር መመዝገቢያ</h3>
            <label>የስራው/የዕቃው ስም (Item Description):</label>
            <input type="text" id="itemName" placeholder="ምሳሌ፡ የቁፋሮ ስራ ወይም ሲሚንቶ">
            
            <label>ብዛት (Quantity):</label>
            <input type="number" id="itemQty" value="1">
            
            <label>የአንዱ መነሻ ዋጋ (Unit Rate):</label>
            <input type="number" id="itemRate" value="0">
            
            <button class="btn btn-green" onclick="addItemToList()">ወደ ሰንጠረዥ ጨምር</button>
        </div>

        <div id="scanSection" class="section" style="display:none;">
            <h3>የBOQ ሰነድ ፎቶ ያንሱ / ያስገቡ</h3>
            <input type="file" id="imageInput" accept="image/*" capture="environment" onchange="scanImage()">
            <div id="loading">የሰነዱን ፅሁፍ በማንበብ ላይ ነው... እባክዎ ይጠብቁ...</div>
        </div>

        <div class="section">
            <h3>የተመዘገቡ የBOQ ዝርዝሮች</h3>
            <table id="boqTable">
                <thead>
                    <tr>
                        <th>የስራ ዝርዝር</th>
                        <th>ብዛት</th>
                        <th>ነጠላ ዋጋ</th>
                        <th>ጠቅላላ</th>
                        <th>ድርጊት</th>
                    </tr>
                </thead>
                <tbody id="boqBody">
                </tbody>
            </table>
        </div>

        <div class="section">
            <h3>4. የዋጋ ማስተካከያ (Markup / Discount)</h3>
            <div class="flex-inputs">
                <div style="width: 50%;">
                    <label>የማስተካከያ አይነት:</label>
                    <select id="adjustmentType">
                        <option value="none">ምንም (No Change)</option>
                        <option value="increase">ዋጋ ለመጨመር (+ %)</option>
                        <option value="decrease">ዋጋ ለመቀነስ (- %)</option>
                    </select>
                </div>
                <div style="width: 50%;">
                    <label>የፐርሰንት መጠን (%):</label>
                    <input type="number" id="adjustmentPercent" value="0" min="0">
                </div>
            </div>
            <button class="btn btn-blue" style="margin-top:15px;" onclick="calculateFinalTender()">የመጨረሻ ጨረታ ዋጋ አስላ</button>
        </div>

        <div class="result-box" id="resultBox">
            <h3>የጨረታ ዋጋ ማጠቃለያ (Final Summary)</h3>
            
            <div class="result-item">
                <span>የቀጥታ ስራዎች መነሻ ድምር:</span>
                <span id="resDirect">0.00 ETB</span>
            </div>
            <div class="result-item adjustment-info" id="adjustmentRow" style="display:none;">
                <span>የተደረገ የዋጋ ማስተካከያ:</span>
                <span id="resAdjustment">0.00 ETB</span>
            </div>
            <div class="result-item subtotal-style">
                <span>ጠቅላላ ንዑስ ድምር (Subtotal):</span>
                <span id="resSubtotal">0.00 ETB</span>
            </div>
            <div class="result-item" style="color: #656565;">
                <span>የተጨማሪ እሴት ታክስ (15% VAT):</span>
                <span id="resVat">0.00 ETB</span>
            </div>
            <div class="result-item total">
                <span>ከነቫቱ ጠቅላላ ዋጋ (Total with VAT):</span>
                <span id="resTotal">0.00 ETB</span>
            </div>
        </div>
    </div>

    <script>
    let boqList = [];

    function showMode(mode) {
        document.getElementById('manualSection').style.display = mode === 'manual' ? 'block' : 'none';
        document.getElementById('scanSection').style.display = mode === 'scan' ? 'block' : 'none';
    }

    function addItemToList() {
        const name = document.getElementById('itemName').value;
        const qty = parseFloat(document.getElementById('itemQty').value) || 0;
        const rate = parseFloat(document.getElementById('itemRate').value) || 0;

        if(name === "") { alert("እባክዎ የስራውን ስም ያስገቡ!"); return; }

        boqList.push({ name: name, qty: qty, rate: rate, total: qty * rate });
        updateTable();
        
        document.getElementById('itemName').value = "";
        document.getElementById('itemQty').value = "1";
        document.getElementById('itemRate').value = "0";
    }

    function deleteItem(index) {
        boqList.splice(index, 1);
        updateTable();
        if(document.getElementById('resultBox').style.display === 'block') {
            calculateFinalTender();
        }
    }

    function updateTable() {
        const body = document.getElementById('boqBody');
        body.innerHTML = "";
        boqList.forEach((item, index) => {
            let row = \`<tr>
                <td>\${item.name}</td>
                <td>\${item.qty}</td>
                <td>\${item.rate.toFixed(2)}</td>
                <td>\${item.total.toFixed(2)}</td>
                <td><button class="btn btn-danger" onclick="deleteItem(\${index})">አጥፋ</button></td>
            </tr>\`;
            body.innerHTML += row;
        });
    }

    function scanImage() {
        const fileInput = document.getElementById('imageInput');
        if (fileInput.files.length === 0) return;

        const loading = document.getElementById('loading');
        loading.style.display = 'block';

        const imageFile = fileInput.files[0];

        Tesseract.recognize(
            imageFile,
            'eng',
            { logger: m => console.log(m) }
        ).then(({ data: { text } }) => {
            loading.style.display = 'none';
            parseScannedText(text);
        }).catch(err => {
            loading.style.display = 'none';
            alert("ፎቶውን ማንበብ አልተቻለም፣ እባክዎ በድጋሚ በንጹህ ብርሃን ያንሱት።");
            console.error(err);
        });
    }

    function parseScannedText(text) {
        const lines = text.split('\\n');
        let foundItems = false;

        lines.forEach(line => {
            const match = line.match(/(.+?)\\s+(\\d+[\\.\\d]*)\\s+(\\d+[\\.\\d]*)/);
            if (match) {
                const name = match[1].trim();
                const qty = parseFloat(match[2]) || 1;
                const rate = parseFloat(match[3]) || 0;
                
                if(rate > 0) {
                    boqList.push({ name: name, qty: qty, rate: rate, total: qty * rate });
                    foundItems = true;
                }
            }
        });

        if(foundItems) {
            updateTable();
            alert("የሰነዱ ዝርዝር በተሳካ ሁኔታ ተነቦ ወደ ሰንጠረዥ ተጨምሯል!");
        } else {
            alert("ከፎቶው ላይ ግልጽ የቁጥር መረጃ ማግኘት አልተቻለም። እባክዎ በእጅ ይጻፉት።");
        }
    }

    function calculateFinalTender() {
        if(boqList.length === 0) { alert("በመጀመሪያ የBOQ ዝርዝር ያስገቡ!"); return; }

        let baseDirectCost = 0;
        boqList.forEach(item => { baseDirectCost += item.total; });

        const adjType = document.getElementById('adjustmentType').value;
        const adjPercent = parseFloat(document.getElementById('adjustmentPercent').value) || 0;
        let adjustmentAmount = 0;

        if (adjType === 'increase') {
            adjustmentAmount = baseDirectCost * (adjPercent / 100);
            document.getElementById('adjustmentRow').style.display = 'flex';
            document.getElementById('resAdjustment').innerText = "+" + adjustmentAmount.toLocaleString(undefined, {minimumFractionDigits: 2}) + " ETB (" + adjPercent + "%)";
        } else if (adjType === 'decrease') {
            adjustmentAmount = -1 * (baseDirectCost * (adjPercent / 100));
            document.getElementById('adjustmentRow').style.display = 'flex';
            document.getElementById('resAdjustment').innerText = adjustmentAmount.toLocaleString(undefined, {minimumFractionDigits: 2}) + " ETB (-" + adjPercent + "%)";
        } else {
            document.getElementById('adjustmentRow').style.display = 'none';
        }

        const subTotal = baseDirectCost + adjustmentAmount; 
        const vat = subTotal * 0.15;
        const grandTotal = subTotal + vat;

        document.getElementById('resDirect').innerText = baseDirectCost.toLocaleString(undefined, {minimumFractionDigits: 2}) + " ETB";
        document.getElementById('resSubtotal').innerText = subTotal.toLocaleString(undefined, {minimumFractionDigits: 2}) + " ETB";
        document.getElementById('resVat').innerText = vat.toLocaleString(undefined, {minimumFractionDigits: 2}) + " ETB";
        document.getElementById('resTotal').innerText = grandTotal.toLocaleString(undefined, {minimumFractionDigits: 2}) + " ETB";

        document.getElementById('resultBox').style.display = 'block';
    }
    </script>
    </body>
    </html>
  `;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#eef2f7" />
      <WebView 
        originWhitelist={['*']}
        source={{ html: htmlContent }}
        style={{ flex: 1 }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eef2f7',
  },
});

