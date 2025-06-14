class XAIManager {
	constructor() {
		this.currentApiKey = null;
		this.currentUser = null;
		this.usageChart = null;
		this.currentMetric = 'cost';
		this.queriedApiKeys = [];
		this.authCacheKey = 'xai-auth-cache';
		this.subAccountCacheKey = 'xai-sub-account-cache';
		this.authCacheDuration = 30 * 24 * 60 * 60 * 1000;
		this.usageData = null;
		this.initializeApp();
	}

	initializeApp() {
		this.setupDomain();
		this.bindEvents();
		this.checkAuthentication();
		this.setupDateInputs();
	}

	setupDomain() {
		this.currentDomain = window.location.hostname;
		const domainParts = this.currentDomain.split('.');
		this.mainDomain = domainParts.slice(-2).join('.');
		this.BASE_URL = `https://api.${this.mainDomain}`;
		this.updateApiDocLinks();
	}

	updateApiDocLinks() {
		const modelsLink = document.getElementById('modelsLink');
		if (modelsLink) {
			modelsLink.href = `https://api.${this.mainDomain}/v1/models`;
			modelsLink.textContent = `https://api.${this.mainDomain}/v1/models`;
		}

		const docsLink = document.getElementById('docsLink');
		if (docsLink) {
			docsLink.href = `https://docs.${this.mainDomain}`;
			docsLink.textContent = `https://docs.${this.mainDomain}`;
		}

		const apiBaseUrls = document.querySelectorAll('.api-base-url');
		apiBaseUrls.forEach(el => {
			el.textContent = `https://api.${this.mainDomain}/v1`;
		});

		const apiBaseUrlsAnthropic = document.querySelectorAll('.api-base-url-anthropic');
		apiBaseUrlsAnthropic.forEach(el => {
			el.textContent = `https://api.${this.mainDomain}`;
		});
	}

	setupDateInputs() {
		const today = new Date().toISOString().split('T')[0];
		const dateInputs = document.querySelectorAll('input[type="date"]');
		dateInputs.forEach(input => {
			input.max = today;
		});

		document.getElementById('usageDate').value = today;
		document.getElementById('endDate').value = today;

		const sevenDaysAgo = new Date();
		sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
		document.getElementById('startDate').value = sevenDaysAgo.toISOString().split('T')[0];
	}

	bindEvents() {
		this.bindLoginEvents();
		this.bindTabEvents();
		this.bindFormEvents();
		this.bindModalEvents();
		this.bindApiKeyInputEvents();
		this.bindSubAccountInputEvents();
		this.bindUsageEvents();
	}

	bindUsageEvents() {
		const usageTypeBtns = document.querySelectorAll('.usage-type-btn');
		usageTypeBtns.forEach(btn => {
			btn.addEventListener('click', () => this.switchUsageType(btn.dataset.type));
		});

		document.getElementById('queryToday').addEventListener('click', () => this.queryUsage('today'));
		document.getElementById('queryDate').addEventListener('click', () => this.queryUsage('date'));
		document.getElementById('queryRange').addEventListener('click', () => this.queryUsage('range'));

		document.getElementById('sortBy').addEventListener('change', (e) => this.sortUsageTable(e.target.value));

		document.querySelectorAll('.chart-type-btn').forEach(btn => { btn.addEventListener('click', () => this.switchChartType(btn.dataset.metric)); });

		document.getElementById('startDate').addEventListener('change', (e) => {
			const endDate = document.getElementById('endDate');
			if (endDate.value && e.target.value > endDate.value) {
				endDate.value = e.target.value;
			}
		});

		document.getElementById('endDate').addEventListener('change', (e) => {
			const startDate = document.getElementById('startDate');
			if (startDate.value && e.target.value < startDate.value) {
				startDate.value = e.target.value;
			}
		});
	}

	switchChartType(metric) {
		this.currentMetric = metric;

		document.querySelectorAll('.chart-type-btn').forEach(btn => {
			btn.classList.toggle('active', btn.dataset.metric === metric);
		});

		if (this.usageData && this.usageData.daily_costs) {
			this.updateChart(this.usageData.daily_costs);
		}
	}

	switchUsageType(type) {
		document.querySelectorAll('.usage-type-btn').forEach(btn => {
			btn.classList.toggle('active', btn.dataset.type === type);
		});

		document.querySelectorAll('.control-section').forEach(section => {
			section.classList.add('hidden');
		});

		document.getElementById(`${type}Controls`).classList.remove('hidden');

		if (type === 'today') {
			this.queryUsage('today');
		}
	}

	async queryUsage(type) {
		let url = `${this.BASE_URL}/dashboard/bill`;
		let params = new URLSearchParams();

		if (type === 'date') {
			const date = document.getElementById('usageDate').value;
			if (!date) {
				this.showNotification('Please select a date', 'warning');
				return;
			}
			params.append('date', date);
		} else if (type === 'range') {
			const startDate = document.getElementById('startDate').value;
			const endDate = document.getElementById('endDate').value;

			if (!startDate || !endDate) {
				this.showNotification('Please select a start and end date', 'warning');
				return;
			}

			params.append('start', startDate);
			params.append('end', endDate);
		}

		if (params.toString()) {
			url += '?' + params.toString();
		}

		const queryButton = type === 'today' ? document.getElementById('queryToday') :
			type === 'date' ? document.getElementById('queryDate') :
			document.getElementById('queryRange');

		const originalHTML = queryButton.innerHTML;
		this.setLoadingState(queryButton, true, 'Querying...');

		try {
			const response = await fetch(url, {
				headers: {
					'Authorization': this.currentApiKey
				}
			});

			if (!response.ok) {
				throw new Error(`Query failed (${response.status})`);
			}

			const data = await response.json();
			this.usageData = data;
			this.displayUsageResults(data, type);

			this.showNotification('Query successful', 'success');
		} catch (error) {
			this.showNotification(error.message || 'Query failed', 'error');
			console.error('Usage query error:', error);
		} finally {
			queryButton.innerHTML = originalHTML;
			queryButton.disabled = false;
		}
	}

	displayUsageResults(data, queryType) {
		const resultsDiv = document.getElementById('usageResults');
		resultsDiv.classList.remove('hidden');

		document.getElementById('totalCost').textContent = this.formatNumber(data.total_credit_used || 0, 'currency');
		document.getElementById('totalRequests').textContent = (data.total_requests || 0).toLocaleString();
		document.getElementById('totalPrompt').textContent = (data.total_prompt || 0).toLocaleString();
		document.getElementById('totalCompletion').textContent = (data.total_completion || 0).toLocaleString();

		const modelUsage = this.processModelUsage(data.usage_summary || {});
		this.displayModelUsageTable(modelUsage);

		if (queryType === 'range' && data.daily_costs && data.daily_costs.length > 1) {
			this.displayDailyStats(data.daily_costs);
			this.initChart();
			this.updateChart(data.daily_costs);
			document.getElementById('dailyStats').classList.remove('hidden');
		} else {
			document.getElementById('dailyStats').classList.add('hidden');
			this.destroyChart();
		}
	}

	initChart() {
		const ctx = document.getElementById('usageChart');
		if (!ctx) return;

		this.destroyChart();

		this.usageChart = new Chart(ctx, {
			type: 'line',
			data: {
				labels: [],
				datasets: [{
					label: '',
					data: [],
					borderColor: '#6366f1',
					backgroundColor: 'rgba(99, 102, 241, 0.1)',
					borderWidth: 3,
					fill: true,
					tension: 0.4,
					pointRadius: 5,
					pointHoverRadius: 7,
					pointBackgroundColor: '#6366f1',
					pointBorderColor: '#fff',
					pointBorderWidth: 2,
					pointHoverBackgroundColor: '#4f46e5',
					pointHoverBorderColor: '#fff',
					pointHoverBorderWidth: 2
				}]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				interaction: {
					mode: 'index',
					intersect: false,
				},
				plugins: {
					legend: {
						display: false
					},
					tooltip: {
						backgroundColor: 'rgba(0, 0, 0, 0.8)',
						titleColor: '#fff',
						bodyColor: '#fff',
						borderColor: '#4b5563',
						borderWidth: 1,
						padding: 12,
						cornerRadius: 8,
						displayColors: false,
						callbacks: {
							label: (context) => {
								const metric = this.currentMetric;
								const value = context.parsed.y;

								switch(metric) {
									case 'cost':
										return `Cost: ${this.formatNumber(value, 'currency')}`;
									case 'requests':
										return `Requests: ${value.toLocaleString()}`;
									case 'tokens':
										return `Tokens: ${value.toLocaleString()}`;
									default:
										return value.toLocaleString();
								}
							}
						}
					}
				},
				scales: {
					x: {
						grid: {
							display: false
						},
						ticks: {
							font: {
								size: 12
							},
							color: '#6b7280',
							maxRotation: 45,
							minRotation: 45
						}
					},
					y: {
						beginAtZero: true,
						grid: {
							color: 'rgba(229, 231, 235, 0.5)',
							drawBorder: false
						},
						ticks: {
							font: {
								size: 12
							},
							color: '#6b7280',
							callback: (value) => {
								if (this.currentMetric === 'cost') {
									return this.formatNumber(value, 'currency');
								}
								return value.toLocaleString();
							}
						}
					}
				}
			}
		});
	}

	updateChart(dailyCosts) {
		if (!this.usageChart) return;

		const sortedData = [...dailyCosts].sort((a, b) => new Date(a.date) - new Date(b.date));

		const labels = sortedData.map(day => {
			const date = new Date(day.date);
			return `${date.getMonth() + 1}/${date.getDate()}`;
		});

		let data = [];
		let datasetConfig = {};

		switch(this.currentMetric) {
			case 'cost':
				data = sortedData.map(day => day.total_credit_used || 0);
				datasetConfig = {
					label: 'Daily Cost',
					borderColor: '#6366f1',
					backgroundColor: 'rgba(99, 102, 241, 0.1)',
					pointBackgroundColor: '#6366f1',
					pointHoverBackgroundColor: '#4f46e5'
				};
				break;
			case 'requests':
				data = sortedData.map(day => day.total_requests || 0);
				datasetConfig = {
					label: 'Daily Requests',
					borderColor: '#10b981',
					backgroundColor: 'rgba(16, 185, 129, 0.1)',
					pointBackgroundColor: '#10b981',
					pointHoverBackgroundColor: '#059669'
				};
				break;
			case 'tokens':
				data = sortedData.map(day => {
					if (day.total_prompt !== undefined && day.total_completion !== undefined) {
						return day.total_prompt + day.total_completion;
					}

					let totalTokens = 0;
					if (day.line_items && day.line_items.length > 0) {
						day.line_items.forEach(item => {
							if (item.usage && item.usage.model_stats) {
								totalTokens += (item.usage.model_stats.Prompt || 0) + (item.usage.model_stats.Completion || 0);
							}
						});
					}
					return totalTokens;
				});
				datasetConfig = {
					label: 'Daily Token Usage',
					borderColor: '#f59e0b',
					backgroundColor: 'rgba(245, 158, 11, 0.1)',
					pointBackgroundColor: '#f59e0b',
					pointHoverBackgroundColor: '#d97706'
				};
				break;
		}

		this.usageChart.data.labels = labels;
		this.usageChart.data.datasets[0] = {
			...this.usageChart.data.datasets[0],
			...datasetConfig,
			data: data
		};

		this.usageChart.update('active');
	}

	destroyChart() {
		if (this.usageChart) {
			this.usageChart.destroy();
			this.usageChart = null;
		}
	}

	formatNumber(num, type = 'currency') {
		if (typeof num !== 'number') return type === 'currency' ? '\\$0.00' : '0';

		if (Math.abs(num) >= 100000000) {
			return (type === 'currency' ? '\$' : '') + num.toExponential(2);
		}

		if (type === 'currency') {
			return '\$' + num.toFixed(2);
		} else if (type === 'limit') {
			return Math.round(num).toLocaleString();
		}
		return num.toFixed(2);
	}

	processModelUsage(usageSummary) {
		const models = [];

		for (const [modelName, stats] of Object.entries(usageSummary)) {
			if (stats.model_stats) {
				models.push({
					name: modelName,
					requests: stats.model_stats.Requests || 0,
					prompt: stats.model_stats.Prompt || 0,
					completion: stats.model_stats.Completion || 0,
					cost: stats.model_stats.CreditUsed || 0,
					costPercentage: stats.usage_analysis?.cost_percentage || 0,
					requestPercentage: stats.usage_analysis?.request_percentage || 0
				});
			}
		}

		return models.sort((a, b) => b.cost - a.cost);
	}

	displayModelUsageTable(models) {
		const tbody = document.querySelector('#usageTable tbody');
		tbody.innerHTML = '';

		models.forEach(model => {
			const row = document.createElement('tr');
			row.className = 'table-row';

			const displayName = model.name.length > 40 ?
				model.name.substring(0, 37) + '...' :
				model.name;

			row.innerHTML = `
				<td class="model-name-cell" title="${model.name}">${displayName}</td>
				<td>${model.requests.toLocaleString()}</td>
				<td>${model.prompt.toLocaleString()}</td>
				<td>${model.completion.toLocaleString()}</td>
				<td class="cost-cell">${this.formatNumber(model.cost, 'currency')}</td>
				<td>
				<div class="usage-percentage">
				<div class="percentage-bar" style="width: ${model.costPercentage}%"></div>
				<span class="percentage-text">${model.costPercentage.toFixed(2)}%</span>
				</div>
				</td>
				`;

			tbody.appendChild(row);
		});
	}

	sortUsageTable(sortBy) {
		if (!this.usageData) return;

		const models = this.processModelUsage(this.usageData.usage_summary || {});

		switch(sortBy) {
			case 'requests':
				models.sort((a, b) => b.requests - a.requests);
				break;
			case 'name':
				models.sort((a, b) => a.name.localeCompare(b.name));
				break;
			case 'cost':
			default:
				models.sort((a, b) => b.cost - a.cost);
				break;
		}

		this.displayModelUsageTable(models);
	}

	displayDailyStats(dailyCosts) {
		const tbody = document.querySelector('#dailyTable tbody');
		tbody.innerHTML = '';

		const sortedDays = [...dailyCosts].sort((a, b) => b.timestamp - a.timestamp);

		sortedDays.forEach(day => {
			const row = document.createElement('tr');
			row.className = 'table-row';

			let topModel = '';
			let maxCost = 0;

			if (day.line_items && day.line_items.length > 0) {
				day.line_items.forEach(item => {
					if (item.cost > maxCost) {
						maxCost = item.cost;
						topModel = item.name;
					}
				});
			}

			const cost = day.total_credit_used || 0;
			const requests = day.total_requests || 0;

			row.innerHTML = `
				<td>${day.date}</td>
				<td>${requests.toLocaleString()}</td>
				<td class="cost-cell">${this.formatNumber(cost, 'currency')}</td>
				<td class="model-name-cell" title="${topModel}">${topModel.length > 30 ? topModel.substring(0, 27) + '...' : topModel}</td>
				`;

			tbody.appendChild(row);
		});
	}

	bindApiKeyInputEvents() {
		const apiKeyInput = document.getElementById('api-key-input');
		if (apiKeyInput) {
			apiKeyInput.addEventListener('input', (e) => {
				const apiKeys = e.target.value.match(/sk-Xvs\w+/g);
				if (apiKeys) {
					const uniqueApiKeys = [...new Set(apiKeys)];
					localStorage.setItem('xai-query-keys', uniqueApiKeys.join(','));
				}
			});

			apiKeyInput.addEventListener('keydown', (e) => {
				if (e.ctrlKey && e.key === 'Enter') {
					this.sendBillingRequest();
				}
			});
		}
	}

	bindSubAccountInputEvents() {
		const subAccountInputs = ['rechargeForm', 'viewForm', 'updateForm'].map(id =>
			document.querySelector(`#${id} input[name="name"]`)
		).filter(Boolean);

		subAccountInputs.forEach(input => {
			const cachedSubAccount = this.getCachedSubAccount();
			if (cachedSubAccount) {
				input.value = cachedSubAccount;
			}

			input.addEventListener('change', (e) => {
				const value = e.target.value.trim();
				if (value) {
					this.setCachedSubAccount(value);
				}
			});
		});
	}

	getCachedSubAccount() {
		return localStorage.getItem(this.subAccountCacheKey) || '';
	}

	setCachedSubAccount(value) {
		localStorage.setItem(this.subAccountCacheKey, value);
	}

	bindLoginEvents() {
		const loginForm = document.getElementById('loginForm');
		const logoutButton = document.getElementById('logoutButton');

		loginForm.addEventListener('submit', (e) => this.handleLogin(e));
		logoutButton.addEventListener('click', () => this.handleLogout());

		const loginKey = document.getElementById('loginKey');
		loginKey.addEventListener('keydown', (e) => {
			if (e.key === 'Enter') {
				e.preventDefault();
				loginForm.dispatchEvent(new Event('submit', { cancelable: true }));
			}
		});
	}

	bindTabEvents() {
		const tabButtons = document.querySelectorAll('.tab-button');
		tabButtons.forEach(button => {
			button.addEventListener('click', () => this.switchTab(button.dataset.tab));
		});
	}

	bindFormEvents() {
		const forms = {
			create: this.handleCreate,
			recharge: this.handleRecharge,
			view: this.handleView,
			update: this.handleUpdate,
			delete: this.handleDelete
		};

		Object.entries(forms).forEach(([formId, handler]) => {
			const form = document.getElementById(`${formId}Form`);
			if (form) {
				form.addEventListener('submit', (e) => handler.call(this, e));
			}
		});
	}

	bindModalEvents() {
		const closeModal = document.getElementById('closeModal');
		const copyButton = document.getElementById('copySecretKeyButton');
		const modal = document.getElementById('resultModal');

		closeModal.addEventListener('click', () => this.hideModal());
		copyButton.addEventListener('click', () => this.copySecretKey());

		modal.addEventListener('click', (e) => {
			if (e.target === modal) {
				this.hideModal();
			}
		});

		document.addEventListener('keydown', (e) => {
			if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
				this.hideModal();
			}
		});
	}

	getAuthCache() {
		try {
			const cached = localStorage.getItem(this.authCacheKey);
			if (!cached) return null;

			const data = JSON.parse(cached);
			const now = Date.now();

			if (now - data.timestamp > this.authCacheDuration) {
				localStorage.removeItem(this.authCacheKey);
				return null;
			}

			return data;
		} catch (error) {
			return null;
		}
	}

	setAuthCache(apiKey, userData) {
		const cacheData = {
			apiKey,
			userData,
			timestamp: Date.now()
		};
		localStorage.setItem(this.authCacheKey, JSON.stringify(cacheData));
	}

	async checkAuthentication() {
		const authCache = this.getAuthCache();
		if (authCache) {
			this.currentApiKey = authCache.apiKey;
			this.currentUser = authCache.userData;
			this.isRootUser = authCache.userData.name === 'root';

			this.showMainApp();
			this.loadSavedApiKeys();

			this.silentUpdateUserInfo(authCache.apiKey);

			setTimeout(() => this.autoQueryOnLoad(), 300);
			return;
		}

		const savedKey = localStorage.getItem('xai-parent-api-key');
		const savedUser = localStorage.getItem('xai-user-info');

		if (savedKey && savedUser) {
			try {
				const isValid = await this.verifyApiKey(savedKey);
				if (isValid) {
					this.currentApiKey = savedKey;
					this.currentUser = JSON.parse(savedUser);

					this.setAuthCache(savedKey, this.currentUser);

					this.showMainApp();
					this.loadSavedApiKeys();
					this.autoQueryOnLoad();
					return;
				}
			} catch (error) {
				console.error('Validation failed:', error);
			}
		}

		this.clearAuthentication();
		this.showLoginPage();
	}

	async silentUpdateUserInfo(apiKey) {
		try {
			const response = await fetch(`${this.BASE_URL}/dashboard/info`, {
				headers: { 'Authorization': `Bearer ${apiKey}` }
			});

			if (response.ok) {
				const userData = await response.json();
				if (userData.name) {
					this.currentUser = userData;
					this.isRootUser = userData.name === 'root';

					this.setAuthCache(apiKey, userData);
					this.updateUserInfo();
					this.updateUserPermissions();
				}
			}
		} catch (error) {
			console.error('Silent user info update failed:', error);
		}
	}

	autoQueryOnLoad() {
		const usageTab = document.getElementById('usageTab');
		if (!usageTab.classList.contains('hidden')) {
			setTimeout(() => this.queryUsage('today'), 300);
		}
	}

	loadSavedApiKeys() {
		const savedKeys = localStorage.getItem('xai-query-keys');
		const apiKeyInput = document.getElementById('api-key-input');

		if (apiKeyInput) {
			apiKeyInput.value = savedKeys ? savedKeys.replace(/,/g, '\n') : this.currentApiKey || '';
		}
	}

	async verifyApiKey(apiKey) {
		try {
			const response = await fetch(`${this.BASE_URL}/dashboard/info`, {
				headers: { 'Authorization': `Bearer ${apiKey}` }
			});

			if (response.ok) {
				const userData = await response.json();
				if (userData.name) {
					this.currentUser = userData;
					this.isRootUser = userData.name === 'root';
					return true;
				}
			}
		} catch (error) {
			console.error('API validation error:', error);
		}
		return false;
	}

	clearAuthentication() {
		localStorage.removeItem('xai-parent-api-key');
		localStorage.removeItem('xai-user-info');
		localStorage.removeItem(this.authCacheKey);
		this.currentApiKey = null;
		this.currentUser = null;
	}

	async handleLogin(e) {
		e.preventDefault();
		const form = e.target;
		const submitButton = form.querySelector('button[type="submit"]');
		const apiKey = form.loginKey.value.trim();

		if (!this.validateApiKey(apiKey)) {
			this.showNotification('Invalid API Key format', 'error');
			return;
		}

		const originalHTML = submitButton.innerHTML;
		this.setLoadingState(submitButton, true, 'Verifying...');

		try {
			const isValid = await this.verifyApiKey(apiKey);
			if (isValid) {
				this.currentApiKey = apiKey;

				localStorage.setItem('xai-parent-api-key', apiKey);
				localStorage.setItem('xai-user-info', JSON.stringify(this.currentUser));
				this.setAuthCache(apiKey, this.currentUser);

				this.showMainApp();
				setTimeout(() => this.autoQueryOnLoad(), 500);
			} else {
				throw new Error('API Key is invalid or has expired');
			}
		} catch (error) {
			this.showNotification(error.message || 'Login failed', 'error');
		} finally {
			submitButton.innerHTML = originalHTML;
			submitButton.disabled = false;
		}
	}

	handleLogout() {
		this.clearAuthentication();
		document.body.classList.remove('is-root-user');
		this.showLoginPage();
	}

	showLoginPage() {
		document.getElementById('loginPage').classList.remove('hidden');
		document.getElementById('mainApp').classList.add('hidden');
	}

	showMainApp() {
		document.getElementById('loginPage').classList.add('hidden');
		document.getElementById('mainApp').classList.remove('hidden');
		this.updateUserInfo();
		this.updateApiDocLinks();
		this.updateUserPermissions();
		this.updateAllApiExamples();
	}

	updateUserPermissions() {
		const body = document.body;
		if (this.isRootUser) {
			body.classList.add('is-root-user');
		} else {
			body.classList.remove('is-root-user');
		}
	}

	updateUserInfo() {
		const userInfoElement = document.getElementById('userInfo');
		if (this.currentUser) {
			const balance = this.formatBalance(this.currentUser.balance);
			userInfoElement.innerHTML = `
				<div class="user-info-card">
				<div class="user-name">${this.currentUser.name}</div>
				<div class="user-balance">Balance: ${balance}</div>
				</div>
				`;
		}
	}

	formatBalance(balance) {
		return this.formatNumber(balance, 'currency');
	}

	formatLimit(num) {
		return this.formatNumber(num, 'limit');
	}

	switchTab(tabName) {
		document.querySelectorAll('.tab-button').forEach(button => {
			button.classList.toggle('active', button.dataset.tab === tabName);
		});

		document.querySelectorAll('.tab-content').forEach(content => {
			content.classList.add('hidden');
		});
		document.getElementById(`${tabName}Tab`).classList.remove('hidden');

		if (['recharge', 'view', 'update'].includes(tabName)) {
			const input = document.querySelector(`#${tabName}Form input[name="name"]`);
			if (input && !input.value) {
				input.value = this.getCachedSubAccount();
			}
		}

		if (['create', 'recharge', 'view', 'update', 'delete'].includes(tabName)) {
			this.updateApiExample(tabName);
		}

		if (tabName === 'usage') {
			setTimeout(() => this.queryUsage('today'), 100);
		} else if (tabName === 'query') {
			const apiKeyInput = document.getElementById('api-key-input');
			if (!apiKeyInput.value.trim() && this.currentApiKey) {
				apiKeyInput.value = this.currentApiKey;
			}
			setTimeout(() => this.sendBillingRequest(), 100);
		}
	}

	validateApiKey(key) {
		return key && key.length == 51 && key.startsWith('sk-Xvs');
	}

	async sendBillingRequest() {
		const queryButton = document.getElementById("query-button");
		const originalHTML = queryButton.innerHTML;

		this.setLoadingState(queryButton, true, 'Querying...');

		const apiKeyInput = document.getElementById("api-key-input");
		const resultsDiv = document.getElementById("query-results");
		const table = document.getElementById("result-table");

		table.getElementsByTagName('tbody')[0].innerHTML = "";

		const apiKeys = apiKeyInput.value.match(/sk-Xvs\w+/g);
		if (!apiKeys || apiKeys.length === 0) {
			this.showNotification('Please enter a valid API Key', 'warning');
			queryButton.innerHTML = originalHTML;
			queryButton.disabled = false;
			return;
		}

		const uniqueApiKeys = [...new Set(apiKeys)];
		resultsDiv.classList.remove('hidden');

		const resultsCount = document.getElementById('results-count');
		resultsCount.textContent = `Total: ${uniqueApiKeys.length} accounts`;

		const tableBody = document.querySelector("#result-table tbody");

		try {
			const results = await Promise.all(uniqueApiKeys.map(apiKey => this.checkBilling(apiKey)));

			tableBody.appendChild(this.createBillingTableHeader());
			results.forEach((data, i) => {
				const apiKey = uniqueApiKeys[i].trim();
				const row = this.createBillingRow(apiKey, data);
				tableBody.appendChild(row);
			});

			this.showNotification(`Query complete. Found ${uniqueApiKeys.length} accounts.`, 'success');
		} catch (error) {
			this.showNotification('Query failed', 'error');
			console.error(error);
		} finally {
			queryButton.innerHTML = originalHTML;
			queryButton.disabled = false;
		}
	}

	async checkBilling(apiKey) {
		const headers = {
			"Authorization": "Bearer " + apiKey,
			"Content-Type": "application/json"
		};

		try {
			const response = await fetch(`${this.BASE_URL}/dashboard/info`, { headers });
			if (!response.ok) {
				return ["Error", null, null, null, null, null];
			}

			const user = await response.json();
			const createAt = new Date(user.create_at).toLocaleString();
			const name = `${user.id} ${user.level} ${user.child}<br>${user.name}<br>${user.email}<br>${createAt}`;

			let creditBalance = [];
			if (user.credit_balance && Array.isArray(user.credit_balance)) {
				creditBalance = user.credit_balance.map(credit => ({
					amount: this.formatNumber(credit.amount, 'currency'),
					balance: this.formatNumber(credit.balance, 'currency'),
					expiresAt: new Date(credit.expires_at).toLocaleDateString()
				}));
			}

			const creditUsed = `${this.formatNumber(user.credit_used, 'currency')}<br><span class='balance-value'>${this.formatNumber(user.balance, 'currency')}</span>`;
			const usageRatio = user.monthly_usage.CreditUsed > 0
				? (user.daily_usage.CreditUsed / user.monthly_usage.CreditUsed * 100).toFixed(2)
				: '0.00';
			const usage = `${this.formatNumber(user.daily_usage.CreditUsed, 'currency')}<br>${this.formatNumber(user.monthly_usage.CreditUsed, 'currency')}<br><span class="usage-ratio">(${usageRatio}%)</span>`;

			const requestsRatio = user.monthly_usage.Requests > 0
				? (user.daily_usage.Requests / user.monthly_usage.Requests * 100).toFixed(2)
				: '0.00';
			const requests = `${user.daily_usage.Requests.toLocaleString()}<br>${user.monthly_usage.Requests.toLocaleString()}<br><span class="usage-ratio">(${requestsRatio}%)</span>`;

			const limit = `${this.formatLimit(user.rpm)}<br>${this.formatLimit(user.tpd)}`;

			return [name, creditBalance, creditUsed, usage, requests, limit];
		} catch (error) {
			return ["Error", null, null, null, null, null];
		}
	}

	createBillingTableHeader() {
		const headerRow = document.createElement("tr");
		headerRow.className = "table-header";
		const headers = [
			{ en: "API Key", cn: "" },
			{ en: "Account Info", cn: "ID / Level / Sub-accounts / Username / Email / Created At" },
			{ en: "Credit Vouchers", cn: "Amount / Balance / Expires At" },
			{ en: "Used / Balance", cn: "Total Spent / Total Balance" },
			{ en: "Consumption", cn: "Today / This Month (Ratio)" },
			{ en: "Requests", cn: "Today / This Month (Ratio)" },
			{ en: "Rate Limit", cn: "RPM / TPD" }
		];
		headers.forEach(header => {
			const th = document.createElement("th");
			th.innerHTML = `<div class="th-content">${header.en}</div>${header.cn ? `<div class="th-subtitle">${header.cn}</div>` : ''}`;
			headerRow.appendChild(th);
		});
		return headerRow;
	}

	createBillingRow(apiKey, data) {
		const row = document.createElement("tr");
		row.className = "table-row";

		const apiKeyCell = document.createElement("td");
		apiKeyCell.className = "api-key-cell";
		const maskedKey = apiKey.slice(0, 8) + '***' + apiKey.slice(-4);
		apiKeyCell.innerHTML = `
			<div class="api-key-display">
			<span class="masked-key">${maskedKey}</span>
			<button class="btn-icon-small" onclick="window.xaiManager.copyToClipboard('${apiKey}')">
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
			</svg>
			</button>
			</div>
			`;
		row.appendChild(apiKeyCell);

		if (data[0] === "Error") {
			const errorCell = document.createElement("td");
			errorCell.colSpan = "6";
			errorCell.className = "error-cell";
			errorCell.textContent = "Account is unavailable or has been suspended.";
			row.appendChild(errorCell);
		} else {
			const nameCell = document.createElement("td");
			nameCell.innerHTML = data[0];
			row.appendChild(nameCell);

			const creditBalanceCell = document.createElement("td");
			creditBalanceCell.appendChild(this.createCreditTable(data[1]));
			row.appendChild(creditBalanceCell);

			for (let i = 2; i < data.length; i++) {
				const cell = document.createElement("td");
				cell.innerHTML = data[i];
				row.appendChild(cell);
			}
		}

		return row;
	}

	createCreditTable(creditData) {
		if (!creditData || creditData.length === 0) {
			const emptyDiv = document.createElement("div");
			emptyDiv.className = "empty-credit";
			emptyDiv.textContent = "No credit vouchers";
			return emptyDiv;
		}

		const table = document.createElement("table");
		table.className = "credit-table";
		creditData.forEach(item => {
			const row = document.createElement("tr");
			Object.entries(item).forEach(([key, value]) => {
				const cell = document.createElement("td");
				cell.textContent = value;
				if (key === 'balance') {
					cell.className = 'credit-balance';
				}
				row.appendChild(cell);
			});
			table.appendChild(row);
		});
		return table;
	}

	async copyToClipboard(text) {
		try {
			await navigator.clipboard.writeText(text);
			this.showNotification('Copied to clipboard', 'success');
		} catch (error) {
			this.fallbackCopy(text);
		}
	}

	async copyCode(type) {
		try {
			const codeElement = document.getElementById(`${type}-code`);
			if (!codeElement) {
				this.showNotification('Code block not found', 'error');
				return;
			}

			const code = codeElement.textContent || codeElement.innerText;

			await navigator.clipboard.writeText(code);
			this.showNotification('Code copied to clipboard', 'success');
		} catch (error) {
			const codeElement = document.getElementById(`${type}-code`);
			if (codeElement) {
				const code = codeElement.textContent || codeElement.innerText;
				this.fallbackCopy(code);
			} else {
				this.showNotification('Copy failed', 'error');
			}
		}
	}

	async copyApiExample(tabName, language) {
		try {
			const codeId = `${tabName}-${language}-code`;
			const codeElement = document.getElementById(codeId);

			if (!codeElement) {
				this.showNotification('Code not found', 'error');
				return;
			}

			const code = codeElement.textContent || codeElement.innerText;
			await navigator.clipboard.writeText(code);
			this.showNotification('API example copied to clipboard', 'success');
		} catch (error) {
			this.showNotification('Copy failed', 'error');
		}
	}

	async handleCreate(e) {
		e.preventDefault();
		const formData = new FormData(e.target);
		const data = {
			Name: this.sanitizeName(formData.get('name')),
			Email: formData.get('email').trim(),
			CreditGranted: Number(formData.get('credit'))
		};

		const rates = formData.get('rates');
		if (rates) {
			data.Rates = Number(rates);
		}

		await this.submitRequest(
			`${this.BASE_URL}/x-users`,
			'POST',
			data,
			e.target
		);
	}

	async handleRecharge(e) {
		e.preventDefault();
		const formData = new FormData(e.target);
		const name = formData.get('name').trim();
		const data = {
			CreditGranted: Number(formData.get('credit'))
		};

		this.setCachedSubAccount(name);

		await this.submitRequest(
			`${this.BASE_URL}/x-users/${name}`,
			'PUT',
			data,
			e.target
		);
	}

	async handleView(e) {
		e.preventDefault();
		const formData = new FormData(e.target);
		const name = formData.get('name').trim();

		if (name) {
			this.setCachedSubAccount(name);
		}

		const url = name ? `${this.BASE_URL}/x-dna/${name}` : `${this.BASE_URL}/x-dna`;

		await this.submitRequest(url, 'GET', null, e.target);
	}

	async handleUpdate(e) {
		e.preventDefault();
		const formData = new FormData(e.target);
		const name = formData.get('name').trim();

		if (!name) {
			this.showNotification('Please enter a sub-account identifier', 'error');
			return;
		}

		this.setCachedSubAccount(name);

		const data = this.buildUpdateData(formData, name);
		await this.submitRequest(
			`${this.BASE_URL}/x-users/${name}`,
			'PUT',
			data,
			e.target
		);
	}

	buildUpdateData(formData, name) {
		const data = { Name: name };

		const fieldMappings = {
			'email': 'Email',
			'credit': 'CreditGranted',
			'level': 'Level',
			'role': 'Role',
			'gear': 'Gear',
			'rates': 'Rates',
			'factor': 'Factor',
			'rpm': 'RPM',
			'rph': 'RPH',
			'rpd': 'RPD',
			'tpm': 'TPM',
			'tph': 'TPH',
			'tpd': 'TPD',
			'hardLimit': 'HardLimit',
			'childLimit': 'ChildLimit',
			'allowIPs': 'AllowIPs',
			'allowModels': 'AllowModels',
			'allowLevels': 'AllowLevels',
			'resources': 'Resources',
			'modelMapper': 'ModelMapper',
			'levelMapper': 'LevelMapper',
			'billingEmail': 'BillingEmail',
			'qrcode': 'QRCode'
		};

		const numericFields = ['CreditGranted', 'Level', 'Role', 'Gear', 'Rates', 'Factor', 'RPM', 'RPH', 'RPD', 'TPM', 'TPH', 'TPD', 'HardLimit', 'ChildLimit'];

		Object.entries(fieldMappings).forEach(([field, apiField]) => {
			const value = formData.get(field);
			if (value && value.trim() !== '') {
				data[apiField] = numericFields.includes(apiField)
					? Number(value)
					: value.trim();
			}
		});

		const status = formData.get('status');
		if (status) {
			data.Status = status === 'true';
		}

		return data;
	}

	async handleDelete(e) {
		e.preventDefault();
		const formData = new FormData(e.target);
		const name = formData.get('name').trim();

		if (!name) {
			this.showNotification('Please enter a sub-account identifier', 'error');
			return;
		}

		const confirmed = await this.showConfirmDialog(
			'Confirm Deletion',
			`Are you sure you want to delete the sub-account "${name}"? This action cannot be undone!`
		);

		if (confirmed) {
			await this.submitRequest(
				`${this.BASE_URL}/x-users/${name}`,
				'DELETE',
				null,
				e.target
			);
		}
	}

	async showConfirmDialog(title, message) {
		return confirm(`${title}\n\n${message}`);
	}

	async submitRequest(url, method, data, form) {
		const submitButton = form.querySelector('button[type="submit"]');
		const originalHTML = submitButton.innerHTML;

		this.setLoadingState(submitButton, true, 'Processing...');

		try {
			const options = {
				method,
				headers: {
					'Authorization': this.currentApiKey
				}
			};

			if (data) {
				options.headers['Content-Type'] = 'application/json';
				options.body = JSON.stringify(data);
			}

			const response = await fetch(url, options);

			if (!response.ok) {
				await this.handleErrorResponse(response);
				return;
			}

			const result = await response.json();
			this.showModal(result);
			form.reset();

			const nameInput = form.querySelector('input[name="name"]');
			if (nameInput && ['rechargeForm', 'viewForm', 'updateForm'].includes(form.id)) {
				nameInput.value = this.getCachedSubAccount();
			}

			this.showNotification('Operation successful', 'success');

			if (this.isRootUser && result.User?.SecretKey) {
				this.showNotification('🎉 Sub-account created successfully! Please copy and save the Secret Key.', 'success');
			}
		} catch (error) {
			this.showNotification(error.message || 'Operation failed', 'error');
		} finally {
			submitButton.innerHTML = originalHTML;
			submitButton.disabled = false;
		}
	}

	async handleErrorResponse(response) {
		if (response.status === 401) {
			this.showNotification('Session expired. Please log in again.', 'warning');
			this.handleLogout();
			return;
		}

		let errorMessage = `Request failed (${response.status})`;
		try {
			const errorData = await response.json();
			errorMessage = errorData.message || errorData.error || errorMessage;
		} catch (e) {
		}

		throw new Error(errorMessage);
	}

	setLoadingState(button, isLoading, text) {
		button.disabled = isLoading;

		if (isLoading) {
			button.innerHTML = `<svg class="btn-loading w-5 h-5 mr-2" width="20" height="20" viewBox="0 0 20 20"><circle class="spinner" cx="10" cy="10" r="8" fill="none" stroke-width="3"></circle></svg>${text}`;
		}
	}

	showModal(data) {
		const modal = document.getElementById('resultModal');
		const content = document.getElementById('resultContent');
		const secretKeyContainer = document.getElementById('secretKeyContainer');
		const secretKeyValue = document.getElementById('secretKeyValue');

		content.textContent = JSON.stringify(data, null, 2);

		if (this.isRootUser && data.User?.SecretKey) {
			secretKeyValue.textContent = data.User.SecretKey;
			secretKeyContainer.classList.remove('hidden');
		} else {
			secretKeyContainer.classList.add('hidden');
		}

		modal.classList.remove('hidden');
	}

	hideModal() {
		document.getElementById('resultModal').classList.add('hidden');
	}

	async copySecretKey() {
		const secretKey = document.getElementById('secretKeyValue').textContent;

		try {
			await navigator.clipboard.writeText(secretKey);
			this.showNotification('Secret Key copied to clipboard', 'success');
		} catch (error) {
			this.fallbackCopy(secretKey);
		}
	}

	fallbackCopy(text) {
		const textarea = document.createElement('textarea');
		textarea.value = text;
		textarea.style.position = 'fixed';
		textarea.style.opacity = '0';

		document.body.appendChild(textarea);
		textarea.select();

		try {
			document.execCommand('copy');
			this.showNotification('Copied to clipboard', 'success');
		} catch (error) {
			this.showNotification('Copy failed. Please copy manually.', 'error');
		}

		document.body.removeChild(textarea);
	}

	sanitizeName(name) {
		if (this.isValidEmail(name)) {
			name = name.split('@')[0];
		}

		name = name.replace(/[^\w\u4e00-\u9fa5]/g, '');

		if (name.length < 2 || /^\d+$/.test(name)) {
			name += Math.random().toString(36).substring(2, 6);
		}

		return name;
	}

	isValidEmail(email) {
		return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
	}

	showNotification(message, type = 'info') {
		const container = document.getElementById('notificationContainer');
		const notification = document.createElement('div');

		notification.className = `notification notification-${type}`;
		notification.innerHTML = `
			<div class="notification-content">
			${this.getNotificationIcon(type)}
			<span>${message}</span>
			</div>
			`;

		container.appendChild(notification);

		requestAnimationFrame(() => {
			notification.classList.add('show');
		});

		setTimeout(() => {
			notification.classList.remove('show');
			setTimeout(() => notification.remove(), 300);
		}, 1500);
	}

	getNotificationIcon(type) {
		const icons = {
			success: '<svg class="notification-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>',
			error: '<svg class="notification-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>',
			warning: '<svg class="notification-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>',
			info: '<svg class="notification-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>'
		};
		return icons[type] || icons.info;
	}

	generateApiExample(tabName, language = 'curl') {
		if (!this.currentApiKey) return '';

		const examples = {
			create: {
				curl: `curl -X POST '${this.BASE_URL}/x-users' \\
  -H 'Authorization: Bearer ${this.currentApiKey}' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "Name": "alice123",
    "Email": "alice@example.com",
    "CreditGranted": 10.0
  }'`,
				python: `import requests

url = "${this.BASE_URL}/x-users"
headers = {
    "Authorization": "Bearer ${this.currentApiKey}",
    "Content-Type": "application/json"
}
data = {
    "Name": "alice123",
    "Email": "alice@example.com",
    "CreditGranted": 10.0
}

response = requests.post(url, json=data, headers=headers)
print(response.json())`,
				javascript: `const response = await fetch('${this.BASE_URL}/x-users', {
    method: 'POST',
    headers: {
        'Authorization': 'Bearer ${this.currentApiKey}',
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        Name: 'alice123',
        Email: 'alice@example.com',
        CreditGranted: 10.0
    })
});

const result = await response.json();
console.log(result);`
			},
			recharge: {
				curl: `curl -X PUT '${this.BASE_URL}/x-users/{username}' \\
  -H 'Authorization: Bearer ${this.currentApiKey}' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "CreditGranted": 20.0
  }'`,
				python: `import requests

url = "${this.BASE_URL}/x-users/{username}"
headers = {
    "Authorization": "Bearer ${this.currentApiKey}",
    "Content-Type": "application/json"
}
data = {
    "CreditGranted": 20.0  # Positive to add credit, negative to deduct
}

response = requests.put(url, json=data, headers=headers)
print(response.json())`,
				javascript: `const response = await fetch('${this.BASE_URL}/x-users/{username}', {
    method: 'PUT',
    headers: {
        'Authorization': 'Bearer ${this.currentApiKey}',
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        CreditGranted: 20.0  // Positive to add credit, negative to deduct
    })
});

const result = await response.json();
console.log(result);`
			},
			view: {
				curl: `# View a specific sub-account
curl -X GET '${this.BASE_URL}/x-dna/{username}' \\
  -H 'Authorization: Bearer ${this.currentApiKey}'

# View all sub-accounts
curl -X GET '${this.BASE_URL}/x-dna' \\
  -H 'Authorization: Bearer ${this.currentApiKey}'`,
				python: `import requests

# View a specific sub-account
url = "${this.BASE_URL}/x-dna/{username}"
headers = {"Authorization": "Bearer ${this.currentApiKey}"}
response = requests.get(url, headers=headers)
print(response.json())

# View all sub-accounts
url = "${this.BASE_URL}/x-dna"
response = requests.get(url, headers=headers)
print(response.json())`,
				javascript: `// View a specific sub-account
let response = await fetch('${this.BASE_URL}/x-dna/{username}', {
    headers: {
        'Authorization': '${this.currentApiKey}'
    }
});
console.log(await response.json());

// View all sub-accounts
response = await fetch('${this.BASE_URL}/x-dna', {
    headers: {
        'Authorization': '${this.currentApiKey}'
    }
});
console.log(await response.json());`
			},
			update: {
				curl: `curl -X PUT '${this.BASE_URL}/x-users/{username}' \\
  -H 'Authorization: Bearer ${this.currentApiKey}' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "RPM": 1000,
    "TPD": 5000000,
    "HardLimit": 100
  }'`,
				python: `import requests

url = "${this.BASE_URL}/x-users/{username}"
headers = {
    "Authorization": "Bearer ${this.currentApiKey}",
    "Content-Type": "application/json"
}
data = {
    "RPM": 1000,
    "TPD": 5000000,
    "HardLimit": 100
}

response = requests.put(url, json=data, headers=headers)
print(response.json())`,
				javascript: `const response = await fetch('${this.BASE_URL}/x-users/{username}', {
    method: 'PUT',
    headers: {
        'Authorization': 'Bearer ${this.currentApiKey}',
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        RPM: 1000,
        TPD: 5000000,
        HardLimit: 100
    })
});

const result = await response.json();
console.log(result);`
			},
			delete: {
				curl: `curl -X DELETE '${this.BASE_URL}/x-users/{username}' \\
  -H 'Authorization: Bearer ${this.currentApiKey}'`,
				python: `import requests

url = "${this.BASE_URL}/x-users/{username}"
headers = {"Authorization": "${this.currentApiKey}"}

response = requests.delete(url, headers=headers)
print(response.json())`,
				javascript: `const response = await fetch('${this.BASE_URL}/x-users/{username}', {
    method: 'DELETE',
    headers: {
        'Authorization': 'Bearer ${this.currentApiKey}'
    }
});

const result = await response.json();
console.log(result);`
			}
		};

		return examples[tabName]?.[language] || '';
	}

	updateApiExample(tabName) {
		const codeElement = document.getElementById(`${tabName}-curl-code`);
		if (codeElement) {
			codeElement.textContent = this.generateApiExample(tabName, 'curl');
		}

		const pythonElement = document.getElementById(`${tabName}-python-code`);
		if (pythonElement) {
			pythonElement.textContent = this.generateApiExample(tabName, 'python');
		}

		const jsElement = document.getElementById(`${tabName}-javascript-code`);
		if (jsElement) {
			jsElement.textContent = this.generateApiExample(tabName, 'javascript');
		}
	}

	updateAllApiExamples() {
		['create', 'recharge', 'view', 'update', 'delete'].forEach(tabName => {
			this.updateApiExample(tabName);
		});
	}
}

document.addEventListener('DOMContentLoaded', () => {
	window.xaiManager = new XAIManager();
});
