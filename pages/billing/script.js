// 在输入框内容改变时保存内容
document.getElementById('api-key-input').addEventListener('input', function() {
	let rawInput = this.value;
	let apiKeys = rawInput.match(/sk-Xvs\w+/g);
	let uniqueApiKeys = [...new Set(apiKeys)];
	localStorage.setItem('api-key-input', uniqueApiKeys);
}, false);

// 在页面加载时恢复内容
window.addEventListener('load', function() {
	var apiKeyInput = localStorage.getItem('api-key-input');
	if (apiKeyInput !== null) {
		document.getElementById('api-key-input').value = apiKeyInput;
		sendRequest();
	}
}, false);

let queriedApiKeys = [];

async function checkBilling(apiKey, apiUrl) {
	const headers = {
		"Authorization": "Bearer " + apiKey,
		"Content-Type": "application/json"
	};
	const urlUserInfo = `${apiUrl}/dashboard/x-user-info`;
	try {
		let response = await fetch(urlUserInfo, { headers });
		if (!response.ok) {
			console.log("𝑼𝒏𝒂𝒖𝒕𝒉𝒐𝒓𝒊𝒛𝒆𝒅 𝒐𝒓 𝒔𝒖𝒔𝒑𝒆𝒏𝒅𝒆𝒅 𝑨𝑷𝑰 𝑲𝒆𝒚 𝒅𝒖𝒆 𝒕𝒐 𝒖𝒏𝒑𝒂𝒊𝒅 𝒄𝒉𝒂𝒓𝒈𝒆𝒔");
			return;
		}
		const user = await response.json();
		createAt = new Date(user.create_at).toLocaleString()
		const name = user.id + " "+ user.level + " " + user.child + "<br>" + user.name + "<br>" + user.email + "<br>" + createAt;
		let creditBalance = [];
		if (user.credit_balance && Array.isArray(user.credit_balance)) {
			creditBalance = user.credit_balance.map(credit => ({
				amount: "$" + credit.amount.toFixed(2),
				balance: "$" + credit.balance.toFixed(2),
				expiresAt: new Date(credit.expires_at).toLocaleDateString()
			}));
		}
		const creditUsed = "$"+formatNumber(user.credit_used)+"<br><span class='balance-green'>$"+formatNumber(user.balance)+"</span>";
		const usageRatio = (user.daily_usage.CreditUsed / user.monthly_usage.CreditUsed * 100).toFixed(2);
		const usage = "$"+formatNumber(user.daily_usage.CreditUsed)+"<br>$"+formatNumber(user.monthly_usage.CreditUsed)+"<br>(" + usageRatio + "%)";
		const requestsRatio = (user.daily_usage.Requests / user.monthly_usage.Requests * 100).toFixed(2);
		const requests = user.daily_usage.Requests+"<br>"+user.monthly_usage.Requests+"<br>(" + requestsRatio + "%)";
		const limit = formatLimit(user.rpm)+"<br>"+formatLimit(user.tpd);
		return [name, creditBalance, creditUsed, usage, requests, limit];
	} catch (error) {
		return ["Error", null, null, null, null, null, null, null];
	}
}

function formatNumber(num) {
	if (Math.abs(num) >= 100000000) {
		return num.toExponential(2);
	}
	return num.toFixed(2);
}

function formatLimit(num) {
	if (Math.abs(num) >= 100000000) {
		return num.toExponential(2);
	}
	return Math.round(num);
}

function createHTMLCell(htmlContent) {
	let cell = document.createElement("td");
	cell.innerHTML = htmlContent;
	return cell;
}

function createCell(textContent) {
	let cell = document.createElement("td");
	cell.textContent = textContent;
	return cell;
}

function createRow(cells) {
	let row = document.createElement("tr");
	cells.forEach(cell => row.appendChild(cell));
	return row;
}

function createTableHeader() {
	let headerRow = document.createElement("tr");
	let headers = [
		{ en: "𝑨𝑷𝑰 𝑲𝒆𝒚", cn: "" },
		{ en: "𝑵𝒂𝒎𝒆", cn: "" },
		{ en: "𝑪𝒓𝒆𝒅𝒊𝒕 𝑩𝒂𝒍𝒂𝒏𝒄𝒆", cn: "Prepaid Card, Balance, Expiry Date" },
		{ en: "𝑼𝒔𝒆𝒅 / 𝑩𝒂𝒍𝒂𝒏𝒄𝒆", cn: "Total Used / Total Balance" },
		{ en: "𝑼𝒔𝒂𝒈𝒆", cn: "Today / This Month (Today/This Month)" },
		{ en: "𝑹𝒆𝒒𝒖𝒆𝒔𝒕𝒔", cn: "Today / This Month (Today/This Month)" },
		{ en: "𝑹𝒂𝒕𝒆𝑳𝒊𝒎𝒊𝒕", cn: "RPM / TPD" }
	];
	headers.forEach(header => {
		let th = document.createElement("th");
		th.innerHTML = `${header.en}<br>${header.cn}`;
		headerRow.appendChild(th);
	});
	return headerRow;
}

function createInnerTable(data) {
	let table = document.createElement("table");
	data.forEach(item => {
		let row = document.createElement("tr");
		Object.entries(item).forEach(([key, value]) => {
			let cell = document.createElement("td");
			if (key === 'amount' || key === 'balance') {
				cell.textContent = "$" + formatNumber(parseFloat(value.replace('$', '')));
			} else {
				cell.textContent = value;
			}
			row.appendChild(cell);
		});
		table.appendChild(row);
	});
	return table;
}

async function sendRequest() {
	const queryButton = document.getElementById("query-button");
	queryButton.textContent = "𝑾𝒂𝒊𝒕";
	queryButton.disabled = true;

	let apiKeyInput = document.getElementById("api-key-input");
	let table = document.getElementById("result-table");
	table.style.visibility = "visible";

	document.getElementById("result-table").getElementsByTagName('tbody')[0].innerHTML = "";

	let apiKeys = apiKeyInput.value.match(/sk-Xvs\w+/g);
	if (apiKeys === null || apiKeys.length === 0) {
		queryButton.textContent = "𝑸𝒖𝒆𝒓𝒚";
		queryButton.disabled = false;
		return;
	}
	let uniqueApiKeys = [...new Set(apiKeys)];

	let tableBody = document.querySelector("#result-table tbody");
	let currentDomain = window.location.hostname;
	let domainParts = currentDomain.split('.');
	let mainDomain = domainParts.slice(domainParts.length - 2).join('.');
	let apiUrl = `https://api.${mainDomain}`;

	let promises = uniqueApiKeys.map(apiKey => checkBilling(apiKey, apiUrl));

	Promise.all(promises).then(results => {
		tableBody.appendChild(createTableHeader());
		results.forEach((data, i) => {
			let apiKey = uniqueApiKeys[i].trim();
			let cells = [];

			cells.push(createCell(apiKey.slice(0, 8) + '***' + apiKey.slice(-4)));

			if (data[0] === "Error") {
				let errorMessageCell = createCell("𝑼𝒏𝒂𝒖𝒕𝒉𝒐𝒓𝒊𝒛𝒆𝒅 𝒐𝒓 𝒔𝒖𝒔𝒑𝒆𝒏𝒅𝒆𝒅 𝑨𝑷𝑰 𝑲𝒆𝒚 𝒅𝒖𝒆 𝒕𝒐 𝒖𝒏𝒑𝒂𝒊𝒅 𝒄𝒉𝒂𝒓𝒈𝒆𝒔");
				errorMessageCell.colSpan = "7";
				errorMessageCell.classList.add("status-error");
				cells.push(errorMessageCell);
			} else {
				cells.push(createHTMLCell(data[0]));

				let creditBalanceCell = createCell("");
				creditBalanceCell.appendChild(createInnerTable(data[1]));
				cells.push(creditBalanceCell);

				cells.push(createHTMLCell(data[2]));
				cells.push(createHTMLCell(data[3]));
				cells.push(createHTMLCell(data[4]));
				cells.push(createHTMLCell(data[5]));
			}

			tableBody.appendChild(createRow(cells));
		});

		queriedApiKeys = [];
		table.style.display = 'table';
		queryButton.textContent = "𝑸𝒖𝒆𝒓𝒚";
		queryButton.disabled = false;
	}).catch(error => {
		console.error(error);
	});
}
