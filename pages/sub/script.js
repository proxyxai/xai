class XAIManager {
    constructor() {
        this.currentApiKey = null;
        this.currentUser = null;
        this.queriedApiKeys = [];
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
        // 登录事件
        this.bindLoginEvents();

        // 选项卡切换
        this.bindTabEvents();

        // 表单提交
        this.bindFormEvents();

        // 弹窗事件
        this.bindModalEvents();

        // API Key 输入框事件
        this.bindApiKeyInputEvents();
    }

    bindApiKeyInputEvents() {
        const apiKeyInput = document.getElementById('api-key-input');
        if (apiKeyInput) {
            apiKeyInput.addEventListener('input', function() {
                let rawInput = this.value;
                let apiKeys = rawInput.match(/sk-Xvs\w+/g);
                if (apiKeys) {
                    let uniqueApiKeys = [...new Set(apiKeys)];
                    localStorage.setItem('xai-query-keys', uniqueApiKeys.join(','));
                }
            });
        }
    }

    bindLoginEvents() {
        const loginForm = document.getElementById('loginForm');
        const logoutButton = document.getElementById('logoutButton');

        loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        logoutButton.addEventListener('click', () => this.handleLogout());
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

        // 点击背景关闭弹窗
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.hideModal();
            }
        });
    }

    async checkAuthentication() {
        const savedKey = localStorage.getItem('xai-parent-api-key');
        const savedUser = localStorage.getItem('xai-user-info');

        if (savedKey && savedUser) {
            try {
                const isValid = await this.verifyApiKey(savedKey);
                if (isValid) {
                    this.currentApiKey = savedKey;
                    this.currentUser = JSON.parse(savedUser);
                    this.showMainApp();
                    this.loadSavedApiKeys();
                    return;
                }
            } catch (error) {
                console.error('验证失败:', error);
            }
        }

        this.clearAuthentication();
        this.showLoginPage();
    }

    loadSavedApiKeys() {
        const savedKeys = localStorage.getItem('xai-query-keys');
        if (savedKeys) {
            const apiKeyInput = document.getElementById('api-key-input');
            if (apiKeyInput) {
                apiKeyInput.value = savedKeys.replace(/,/g, '\n');
            }
        }
    }

    async verifyApiKey(apiKey) {
        const response = await fetch(`${this.BASE_URL}/dashboard/x-user-info`, {
            headers: { 'Authorization': `Bearer ${apiKey}` }
        });

        if (response.ok) {
            const userData = await response.json();
            if (userData.name) {
                this.currentUser = userData;
                return true;
            }
        }
        return false;
    }

    clearAuthentication() {
        localStorage.removeItem('xai-parent-api-key');
        localStorage.removeItem('xai-user-info');
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

        this.setLoadingState(submitButton, true, '验证中...');

        try {
            const isValid = await this.verifyApiKey(apiKey);
            if (isValid) {
                this.currentApiKey = apiKey;
                localStorage.setItem('xai-parent-api-key', apiKey);
                localStorage.setItem('xai-user-info', JSON.stringify(this.currentUser));

                this.showMainApp();
                this.showNotification(`欢迎回来，${this.currentUser.name}！`, 'success');
            } else {
                throw new Error('API Key 无效或已过期');
            }
        } catch (error) {
            this.showNotification(error.message || '登录失败', 'error');
        } finally {
            this.setLoadingState(submitButton, false, '登录系统');
        }
    }

    handleLogout() {
        this.clearAuthentication();
        this.showLoginPage();
        this.showNotification('已安全退出系统', 'info');
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
                <div class="user-name">${this.currentUser.name}</div>
                <div class="user-balance">余额: ${balance}</div>
            `;
        }
    }

    formatBalance(balance) {
        if (typeof balance !== 'number') return '\$0.00';

        if (Math.abs(balance) >= 100000000) {
            return '$' + balance.toExponential(2);
        }
        return '$' + balance.toFixed(2);
    }

    formatNumber(num) {
        if (Math.abs(num) >= 100000000) {
            return num.toExponential(2);
        }
        return num.toFixed(2);
    }

    formatLimit(num) {
        if (Math.abs(num) >= 100000000) {
            return num.toExponential(2);
        }
        return Math.round(num).toLocaleString();
    }

    switchTab(tabName) {
        // 更新选项卡状态
        document.querySelectorAll('.tab-button').forEach(button => {
            button.classList.toggle('active', button.dataset.tab === tabName);
        });

        // 切换内容
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.add('hidden');
        });
        document.getElementById(`${tabName}Tab`).classList.remove('hidden');
    }

    validateApiKey(key) {
        return key && key.length > 10 && (key.startsWith('sk-') || key.startsWith('xai-'));
    }

    // 账户查询相关方法
    async sendBillingRequest() {
        const queryButton = document.getElementById("query-button");
        queryButton.textContent = "查询中...";
        queryButton.disabled = true;

        let apiKeyInput = document.getElementById("api-key-input");
        let resultsDiv = document.getElementById("query-results");
        let table = document.getElementById("result-table");

        // 清空表格
        table.getElementsByTagName('tbody')[0].innerHTML = "";

        let apiKeys = apiKeyInput.value.match(/sk-Xvs\w+/g);
        if (!apiKeys || apiKeys.length === 0) {
            this.showNotification('请输入有效的 API Key', 'warning');
            queryButton.textContent = "查询额度";
            queryButton.disabled = false;
            return;
        }

        let uniqueApiKeys = [...new Set(apiKeys)];
        resultsDiv.classList.remove('hidden');

        let tableBody = document.querySelector("#result-table tbody");
        let promises = uniqueApiKeys.map(apiKey => this.checkBilling(apiKey));

        Promise.all(promises).then(results => {
            tableBody.appendChild(this.createBillingTableHeader());
            results.forEach((data, i) => {
                let apiKey = uniqueApiKeys[i].trim();
                let row = this.createBillingRow(apiKey, data);
                tableBody.appendChild(row);
            });

            queryButton.textContent = "查询额度";
            queryButton.disabled = false;
        }).catch(error => {
            this.showNotification('查询失败', 'error');
            console.error(error);
            queryButton.textContent = "查询额度";
            queryButton.disabled = false;
        });
    }

    async checkBilling(apiKey) {
        const headers = {
            "Authorization": "Bearer " + apiKey,
            "Content-Type": "application/json"
        };
        const urlUserInfo = `${this.BASE_URL}/dashboard/x-user-info`;

        try {
            let response = await fetch(urlUserInfo, { headers });
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

            const creditUsed = `$${this.formatNumber(user.credit_used)}<br><span class='balance-value'>$${this.formatNumber(user.balance)}</span>`;
            const usageRatio = user.monthly_usage.CreditUsed > 0
                ? (user.daily_usage.CreditUsed / user.monthly_usage.CreditUsed * 100).toFixed(2)
                : '0.00';
            const usage = `$${this.formatNumber(user.daily_usage.CreditUsed)}<br>$${this.formatNumber(user.monthly_usage.CreditUsed)}<br><span class="usage-ratio">(${usageRatio}%)</span>`;

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
        let headerRow = document.createElement("tr");
        headerRow.className = "table-header";
        let headers = [
            { en: "API Key", cn: "" },
            { en: "账户信息", cn: "ID / 等级 / 子账户数 / 用户名 / 邮箱 / 创建时间" },
            { en: "充值卡", cn: "金额 / 余额 / 到期时间" },
            { en: "已用 / 余额", cn: "总消费 / 总余额" },
            { en: "使用量", cn: "今日 / 本月 (占比)" },
            { en: "请求数", cn: "今日 / 本月 (占比)" },
            { en: "速率限制", cn: "RPM / TPD" }
        ];
        headers.forEach(header => {
            let th = document.createElement("th");
            th.innerHTML = `<div class="th-content">${header.en}</div>${header.cn ? `<div class="th-subtitle">${header.cn}</div>` : ''}`;
            headerRow.appendChild(th);
        });
        return headerRow;
    }

    createBillingRow(apiKey, data) {
        let row = document.createElement("tr");
        row.className = "table-row";

        // API Key 列
        let apiKeyCell = document.createElement("td");
        apiKeyCell.className = "api-key-cell";
        apiKeyCell.textContent = apiKey.slice(0, 8) + '***' + apiKey.slice(-4);
        row.appendChild(apiKeyCell);

        if (data[0] === "Error") {
            let errorCell = document.createElement("td");
            errorCell.colSpan = "6";
            errorCell.className = "error-cell";
            errorCell.textContent = "账户不可用或已被暂停";
            row.appendChild(errorCell);
        } else {
            // 账户信息
            let nameCell = document.createElement("td");
            nameCell.innerHTML = data[0];
            row.appendChild(nameCell);

            // 充值卡信息
            let creditBalanceCell = document.createElement("td");
            creditBalanceCell.appendChild(this.createCreditTable(data[1]));
            row.appendChild(creditBalanceCell);

            // 其他信息
            for (let i = 2; i < data.length; i++) {
                let cell = document.createElement("td");
                cell.innerHTML = data[i];
                row.appendChild(cell);
            }
        }

        return row;
    }

    createCreditTable(creditData) {
        if (!creditData || creditData.length === 0) {
            let emptyDiv = document.createElement("div");
            emptyDiv.className = "empty-credit";
            emptyDiv.textContent = "无充值卡";
            return emptyDiv;
        }

        let table = document.createElement("table");
        table.className = "credit-table";
        creditData.forEach(item => {
            let row = document.createElement("tr");
            Object.entries(item).forEach(([key, value]) => {
                let cell = document.createElement("td");
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

    // 子账户管理相关方法
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
            'rpm': 'Rpm',
            'rph': 'Rph',
            'rpd': 'Rpd',
            'tpm': 'Tpm',
            'tph': 'Tph',
            'tpd': 'Tpd',
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

        const numericFields = ['CreditGranted', 'Level', 'Gear', 'Rates', 'Factor',
                              'Rpm', 'Rph', 'Rpd', 'Tpm', 'Tph', 'Tpd',
                              'HardLimit', 'ChildLimit'];

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
        const originalText = submitButton.textContent;

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
            this.showNotification('操作成功', 'success');
        } catch (error) {
            this.showNotification(error.message || '操作失败', 'error');
        } finally {
            this.setLoadingState(submitButton, false, originalText);
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
            // 忽略JSON解析错误
        }

        throw new Error(errorMessage);
    }

    setLoadingState(button, isLoading, text) {
        button.disabled = isLoading;
        const textSpan = button.querySelector('.btn-text');
        const loadingSpinner = button.querySelector('.btn-loading');

        if (textSpan) {
            textSpan.textContent = text;
        } else {
            button.textContent = text;
        }

        if (loadingSpinner) {
            loadingSpinner.classList.toggle('hidden', !isLoading);
        }
    }

    showModal(data) {
        const modal = document.getElementById('resultModal');
        const content = document.getElementById('resultContent');
        const secretKeyContainer = document.getElementById('secretKeyContainer');
        const secretKeyValue = document.getElementById('secretKeyValue');

        content.textContent = JSON.stringify(data, null, 2);

        if (data.User?.SecretKey) {
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
            this.showNotification('Secret Key 已复制到剪贴板', 'success');
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

        // 动画效果
        requestAnimationFrame(() => {
            notification.classList.add('show');
        });

        // 自动移除
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
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
