let currentDomain = window.location.hostname;
let domainParts = currentDomain.split('.');
let mainDomain = domainParts.slice(domainParts.length - 2).join('.');
const BASE_URL = `https://api.${mainDomain}`;

async function fetchData(url, method, key, requestData) {
	try {
		const response = await fetch(url, {
			method: method,
			headers: {
				'Content-Type': 'application/json',
				'Authorization': key
			},
			body: JSON.stringify(requestData)
		});

		if (!response.ok) {
			throw new Error('Network response was not ok');
		}

		const data = await response.json();
		showModal(data);
		document.getElementById('userForm').reset();
		document.getElementById('key').value = getApiKey();
	} catch (error) {
		alert(error.message);
		console.error('Error:', error);
	}
}

function showModal(data) {
	const jsonPre = document.getElementById('jsonPre');
	const secretKeyValue = document.getElementById('secretKeyValue');
	const copySecretKeyButton = document.getElementById('copySecretKeyButton');
	const secretKeyContainer = document.getElementById('secretKeyContainer');

	jsonPre.innerText = JSON.stringify(data, null, 2);

	if (data.User && data.User.SecretKey) {
		secretKeyValue.innerText = data.User.SecretKey;
		secretKeyContainer.style.display = "flex";
	} else {
		secretKeyContainer.style.display = "none";
	}

	document.getElementById('myModal').style.display = "block";
}

function copySecretKeyToClipboard() {
	const secretKey = document.getElementById('secretKeyValue').innerText;
	if (navigator.clipboard) {
		navigator.clipboard.writeText(secretKey)
			.then(() => {
				showNotification('𝑺𝒆𝒄𝒓𝒆𝒕𝑲𝒆𝒚 𝒉𝒂𝒔 𝒃𝒆𝒆𝒏 𝒄𝒐𝒑𝒊𝒆𝒅 𝒕𝒐 𝒄𝒍𝒊𝒑𝒃𝒐𝒂𝒓𝒅 / 已复制');
			})
			.catch(err => {
				showNotification('复制失败: 没有权限 / 𝑪𝒐𝒑𝒚 𝒇𝒂𝒊𝒍𝒆𝒅: 𝑵𝒐 𝒑𝒆𝒓𝒎𝒊𝒔𝒔𝒊𝒐𝒏', 5000);
			});
	} else {
		showNotification('复制失败: 浏览器不支持 / 𝑪𝒐𝒑𝒚 𝒇𝒂𝒊𝒍𝒆𝒅: 𝑩𝒓𝒐𝒘𝒔𝒆𝒓 𝒏𝒐𝒕 𝒔𝒖𝒑𝒑𝒐𝒓𝒕𝒆𝒅', 5000);
	}
}

function showNotification(message, duration = 3000) {
	const notificationContainer = document.getElementById('notificationContainer');
	const notification = document.createElement('div');
	notification.classList.add('notification');
	notification.innerText = message;

	// 将通知添加到容器中
	notificationContainer.appendChild(notification);

	// 触发显示动画
	setTimeout(() => {
		notification.classList.add('show');
	}, 10); // 延迟确保元素已经渲染

	// 设置定时器来隐藏通知
	setTimeout(() => {
		notification.classList.add('hide');

		// 动画结束后移除通知元素
		notification.addEventListener('transitionend', () => {
			notification.remove();
		}, { once: true });
	}, duration);
}

function hideModal() {
	document.getElementById('myModal').style.display = "none";
}

window.onclick = function(event) {
	if (event.target == document.getElementById('myModal')) {
		hideModal();
	}
};

document.getElementById('key').addEventListener('input', function() {
	let keyInput = this.value;
	let keyMatch = keyInput.match(/sk-Xvs\w{45}/g);
	let key = keyMatch ? keyMatch[0] : '';
	localStorage.setItem('parent-api-key-input', key);
}, false);

window.addEventListener('load', function() {
	var apiKeyInput = localStorage.getItem('parent-api-key-input');
	if (apiKeyInput !== null) document.getElementById('key').value = apiKeyInput;
}, false);

function getApiKey() {
	return localStorage.getItem('parent-api-key-input') || '';
}

function isValidEmail(email) {
	const regex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
	return regex.test(email);
}

function sanitizeName(name) {
	if (isValidEmail(name)) {
		name = name.split('@')[0];
	}

	name = name.replace(/\p{P}|\p{S}|\p{C}|\p{Z}/gu, '');

	if (!/\D/.test(name) || name.length < 4) {
		const randomChars = Math.random().toString(36).substring(2, 6);
		name = name + randomChars;
	}

	return name;
}

document.getElementById('userForm').addEventListener('submit', function(event) {
	event.preventDefault();
	const key = getApiKey();
	let name = sanitizeName(document.getElementById('name').value.trim());
	const email = document.getElementById('email').value.trim();
	const credit = Number(document.getElementById('credit').value.trim());
	const rates = document.getElementById('rates').value.trim() ? Number(document.getElementById('rates').value.trim()) : null;

	if (!key) {
		alert('𝑰𝒏𝒗𝒂𝒍𝒊𝒅 𝑨𝑷𝑰 𝑲𝒆𝒚');
		return;
	}

	if (!isValidEmail(email)) {
		alert('请输入有效的邮箱地址 / 𝑷𝒍𝒆𝒂𝒔𝒆 𝒆𝒏𝒕𝒆𝒓 𝒂 𝒗𝒂𝒍𝒊𝒅 𝒆𝒎𝒂𝒊𝒍 𝒂𝒅𝒅𝒓𝒆𝒔𝒔');
		return;
	}

	if (!key || !name || !email || !credit) {
		alert('请填写所有字段 / 𝑷𝒍𝒆𝒂𝒔𝒆 𝒇𝒊𝒍𝒍 𝒐𝒖𝒕 𝒂𝒍𝒍 𝒇𝒊𝒆𝒍𝒅𝒔');
		return;
	}

	const requestData = { Name: name, Email: email, CreditGranted: credit };

	if (rates !== null) {
		requestData.Rates = rates;
	}

	document.getElementById('submitButton').disabled = true;
	fetchData(`${BASE_URL}/x-users`, 'POST', key, requestData)
		.finally(() => {
			document.getElementById('submitButton').disabled = false;
		});
});

document.getElementById('creditButton').addEventListener('click', function() {
	const key = getApiKey();
	const name = document.getElementById('name').value.trim();
	const credit = Number(document.getElementById('credit').value.trim());
	const email = document.getElementById('email').value.trim();
	const rates = document.getElementById('rates').value.trim() ? Number(document.getElementById('rates').value.trim()) : null;

	if (!key) {
		alert('𝑰𝒏𝒗𝒂𝒍𝒊𝒅 𝑨𝑷𝑰 𝑲𝒆𝒚');
		return;
	}

	if (!key || !name || !credit) {
		alert('请填写名称和额度字段 / 𝑷𝒍𝒆𝒂𝒔𝒆 𝒇𝒊𝒍𝒍 𝒐𝒖𝒕 𝒕𝒉𝒆 𝒏𝒂𝒎𝒆 𝒂𝒏𝒅 𝒄𝒓𝒆𝒅𝒊𝒕 𝒇𝒊𝒆𝒍𝒅𝒔');
		return;
	}

	const requestData = { CreditGranted: credit };

	if (email) {
		requestData.Email = email;
	}
	if (rates !== null) {
		requestData.Rates = rates;
	}

	this.disabled = true;
	fetchData(`${BASE_URL}/x-users/${name}`, 'PUT', key, requestData)
		.finally(() => {
			this.disabled = false;
		});
});

document.getElementById('deleteButton').addEventListener('click', function() {
	const key = getApiKey();
	const name = document.getElementById('name').value.trim();

	if (!key) {
		alert('𝑰𝒏𝒗𝒂𝒍𝒊𝒅 𝑨𝑷𝑰 𝑲𝒆𝒚');
		return;
	}

	if (!key || !name) {
		alert('请填写所有字段 / 𝑷𝒍𝒆𝒂𝒔𝒆 𝒇𝒊𝒍𝒍 𝒐𝒖𝒕 𝒂𝒍𝒍 𝒇𝒊𝒆𝒍𝒅𝒔');
		return;
	}

	this.disabled = true;
	fetchData(`${BASE_URL}/x-users/${name}`, 'DELETE', key)
		.finally(() => {
			this.disabled = false;
		});
});

document.getElementById('viewButton').addEventListener('click', function() {
	const key = getApiKey();
	const name = document.getElementById('name').value.trim();

	if (!key) {
		alert('𝑰𝒏𝒗𝒂𝒍𝒊𝒅 𝑨𝑷𝑰 𝑲𝒆𝒚');
		return;
	}

	let url = `${BASE_URL}/x-dna`;
	if (name) {
		url += `/${name}`;
	}

	this.disabled = true;
	fetchData(url, 'GET', key)
		.finally(() => {
			this.disabled = false;
		});
});

document.getElementById('copySecretKeyButton').addEventListener('click', copySecretKeyToClipboard);
