<!DOCTYPE html>
<html lang="hi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Fatehpur Hubs - Secure Login</title>
    <!-- 1. CSS File Link -->
    <link rel="stylesheet" href="login.css">
    
    <!-- 2. Firebase SDK Imports -->
    <!-- Modular SDK (Recommended) -->
    <script src="https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.6.1/firebase-auth-compat.js"></script>
    
    <!-- 3. Main JavaScript File Link -->
    <script src="login.js"></script>
</head>
<body class="bg-gray-50 flex items-center justify-center min-h-screen">

    <div id="app-container" class="login-container">
        
        <div class="header-section">
            <span class="icon-zap"></span>
            <h1>Fatehpur Hubs</h1>
            <p>मोबाइल नंबर द्वारा सुरक्षित लॉगिन</p>
        </div>

        <!-- Phone Number Input Phase -->
        <div id="mobile-phase" class="form-phase">
            <input type="tel" id="mobile-input" placeholder="10 अंकों का मोबाइल नंबर" maxlength="10" />
            <button id="send-otp-button" class="primary-button">
                OTP भेजें
            </button>
            <p id="message-area" class="message error-message"></p>
        </div>

        <!-- OTP Input Phase (Initially Hidden) -->
        <div id="otp-phase" class="form-phase hidden">
            <input type="text" id="otp-input" placeholder="6-अंकों का OTP" maxlength="6" />
            <button id="verify-otp-button" class="success-button">
                OTP Verify करें
            </button>
             <button onclick="resetLogin()" class="reset-button">
                गलत नंबर? वापस जाएं
            </button>
            <p id="otp-message-area" class="message error-message"></p>
        </div>
        
        <!-- Recaptcha Container is MANDATORY for Web Phone Auth -->
        <div id="recaptcha-container"></div>
        
        <div id="success-screen" class="hidden success-box">
            <p>✅ लॉगिन सफल! अब आप ऐप में प्रवेश कर सकते हैं।</p>
            <a href="index.html" class="primary-button mt-4">ऐप खोलें</a>
        </div>

    </div>
</body>
</html>