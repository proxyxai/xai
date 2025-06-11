class XAIManager {
    constructor() {
        this.currentApiKey = null;
        this.currentUser = null;
        this.queriedApiKeys = [];
        this.authCacheKey = 'xai-auth-cache';
        this.subAccountCacheKey = 'xai-sub-account-cache';
        this.authCacheDuration = 7 * 24 * 60 * 60 * 1000; // 7天
        this.initializeApp();
    }

    initializeApp() {
        this.setupDomain();
        this.bindEvents();
        this.checkAuthentication();
    }

    setupDomain() {
        this.currentDomain = window.location.hostname;
        const domainParts = this.currentDomain.split('.');
        this.mainDomain = domainParts.slice(-2).join('.');
        this.BASE_URL = `https://api.${this.mainDomain}`;
    }

    bindEvents() {
        this.bindLoginEvents();
        this.bindTabEvents();
        this.bindFormEvents();
        this.bindModalEvents();
        this.bindApiKeyInputEvents();
        this.bindSubAccountInputEvents();
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
        // 为子账户标识输入框绑定事件
        const subAccountInputs = ['rechargeForm', 'viewForm', 'updateForm'].map(id =>
            document.querySelector(`#${id} input[name="name"]`)
        ).filter(Boolean);

        subAccountInputs.forEach(input => {
            // 加载缓存的子账户标识
            const cachedSubAccount = this.getCachedSubAccount();
            if (cachedSubAccount) {
                input.value = cachedSubAccount;
            }

            // 保存输入的子账户标识
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

    // 获取缓存的认证信息
    getAuthCache() {
        try {
            const cached = localStorage.getItem(this.authCacheKey);
            if (!cached) return null;

            const data = JSON.parse(cached);
            const now = Date.now();

            // 检查缓存是否过期
            if (now - data.timestamp > this.authCacheDuration) {
                localStorage.removeItem(this.authCacheKey);
                return null;
            }

            return data;
        } catch (error) {
            return null;
        }
    }

    // 设置认证缓存
    setAuthCache(apiKey, userData) {
        const cacheData = {
            apiKey,
            userData,
            timestamp: Date.now()
        };
        localStorage.setItem(this.authCacheKey, JSON.stringify(cacheData));
    }

    async checkAuthentication() {
        // 先尝试使用缓存快速登录
        const authCache = this.getAuthCache();
        if (authCache) {
            this.currentApiKey = authCache.apiKey;
            this.currentUser = authCache.userData;
            this.isRootUser = authCache.userData.name === 'root';

            // 立即显示主界面
            this.showMainApp();
            this.loadSavedApiKeys();

            // 后台静默更新用户信息
            this.silentUpdateUserInfo(authCache.apiKey);

            // 延迟执行自动查询
            setTimeout(() => this.autoQueryOnLoad(), 300);
            return;
        }

        // 如果没有缓存，尝试旧的认证方式
        const savedKey = localStorage.getItem('xai-parent-api-key');
        const savedUser = localStorage.getItem('xai-user-info');

        if (savedKey && savedUser) {
            try {
                const isValid = await this.verifyApiKey(savedKey);
                if (isValid) {
                    this.currentApiKey = savedKey;
                    this.currentUser = JSON.parse(savedUser);

                    // 设置新的缓存
                    this.setAuthCache(savedKey, this.currentUser);

                    this.showMainApp();
                    this.loadSavedApiKeys();
                    this.autoQueryOnLoad();
                    return;
                }
            } catch (error) {
                console.error('验证失败:', error);
            }
        }

        this.clearAuthentication();
        this.showLoginPage();
    }

    // 后台静默更新用户信息
    async silentUpdateUserInfo(apiKey) {
        try {
            const response = await fetch(`${this.BASE_URL}/dashboard/x-user-info`, {
                headers: { 'Authorization': `Bearer ${apiKey}` }
            });

            if (response.ok) {
                const userData = await response.json();
                if (userData.name) {
                    this.currentUser = userData;
                    this.isRootUser = userData.name === 'root';

                    // 更新缓存
                    this.setAuthCache(apiKey, userData);

                    // 更新显示
                    this.updateUserInfo();
                }
            }
        } catch (error) {
            console.error('静默更新用户信息失败:', error);
        }
    }

    autoQueryOnLoad() {
        const queryTab = document.getElementById('queryTab');
        if (!queryTab.classList.contains('hidden')) {
            const apiKeyInput = document.getElementById('api-key-input');
            if (!apiKeyInput.value.trim()) {
                apiKeyInput.value = this.currentApiKey;
            }
            setTimeout(() => this.sendBillingRequest(), 300);
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
            const response = await fetch(`${this.BASE_URL}/dashboard/x-user-info`, {
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
            console.error('API验证错误:', error);
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
            this.showNotification('API Key 格式不正确', 'error');
            return;
        }

        const originalHTML = submitButton.innerHTML;
        this.setLoadingState(submitButton, true, '验证中...');

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
                throw new Error('API Key 无效或已过期');
            }
        } catch (error) {
            this.showNotification(error.message || '登录失败', 'error');
        } finally {
            submitButton.innerHTML = originalHTML;
            submitButton.disabled = false;
        }
    }

    handleLogout() {
        this.clearAuthentication();
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
    }

    updateUserInfo() {
        const userInfoElement = document.getElementById('userInfo');
        if (this.currentUser) {
            const balance = this.formatBalance(this.currentUser.balance);
            userInfoElement.innerHTML = `
                <div class="user-info-card">
                    <div class="user-name">${this.currentUser.name}</div>
                    <div class="user-balance">余额: ${balance}</div>
                </div>
            `;
        }
    }

    formatNumber(num, type = 'currency') {
        if (typeof num !== 'number') return type === 'currency' ? '\$0.00' : '0';

        if (Math.abs(num) >= 100000000) {
            return (type === 'currency' ? '$' : '') + num.toExponential(2);
        }

        if (type === 'currency') {
            return '$' + num.toFixed(2);
        } else if (type === 'limit') {
            return Math.round(num).toLocaleString();
        }
        return num.toFixed(2);
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

        // 恢复缓存的子账户标识
        if (['recharge', 'view', 'update'].includes(tabName)) {
            const input = document.querySelector(`#${tabName}Form input[name="name"]`);
            if (input && !input.value) {
                input.value = this.getCachedSubAccount();
            }
        }

        if (tabName === 'query') {
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

        this.setLoadingState(queryButton, true, '查询中...');

        const apiKeyInput = document.getElementById("api-key-input");
        const resultsDiv = document.getElementById("query-results");
        const table = document.getElementById("result-table");

        table.getElementsByTagName('tbody')[0].innerHTML = "";

        const apiKeys = apiKeyInput.value.match(/sk-Xvs\w+/g);
        if (!apiKeys || apiKeys.length === 0) {
            this.showNotification('请输入有效的 API Key', 'warning');
            queryButton.innerHTML = originalHTML;
            queryButton.disabled = false;
            return;
        }

        const uniqueApiKeys = [...new Set(apiKeys)];
        resultsDiv.classList.remove('hidden');

        const resultsCount = document.getElementById('results-count');
        resultsCount.textContent = `共 ${uniqueApiKeys.length} 个账户`;

        const tableBody = document.querySelector("#result-table tbody");

        try {
            const results = await Promise.all(uniqueApiKeys.map(apiKey => this.checkBilling(apiKey)));

            tableBody.appendChild(this.createBillingTableHeader());
            results.forEach((data, i) => {
                const apiKey = uniqueApiKeys[i].trim();
                const row = this.createBillingRow(apiKey, data);
                tableBody.appendChild(row);
            });

            this.showNotification(`查询完成，共 ${uniqueApiKeys.length} 个账户`, 'success');
        } catch (error) {
            this.showNotification('查询失败', 'error');
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
            const response = await fetch(`${this.BASE_URL}/dashboard/x-user-info`, { headers });
            if (!response.ok) {
                return ["Error", null, null, null, null, null];
            }

            const user = await response.json();
            const createAt = new Date(user.create_at).toLocaleString();
            const name = `${user.id} ${user.level} ${user.child}<br>${user.name}<br>${user.email}<br>${createAt}`;

            let creditBalance = [];
            if (user.credit_balance && Array.isArray(user.credit_balance)) {
                creditBalance = user.credit_balance.map(credit => ({
                    amount: this.formatNumber(credit.amount),
                    balance: this.formatNumber(credit.balance),
                    expiresAt: new Date(credit.expires_at).toLocaleDateString()
                }));
            }

            const creditUsed = `${this.formatNumber(user.credit_used)}<br><span class='balance-value'>${this.formatNumber(user.balance)}</span>`;
            const usageRatio = user.monthly_usage.CreditUsed > 0
                ? (user.daily_usage.CreditUsed / user.monthly_usage.CreditUsed * 100).toFixed(2)
                : '0.00';
            const usage = `${this.formatNumber(user.daily_usage.CreditUsed)}<br>${this.formatNumber(user.monthly_usage.CreditUsed)}<br><span class="usage-ratio">(${usageRatio}%)</span>`;

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
            { en: "账户信息", cn: "ID / 等级 / 子账户数 / 用户名 / 邮箱 / 创建时间" },
            { en: "充值卡", cn: "卡额 / 余额 / 到期时间" },
            { en: "已用 / 余额", cn: "总消费 / 总余额" },
            { en: "使用量", cn: "今日 / 本月 (占比)" },
            { en: "请求数", cn: "今日 / 本月 (占比)" },
            { en: "速率限制", cn: "RPM / TPD" }
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
            errorCell.textContent = "账户不可用或已被暂停";
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
            emptyDiv.textContent = "无充值卡";
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
            this.showNotification('已复制到剪贴板', 'success');
        } catch (error) {
            this.fallbackCopy(text);
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
            this.showNotification('请输入子账户标识', 'error');
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

        const numericFields = ['CreditGranted', 'Level', 'Gear', 'Rates', 'Factor', 'RPM', 'RPH', 'RPD', 'TPM', 'TPH', 'TPD', 'HardLimit', 'ChildLimit'];

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
            this.showNotification('请输入子账户标识', 'error');
            return;
        }

        const confirmed = await this.showConfirmDialog(
            '确认删除',
            `确定要删除子账户 "${name}" 吗？此操作不可撤销！`
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

        this.setLoadingState(submitButton, true, '处理中...');

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

            // 恢复缓存的子账户标识（针对充值、查看、更新表单）
            const nameInput = form.querySelector('input[name="name"]');
            if (nameInput && ['rechargeForm', 'viewForm', 'updateForm'].includes(form.id)) {
                nameInput.value = this.getCachedSubAccount();
            }

            this.showNotification('操作成功', 'success');

            if (this.isRootUser && result.User?.SecretKey) {
                this.showNotification('🎉 子账户创建成功！请复制并保存 Secret Key', 'success');
            }
        } catch (error) {
            this.showNotification(error.message || '操作失败', 'error');
        } finally {
            submitButton.innerHTML = originalHTML;
            submitButton.disabled = false;
        }
    }

    async handleErrorResponse(response) {
        if (response.status === 401) {
            this.showNotification('登录已过期，请重新登录', 'warning');
            this.handleLogout();
            return;
        }

        let errorMessage = `请求失败 (${response.status})`;
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
            this.showNotification('Secret Key 已复制到剪贴板', 'success');
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
            this.showNotification('已复制到剪贴板', 'success');
        } catch (error) {
            this.showNotification('复制失败，请手动复制', 'error');
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
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    window.xaiManager = new XAIManager();
});
