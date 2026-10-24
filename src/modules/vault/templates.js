/**
 * Password-vault account templates.
 *
 * Each template has:
 *   label, category, icon, optional logo/color, fields
 *
 * Keep field keys stable when changing templates if saved vault records use them.
 * Templates are defaults for new records; they do not imply every provider uses
 * a username/password login. Many services use SSO, passkeys, OTP, or organization
 * managed authentication.
 */

export const CATEGORIES = {
  email:        { label: "Email & Communication", color: "#3b82f6", icon: "Mail" },
  identity:     { label: "Identity & Devices", color: "#64748b", icon: "Fingerprint" },
  social:       { label: "Social Media", color: "#ec4899", icon: "Users" },
  banking:      { label: "Banking & Finance", color: "#10b981", icon: "Landmark" },
  cards:        { label: "Cards", color: "#8b5cf6", icon: "CreditCard" },
  cloud:        { label: "Cloud & Hosting", color: "#06b6d4", icon: "Cloud" },
  dev:          { label: "Developer Tools", color: "#22c55e", icon: "Code" },
  ai:           { label: "AI Tools", color: "#8b5cf6", icon: "Bot" },
  streaming:    { label: "Entertainment & Gaming", color: "#ef4444", icon: "Play" },
  shopping:     { label: "Shopping & Food", color: "#f59e0b", icon: "ShoppingBag" },
  travel:       { label: "Travel & Transport", color: "#f97316", icon: "Plane" },
  gov:          { label: "Government & Identity", color: "#64748b", icon: "Landmark" },
  education:    { label: "Education & Exams", color: "#0d9488", icon: "GraduationCap" },
  jobs:         { label: "Jobs & Careers", color: "#2563eb", icon: "BriefcaseBusiness" },
  productivity: { label: "Productivity & Design", color: "#7c3aed", icon: "Workflow" },
  utilities:    { label: "Telecom & Utilities", color: "#0891b2", icon: "Plug" },
  healthcare:   { label: "Healthcare", color: "#e11d48", icon: "HeartPulse" },
  business:     { label: "Business & Freelancing", color: "#475569", icon: "Building2" },
  personal:     { label: "Personal & Other", color: "#78716c", icon: "UserRound" },
  custom:       { label: "Custom", color: "#64748b", icon: "FileKey" },
};

const PASSWORD_FIELD = { key: "password", label: "Password", type: "password", sensitive: true };

const EMAIL_FIELD = { key: "email", label: "Email / Login email", type: "email"};

const USERNAME_FIELD = { key: "username", label: "Username / User ID", type: "text" };

const PHONE_FIELD = { key: "phone", label: "Registered phone", type: "text" };

const LOGIN_URL_FIELD = { key: "login_url", label: "Login URL", type: "url" };

const TOTP_FIELD = { key: "totp", label: "Authenticator / TOTP secret", type: "totp", sensitive: true };

const RECOVERY_EMAIL = { key: "recovery_email", label: "Recovery email", type: "email" };

const RECOVERY_CODES = { key: "recovery_codes", label: "Recovery codes", type: "textarea", sensitive: true };

const NOTES_FIELD = { key: "notes", label: "Notes", type: "textarea" };

const AUTH_METHOD = { key: "sign_in_method", label: "Sign-in method", type: "text", placeholder: "Password / Google SSO / Apple SSO / passkey / OTP" };

const TWO_FACTOR = {
  key: "two_factor_enabled",
  label: "Two-factor authentication enabled?",
  type: "text", placeholder: "Yes / No / Unknown",
};

const baseFields = {
  email: [
    EMAIL_FIELD,
    PASSWORD_FIELD,
    RECOVERY_EMAIL,
    PHONE_FIELD,
    TOTP_FIELD,
    RECOVERY_CODES,
    AUTH_METHOD,
    LOGIN_URL_FIELD,
    NOTES_FIELD,
  ],

  identity: [
    EMAIL_FIELD,
    PASSWORD_FIELD,
    PHONE_FIELD,
    RECOVERY_EMAIL,
    RECOVERY_CODES,
    AUTH_METHOD,
    LOGIN_URL_FIELD,
    NOTES_FIELD,
  ],

  social: [
    USERNAME_FIELD,
    EMAIL_FIELD,
    PASSWORD_FIELD,
    PHONE_FIELD,
    TOTP_FIELD,
    RECOVERY_CODES,
    AUTH_METHOD,
    LOGIN_URL_FIELD,
    NOTES_FIELD,
  ],

  banking: [
    {
      key: "customer_id",
      label: "Customer ID / CIF",
      type: "text",
      sensitive: true,
    },
    USERNAME_FIELD,
    EMAIL_FIELD,
    PASSWORD_FIELD,
    PHONE_FIELD,
    {
      key: "account_reference",
      label: "Account reference (optional)",
      type: "text",
      sensitive: true,
    },
    TOTP_FIELD,
    RECOVERY_EMAIL,
    LOGIN_URL_FIELD,
    NOTES_FIELD,
  ],

  cards: [
    {
      key: "card_name",
      label: "Card name",
      type: "text",
    },
    {
      key: "card_type",
      label: "Type",
      type: "text",
      placeholder: "Credit / debit / prepaid",
    },
    {
      key: "last4",
      label: "Last 4 digits only (recommended)",
      type: "text",
      sensitive: true,
    },
    {
      key: "expiry",
      label: "Expiry (MM/YY)",
      type: "text",
    },
    NOTES_FIELD,
  ],

  cloud: [
    EMAIL_FIELD,
    USERNAME_FIELD,
    PASSWORD_FIELD,
    {
      key: "account_id",
      label: "Account / tenant ID",
      type: "text",
      sensitive: true,
    },
    TOTP_FIELD,
    RECOVERY_CODES,
    AUTH_METHOD,
    LOGIN_URL_FIELD,
    NOTES_FIELD,
  ],

  dev: [
    USERNAME_FIELD,
    EMAIL_FIELD,
    PASSWORD_FIELD,
    {
      key: "organization",
      label: "Organization / workspace",
      type: "text",
    },
    {
      key: "api_token",
      label: "API token / access token",
      type: "password",
      sensitive: true,
    },
    TOTP_FIELD,
    RECOVERY_CODES,
    AUTH_METHOD,
    LOGIN_URL_FIELD,
    NOTES_FIELD,
  ],

  ai: [
    EMAIL_FIELD,
    USERNAME_FIELD,
    PASSWORD_FIELD,
    {
      key: "api_key",
      label: "API key",
      type: "password",
      sensitive: true,
    },
    {
      key: "organization",
      label: "Organization / workspace",
      type: "text",
    },
    AUTH_METHOD,
    LOGIN_URL_FIELD,
    NOTES_FIELD,
  ],

  streaming: [
    EMAIL_FIELD,
    USERNAME_FIELD,
    PASSWORD_FIELD,
    PHONE_FIELD,
    {
      key: "profile_name",
      label: "Profile / account name",
      type: "text",
    },
    AUTH_METHOD,
    LOGIN_URL_FIELD,
    NOTES_FIELD,
  ],

  shopping: [
    EMAIL_FIELD,
    PHONE_FIELD,
    PASSWORD_FIELD,
    USERNAME_FIELD,
    {
      key: "membership_id",
      label: "Membership / loyalty ID",
      type: "text",
    },
    AUTH_METHOD,
    LOGIN_URL_FIELD,
    NOTES_FIELD,
  ],

  travel: [
    USERNAME_FIELD,
    EMAIL_FIELD,
    PASSWORD_FIELD,
    PHONE_FIELD,
    {
      key: "membership_id",
      label: "Booking / loyalty / membership ID",
      type: "text",
    },
    AUTH_METHOD,
    LOGIN_URL_FIELD,
    NOTES_FIELD,
  ],

  gov: [
    {
      key: "site_name",
      label: "Portal / site name",
      type: "text",
    },
    USERNAME_FIELD,
    EMAIL_FIELD,
    PASSWORD_FIELD,
    PHONE_FIELD,
    {
      key: "citizen_id_reference",
      label: "Citizen / application reference (avoid full sensitive ID)",
      type: "text",
      sensitive: true,
    },
    AUTH_METHOD,
    LOGIN_URL_FIELD,
    NOTES_FIELD,
  ],

  education: [
    EMAIL_FIELD,
    USERNAME_FIELD,
    PASSWORD_FIELD,
    PHONE_FIELD,
    {
      key: "student_id",
      label: "Student / candidate ID",
      type: "text",
      sensitive: true,
    },
    AUTH_METHOD,
    LOGIN_URL_FIELD,
    NOTES_FIELD,
  ],

  jobs: [
    EMAIL_FIELD,
    USERNAME_FIELD,
    PASSWORD_FIELD,
    PHONE_FIELD,
    {
      key: "profile_url",
      label: "Profile URL",
      type: "url",
    },
    AUTH_METHOD,
    LOGIN_URL_FIELD,
    NOTES_FIELD,
  ],

  productivity: [
    EMAIL_FIELD,
    USERNAME_FIELD,
    PASSWORD_FIELD,
    {
      key: "workspace",
      label: "Workspace / team",
      type: "text",
    },
    AUTH_METHOD,
    LOGIN_URL_FIELD,
    NOTES_FIELD,
  ],

  utilities: [
    EMAIL_FIELD,
    USERNAME_FIELD,
    PASSWORD_FIELD,
    PHONE_FIELD,
    {
      key: "customer_number",
      label: "Customer / consumer number",
      type: "text",
      sensitive: true,
    },
    AUTH_METHOD,
    LOGIN_URL_FIELD,
    NOTES_FIELD,
  ],

  healthcare: [
    EMAIL_FIELD,
    USERNAME_FIELD,
    PASSWORD_FIELD,
    PHONE_FIELD,
    {
      key: "patient_id",
      label: "Patient / member ID",
      type: "text",
      sensitive: true,
    },
    AUTH_METHOD,
    LOGIN_URL_FIELD,
    NOTES_FIELD,
  ],

  business: [
    EMAIL_FIELD,
    USERNAME_FIELD,
    PASSWORD_FIELD,
    {
      key: "account_id",
      label: "Merchant / account ID",
      type: "text",
      sensitive: true,
    },
    {
      key: "api_key",
      label: "API key (if applicable)",
      type: "password",
      sensitive: true,
    },
    TOTP_FIELD,
    AUTH_METHOD,
    LOGIN_URL_FIELD,
    NOTES_FIELD,
  ],

  personal: [
    EMAIL_FIELD,
    USERNAME_FIELD,
    PASSWORD_FIELD,
    PHONE_FIELD,
    AUTH_METHOD,
    LOGIN_URL_FIELD,
    NOTES_FIELD,
  ],
};

const platformGroups = {
  email: [
    ["gmail", "Gmail", "gmail", "#ea4335"],
    ["outlook", "Outlook / Hotmail", "microsoftoutlook", "#0078d4"],
    ["icloud", "Apple Account / iCloud", "icloud", "#3693f3"],
    ["yahoo", "Yahoo Mail", "yahoo", "#6001d2"],
    ["protonmail", "Proton Mail", "protonmail", "#6d4aff"],
    ["zoho_mail", "Zoho Mail", "zoho", "#e42527"],
    ["fastmail", "Fastmail", "fastmail", "#3983fa"],
    ["rediffmail", "Rediffmail", "rediff", "#d71920"],
    ["google_workspace", "Google Workspace", "google", "#4285f4"],
    ["microsoft_365", "Microsoft 365", "microsoft", "#d83b01"],
    ["slack", "Slack", "slack", "#611f69"],
    ["microsoft_teams", "Microsoft Teams", "microsoftteams", "#6264a7"],
    ["zoom", "Zoom", "zoom", "#2d8cff"],
    ["webex", "Cisco Webex", "webex", "#00a0d2"],
  ],

  identity: [
    ["apple_account", "Apple Account", "apple", "#111111"],
    ["google_account", "Google Account", "google", "#4285f4"],
    ["microsoft_account", "Microsoft Account", "microsoft", "#00a4ef"],
    ["samsung_account", "Samsung Account", "samsung", "#1428a0"],
    ["oneplus_account", "OnePlus Account", "oneplus", "#f5010c"],
    ["xiaomi_account", "Xiaomi Account", "xiaomi", "#ff6900"],
    ["bitwarden", "Bitwarden", "bitwarden", "#175ddc"],
    ["1password", "1Password", "1password", "#0572ec"],
    ["dashlane", "Dashlane", "dashlane", "#0e6bff"],
    ["proton_pass", "Proton Pass", "proton", "#6d4aff"],
  ],

  social: [
    ["instagram", "Instagram", "instagram", "#e4405f"],
    ["facebook", "Facebook", "facebook", "#1877f2"],
    ["twitter", "X (Twitter)", "x", "#000000"],
    ["threads", "Threads", "threads", "#000000"],
    ["snapchat", "Snapchat", "snapchat", "#fffc00"],
    ["pinterest", "Pinterest", "pinterest", "#bd081c"],
    ["reddit", "Reddit", "reddit", "#ff4500"],
    ["linkedin", "LinkedIn", "linkedin", "#0a66c2"],
    ["tiktok", "TikTok", "tiktok", "#000000"],
    ["discord", "Discord", "discord", "#5865f2"],
    ["whatsapp", "WhatsApp", "whatsapp", "#25d366"],
    ["telegram", "Telegram", "telegram", "#0088cc"],
    ["signal", "Signal", "signal", "#3a76f0"],
    ["tumblr", "Tumblr", "tumblr", "#36465d"],
    ["bluesky", "Bluesky", "bluesky", "#1185fe"],
    ["mastodon", "Mastodon", "mastodon", "#6364ff"],
    ["medium", "Medium", "medium", "#000000"],
    ["substack", "Substack", "substack", "#ff6719"],
    ["quora", "Quora", "quora", "#b92b27"],
    ["stackoverflow", "Stack Overflow", "stackoverflow", "#f48024"],
  ],

  banking: [
    ["bank", "Bank Account / Net Banking", null, "#10b981"],
    ["hdfc", "HDFC Bank", "hdfcbank", "#004c8f"],
    ["icici", "ICICI Bank", "icicibank", "#f58220"],
    ["sbi", "SBI", "statebankofindia", "#22409a"],
    ["axis", "Axis Bank", "axisbank", "#97144d"],
    ["kotak", "Kotak Mahindra Bank", "kotakmahindrabank", "#ed1c24"],
    ["idfc_first", "IDFC FIRST Bank", "idfcfirstbank", "#9d1d27"],
    ["yes_bank", "Yes Bank", "yesbank", "#00549e"],
    ["bob", "Bank of Baroda", "bankofbaroda", "#f15a22"],
    ["pnb", "Punjab National Bank", "punjabnationalbank", "#8b1d41"],
    ["canara", "Canara Bank", "canarabank", "#0066b3"],
    ["union_bank", "Union Bank of India", "unionbankofindia", "#ed1c24"],
    ["federal_bank", "Federal Bank", "federalbank", "#006747"],
    ["phonepe", "PhonePe", "phonepe", "#5f259f"],
    ["google_pay", "Google Pay", "googlepay", "#4285f4"],
    ["paytm", "Paytm", "paytm", "#00baf2"],
    ["bhim", "BHIM UPI", "bhim", "#0081c9"],
    ["cred", "CRED", "cred", "#111111"],
    ["zerodha", "Zerodha", "zerodha", "#387ed1"],
    ["groww", "Groww", "groww", "#00d09c"],
    ["angel_one", "Angel One", "angelone", "#6c2dc7"],
    ["upstox", "Upstox", "upstox", "#6f2da8"],
    ["dhan", "Dhan", "dhan", "#00a6a6"],
    ["mf_central", "MF Central", null, "#10b981"],
    ["cams", "CAMS", null, "#10b981"],
    ["kfintech", "KFintech", null, "#10b981"],
    ["policybazaar", "Policybazaar", "policybazaar", "#00baf2"],
    ["lic", "LIC", null, "#00a651"],
    ["cibil", "CIBIL", null, "#10b981"],
    ["nps", "NPS / CRA Portal", null, "#10b981"],
  ],

  cards: [
    ["card", "Payment Card", null, "#8b5cf6"],
  ],

  cloud: [
    ["aws", "AWS", "amazonwebservices", "#ff9900"],
    ["gcp", "Google Cloud", "googlecloud", "#4285f4"],
    ["azure", "Microsoft Azure", "microsoftazure", "#0078d4"],
    ["oci", "Oracle Cloud Infrastructure", "oracle", "#f80000"],
    ["ibm_cloud", "IBM Cloud", "ibmcloud", "#1261fe"],
    ["digitalocean", "DigitalOcean", "digitalocean", "#0080ff"],
    ["akamai_cloud", "Akamai Cloud / Linode", "akamai", "#0096d6"],
    ["vultr", "Vultr", "vultr", "#007bfc"],
    ["hetzner", "Hetzner Cloud", "hetzner", "#d50c2d"],
    ["vercel", "Vercel", "vercel", "#000000"],
    ["netlify", "Netlify", "netlify", "#00c7b7"],
    ["render", "Render", "render", "#46e3b7"],
    ["railway", "Railway", "railway", "#0b0d0e"],
    ["flyio", "Fly.io", "flydotio", "#7b3fe4"],
    ["heroku", "Heroku", "heroku", "#430098"],
    ["cloudflare", "Cloudflare", "cloudflare", "#f38020"],
    ["firebase", "Firebase", "firebase", "#ffca28"],
    ["amplify", "AWS Amplify", "awsamplify", "#ff9900"],
    ["godaddy", "GoDaddy", "godaddy", "#1bdbdb"],
    ["namecheap", "Namecheap", "namecheap", "#de3723"],
    ["hostinger", "Hostinger", "hostinger", "#673de6"],
    ["bluehost", "Bluehost", "bluehost", "#0060af"],
    ["cpanel", "cPanel / Hosting", "cpanel", "#ff6c2c"],
    ["squarespace", "Squarespace", "squarespace", "#000000"],
  ],

  dev: [
    ["github", "GitHub", "github", "#181717"],
    ["gitlab", "GitLab", "gitlab", "#fc6d26"],
    ["bitbucket", "Bitbucket", "bitbucket", "#0052cc"],
    ["azure_devops", "Azure DevOps", "azuredevops", "#0078d7"],
    ["dockerhub", "Docker Hub", "docker", "#2496ed"],
    ["npm", "npm", "npm", "#cb3837"],
    ["pypi", "PyPI", "pypi", "#3775a9"],
    ["postman", "Postman", "postman", "#ff6c37"],
    ["insomnia", "Insomnia", "insomnia", "#4000bf"],
    ["rapidapi", "RapidAPI", "rapidapi", "#0055da"],
    ["supabase", "Supabase", "supabase", "#3ecf8e"],
    ["neon", "Neon", "neon", "#00e599"],
    ["mongodb_atlas", "MongoDB Atlas", "mongodb", "#47a248"],
    ["planetscale", "PlanetScale", "planetscale", "#000000"],
    ["cockroachdb", "CockroachDB Cloud", "cockroachlabs", "#6933ff"],
    ["aiven", "Aiven", "aiven", "#ff4f00"],
    ["appwrite", "Appwrite", "appwrite", "#f02e65"],
    ["convex", "Convex", "convex", "#ee342f"],
    ["upstash", "Upstash", "upstash", "#00e9a3"],
    ["turso", "Turso", "turso", "#4ff8d2"],
    ["clerk", "Clerk", "clerk", "#6c47ff"],
    ["auth0", "Auth0", "auth0", "#eb5424"],
    ["sentry", "Sentry", "sentry", "#362d59"],
    ["datadog", "Datadog", "datadog", "#632ca6"],
    ["grafana_cloud", "Grafana Cloud", "grafana", "#f46800"],
    ["new_relic", "New Relic", "newrelic", "#1ce783"],
    ["posthog", "PostHog", "posthog", "#f9bd2b"],
    ["mixpanel", "Mixpanel", "mixpanel", "#7856ff"],
    ["circleci", "CircleCI", "circleci", "#343434"],
    ["terraform_cloud", "Terraform Cloud", "terraform", "#7b42bc"],
    ["pulumi", "Pulumi", "pulumi", "#8a3391"],
    ["sonarcloud", "SonarCloud", "sonarqube", "#4e9bcd"],
    ["replit", "Replit", "replit", "#f26207"],
    ["codesandbox", "CodeSandbox", "codesandbox", "#151515"],
    ["codepen", "CodePen", "codepen", "#000000"],
    ["leetcode", "LeetCode", "leetcode", "#ffa116"],
    ["hackerrank", "HackerRank", "hackerrank", "#00ea64"],
    ["codechef", "CodeChef", "codechef", "#5b4638"],
    ["vercel_dev", "Vercel Project", "vercel", "#000000"],
    ["netlify_dev", "Netlify Project", "netlify", "#00c7b7"],
  ],

  ai: [
    ["openai", "OpenAI Platform", "openai", "#412991"],
    ["chatgpt", "ChatGPT", "openai", "#10a37f"],
    ["anthropic", "Anthropic Console / Claude", "anthropic", "#d97757"],
    ["google_ai_studio", "Google AI Studio", "google", "#4285f4"],
    ["huggingface", "Hugging Face", "huggingface", "#ffd21e"],
    ["groq", "GroqCloud", "groq", "#f55036"],
    ["nvidia", "NVIDIA Developer / NIM", "nvidia", "#76b900"],
    ["replicate", "Replicate", "replicate", "#000000"],
    ["together_ai", "Together AI", "together", "#000000"],
    ["cohere", "Cohere", "cohere", "#39594d"],
    ["mistral", "Mistral AI", "mistral", "#f7d046"],
    ["perplexity", "Perplexity", "perplexity", "#20808d"],
    ["elevenlabs", "ElevenLabs", "elevenlabs", "#000000"],
    ["midjourney", "Midjourney", null, "#000000"],
    ["langsmith", "LangSmith", null, "#1c3c3c"],
    ["weights_biases", "Weights & Biases", "weightsandbiases", "#ffbe00"],
  ],

  streaming: [
    ["netflix", "Netflix", "netflix", "#e50914"],
    ["primevideo", "Prime Video", "primevideo", "#00a8e1"],
    ["hotstar", "JioHotstar", "hotstar", "#0f79af"],
    ["zee5", "ZEE5", "zee5", "#8230c6"],
    ["sonyliv", "SonyLIV", null, "#6b2d91"],
    ["appletv", "Apple TV+", "appletv", "#000000"],
    ["spotify", "Spotify", "spotify", "#1db954"],
    ["apple_music", "Apple Music", " applemusic", "#fa243c"],
    ["youtube", "YouTube / YouTube Premium", "youtube", "#ff0000"],
    ["jiosaavn", "JioSaavn", "jiosaavn", "#2bc5b4"],
    ["audible", "Audible", "audible", "#f7991c"],
    ["twitch", "Twitch", "twitch", "#9146ff"],
    ["steam", "Steam", "steam", "#171a21"],
    ["epic_games", "Epic Games", "epicgames", "#313131"],
    ["riot", "Riot Games", "riotgames", "#d32936"],
    ["ea", "EA Account", "ea", "#ff4747"],
    ["ubisoft", "Ubisoft Connect", "ubisoft", "#000000"],
    ["playstation", "PlayStation Network", "playstation", "#003791"],
    ["xbox", "Xbox / Microsoft Gaming", "xbox", "#107c10"],
    ["roblox", "Roblox", "roblox", "#000000"],
    ["kindle", "Kindle / Amazon Reading", "amazonkindle", "#ff9900"],
    ["goodreads", "Goodreads", "goodreads", "#553b08"],
    ["webtoon", "WEBTOON", "webtoon", "#00d564"],
    ["storytel", "Storytel", null, "#6c4cf1"],
  ],

  shopping: [
    ["amazon", "Amazon", "amazon", "#ff9900"],
    ["flipkart", "Flipkart", "flipkart", "#2874f0"],
    ["myntra", "Myntra", "myntra", "#ff3f6c"],
    ["meesho", "Meesho", null, "#570d8b"],
    ["ajio", "AJIO", null, "#2c2c2c"],
    ["tatacliq", "Tata CLiQ", null, "#651fff"],
    ["snapdeal", "Snapdeal", "snapdeal", "#e40046"],
    ["jiomart", "JioMart", null, "#0078ad"],
    ["bigbasket", "BigBasket", null, "#84c225"],
    ["nykaa", "Nykaa", "nykaa", "#fc2779"],
    ["ikea", "IKEA", "ikea", "#0051ba"],
    ["decathlon", "Decathlon", "decathlon", "#0082c3"],
    ["swiggy", "Swiggy", "swiggy", "#fc8019"],
    ["zomato", "Zomato", "zomato", "#e23744"],
    ["blinkit", "Blinkit", null, "#f8d000"],
    ["zepto", "Zepto", null, "#6d28d9"],
    ["dominos", "Domino's", "dominos", "#0078ae"],
    ["mcdonalds", "McDonald's", "mcdonalds", "#da291c"],
  ],

  travel: [
    ["irctc", "IRCTC", null, "#0e4d92"],
    ["makemytrip", "MakeMyTrip", null, "#e83e8c"],
    ["easemytrip", "EaseMyTrip", null, "#0075c9"],
    ["cleartrip", "Cleartrip", null, "#e95d25"],
    ["yatra", "Yatra", null, "#e31e24"],
    ["indigo", "IndiGo", null, "#0033a0"],
    ["airindia", "Air India", null, "#c8102e"],
    ["akasa", "Akasa Air", null, "#6a1b9a"],
    ["booking", "Booking.com", "bookingdotcom", "#003b95"],
    ["agoda", "Agoda", "agoda", "#e41b4b"],
    ["airbnb", "Airbnb", "airbnb", "#ff5a5f"],
    ["oyo", "OYO", null, "#ee2e24"],
    ["redbus", "redBus", null, "#d71f28"],
    ["uber", "Uber", "uber", "#000000"],
    ["ola", "Ola", null, "#00b386"],
    ["rapido", "Rapido", null, "#ffca28"],
    ["expedia", "Expedia", "expedia", "#00355f"],
    ["skyscanner", "Skyscanner", "skyscanner", "#0770e3"],
    ["passport_seva", "Passport Seva", null, "#0e4d92"],
    ["vfs_global", "VFS Global", null, "#0e4d92"],
  ],

  gov: [
    ["govt", "Government Portal (Generic)", null, "#64748b"],
    ["digilocker", "DigiLocker", null, "#1a73e8"],
    ["uidai", "UIDAI / myAadhaar", null, "#ff9933"],
    ["pan_protean", "PAN / Protean", null, "#1b5e20"],
    ["utiitsl", "PAN / UTIITSL", null, "#1b5e20"],
    ["voter_portal", "Voter Services Portal", null, "#138808"],
    ["income_tax", "Income Tax e-Filing", null, "#138808"],
    ["gst_portal", "GST Portal", null, "#138808"],
    ["traces", "TRACES", null, "#138808"],
    ["epfo", "EPFO / UAN", null, "#138808"],
    ["esic", "ESIC", null, "#138808"],
    ["umang", "UMANG", null, "#138808"],
    ["parivahan", "Parivahan / Sarathi", null, "#138808"],
    ["vahan", "VAHAN", null, "#138808"],
    ["delhi_edistrict", "Delhi e-District", null, "#0e4d92"],
    ["mcd", "MCD Property Tax", null, "#0e4d92"],
    ["delhi_jal_board", "Delhi Jal Board", null, "#0e4d92"],
    ["delhi_challan", "Delhi Traffic Police e-Challan", null, "#0e4d92"],
    ["cpgrams", "CPGRAMS", null, "#138808"],
    ["rti_online", "RTI Online", null, "#138808"],
    ["consumer_helpline", "National Consumer Helpline", null, "#138808"],
    ["ecourts", "eCourts", null, "#138808"],
    ["mygov", "MyGov", null, "#138808"],
    ["serviceplus", "ServicePlus", null, "#138808"],
    ["abha", "ABHA / ABDM", null, "#138808"],
    ["pmjay", "PM-JAY", null, "#138808"],
    ["pm_kisan", "PM-KISAN", null, "#138808"],
    ["nsp", "National Scholarship Portal", null, "#138808"],
    ["mca", "MCA", null, "#138808"],
    ["udyam", "Udyam Registration", null, "#138808"],
    ["dgft", "DGFT", null, "#138808"],
  ],

  education: [
    ["coursera", "Coursera", "coursera", "#0056d2"],
    ["udemy", "Udemy", "udemy", "#a435f0"],
    ["edx", "edX", "edx", "#02262b"],
    ["udacity", "Udacity", "udacity", "#02b3e4"],
    ["pluralsight", "Pluralsight", "pluralsight", "#f15b2a"],
    ["datacamp", "DataCamp", "datacamp", "#03ef62"],
    ["freecodecamp", "freeCodeCamp", "freecodecamp", "#0a0a23"],
    ["aws_skill_builder", "AWS Skill Builder", "amazonwebservices", "#ff9900"],
    ["microsoft_learn", "Microsoft Learn", "microsoft", "#00a4ef"],
    ["oracle_mylearn", "Oracle MyLearn", "oracle", "#f80000"],
    ["swayam", "SWAYAM", null, "#0d9488"],
    ["nptel", "NPTEL", null, "#0d9488"],
    ["nta", "NTA Exam Portal", null, "#0d9488"],
    ["gate", "GATE Portal", null, "#0d9488"],
    ["cat", "CAT Portal", null, "#0d9488"],
    ["university_erp", "University / Student ERP", null, "#0d9488"],
    ["placement_portal", "College Placement Portal", null, "#0d9488"],
  ],

  jobs: [
    ["naukri", "Naukri.com", null, "#2563eb"],
    ["foundit", "Foundit", null, "#2563eb"],
    ["internshala", "Internshala", null, "#2563eb"],
    ["wellfound", "Wellfound", "wellfound", "#2563eb"],
    ["cutshort", "Cutshort", null, "#2563eb"],
    ["apna", "Apna", null, "#2563eb"],
    ["indeed", "Indeed", "indeed", "#2164f3"],
    ["glassdoor", "Glassdoor", "glassdoor", "#0caa41"],
    ["upwork", "Upwork", "upwork", "#14a800"],
    ["fiverr", "Fiverr", "fiverr", "#1dbf73"],
    ["freelancer", "Freelancer.com", "freelancer", "#29b2fe"],
    ["toptal", "Toptal", "toptal", "#3863a0"],
  ],

  productivity: [
    ["notion", "Notion", "notion", "#000000"],
    ["evernote", "Evernote", "evernote", "#00a82d"],
    ["todoist", "Todoist", "todoist", "#e44332"],
    ["trello", "Trello", "trello", "#0052cc"],
    ["asana", "Asana", "asana", "#f06a6a"],
    ["clickup", "ClickUp", "clickup", "#7b68ee"],
    ["monday", "Monday.com", "monday", "#6161ff"],
    ["jira", "Jira", "jira", "#0052cc"],
    ["confluence", "Confluence", "confluence", "#172b4d"],
    ["linear", "Linear", "linear", "#5e6ad2"],
    ["airtable", "Airtable", "airtable", "#18bfff"],
    ["dropbox", "Dropbox", "dropbox", "#0061ff"],
    ["box", "Box", "box", "#0061d5"],
    ["figma", "Figma", "figma", "#f24e1e"],
    ["canva", "Canva", "canva", "#00c4cc"],
    ["adobe", "Adobe Creative Cloud", "adobe", "#ff0000"],
    ["framer", "Framer", "framer", "#0055ff"],
    ["webflow", "Webflow", "webflow", "#4353ff"],
    ["miro", "Miro", "miro", "#ffd02f"],
    ["docusign", "DocuSign", "docusign", "#ffcc00"],
  ],

  utilities: [
    ["airtel", "Airtel Thanks", null, "#e40000"],
    ["myjio", "MyJio", null, "#0a2885"],
    ["vi", "Vi App", null, "#ee2737"],
    ["bsnl", "BSNL Selfcare", null, "#f58220"],
    ["jiofiber", "JioFiber / AirFiber", null, "#0a2885"],
    ["act_fibernet", "ACT Fibernet", null, "#e31837"],
    ["bses", "BSES Electricity", null, "#0e4d92"],
    ["tatapower_ddl", "Tata Power-DDL", null, "#0e4d92"],
    ["igl", "Indraprastha Gas (IGL)", null, "#0e4d92"],
    ["indane", "Indane LPG", null, "#e31e24"],
    ["bharatgas", "Bharatgas", null, "#00529b"],
    ["hpgas", "HP Gas", null, "#ed1c24"],
    ["tataplay", "Tata Play", null, "#6c2eb9"],
    ["fastag", "FASTag Issuer Portal", null, "#0891b2"],
  ],

  healthcare: [
    ["apollo247", "Apollo 24|7", null, "#e11d48"],
    ["tata1mg", "Tata 1mg", null, "#e11d48"],
    ["pharmeasy", "PharmEasy", null, "#e11d48"],
    ["netmeds", "Netmeds", null, "#e11d48"],
    ["practo", "Practo", null, "#e11d48"],
    ["medibuddy", "MediBuddy", null, "#e11d48"],
    ["healthians", "Healthians", null, "#e11d48"],
    ["redcliffe", "Redcliffe Labs", null, "#e11d48"],
    ["hospital_portal", "Hospital Patient Portal", null, "#e11d48"],
    ["insurance_tpa", "Health Insurance / TPA Portal", null, "#e11d48"],
    ["esanjeevani", "eSanjeevani", null, "#e11d48"],
  ],

  business: [
    ["razorpay", "Razorpay", "razorpay", "#0c2451"],
    ["cashfree", "Cashfree", null, "#475569"],
    ["paypal", "PayPal", "paypal", "#003087"],
    ["stripe", "Stripe", "stripe", "#635bff"],
    ["wise", "Wise", "wise", "#9fe870"],
    ["payoneer", "Payoneer", "payoneer", "#ff4800"],
    ["shopify", "Shopify", "shopify", "#7ab55c"],
    ["wordpress", "WordPress", "wordpress", "#21759b"],
    ["wix", "Wix", "wix", "#0c6efc"],
    ["zoho_crm", "Zoho CRM", "zoho", "#e42527"],
    ["hubspot", "HubSpot", "hubspot", "#ff7a59"],
    ["salesforce", "Salesforce", "salesforce", "#00a1e0"],
    ["google_ads", "Google Ads", "googleads", "#4285f4"],
    ["meta_business", "Meta Business Suite", "meta", "#0866ff"],
    ["google_analytics", "Google Analytics", "googleanalytics", "#e37400"],
    ["search_console", "Google Search Console", "google", "#4285f4"],
    ["adsense", "Google AdSense", "googleadsense", "#4285f4"],
    ["mca_business", "MCA / Company Compliance", null, "#475569"],
  ],

  personal: [
    ["google_home", "Google Home", "googlehome", "#4285f4"],
    ["alexa", "Amazon Alexa", "alexa", "#00a8e1"],
    ["smartthings", "SmartThings", "smartthings", "#1428a0"],
    ["strava", "Strava", "strava", "#fc4c02"],
    ["fitbit", "Fitbit", "fitbit", "#00b0b9"],
    ["garmin", "Garmin Connect", "garmin", "#007cc3"],
    ["nike_run_club", "Nike Run Club", "nike", "#111111"],
    ["bookmyshow", "BookMyShow", null, "#c4242b"],
    ["district", "District", null, "#111111"],
    ["protonvpn", "Proton VPN", "protonvpn", "#6d4aff"],
    ["nordvpn", "NordVPN", "nordvpn", "#4687ff"],
    ["expressvpn", "ExpressVPN", "expressvpn", "#da3940"],
    ["tailscale", "Tailscale", "tailscale", "#242424"],
    ["vpn_generic", "VPN Account", null, "#78716c"],
  ],
};

const TEMPLATES = {};

for (const [category, entries] of Object.entries(platformGroups)) {
  for (const [key, label, logo, color] of entries) {
    TEMPLATES[key] = {
      label,
      category,
      icon: CATEGORIES[category]?.icon ?? "KeyRound",
      ...(logo ? { logo: logo.trim() } : {}),
      color: color ?? CATEGORIES[category]?.color ?? "#64748b",
      fields: [...(baseFields[category] ?? baseFields.personal)],
    };
  }
}

// Keep an explicit generic template available for any government portal.
TEMPLATES.govt = {
  label: "Government Portal (Generic)",
  category: "gov",
  icon: "Landmark",
  color: "#64748b",
  fields: [...baseFields.gov],
};

TEMPLATES.custom = {
  label: "Custom",
  category: "custom",
  icon: "FileKey",
  color: "#64748b",
  fields: [],
};

export { TEMPLATES };

export const FIELD_TYPES = [
  { value: "text", label: "Text" },
  { value: "password", label: "Password" },
  { value: "pin", label: "PIN (use cautiously)" },
  { value: "email", label: "Email" },
  { value: "url", label: "URL" },
  { value: "number", label: "Number" },
  { value: "totp", label: "TOTP secret" },
  { value: "date", label: "Date" },
  { value: "textarea", label: "Long text" },
];

/** Helper to get category metadata. */
export function getCategory(templateKey) {
  const template = TEMPLATES[templateKey];

  if (!template) {
    return CATEGORIES.custom;
  }

  return CATEGORIES[template.category] ?? CATEGORIES.custom;
}

/** Group templates by category for the picker. */
export function templatesByCategory() {
  const groups = {};

  for (const [key, template] of Object.entries(TEMPLATES)) {
    if (key === "custom") continue;

    if (!groups[template.category]) {
      groups[template.category] = [];
    }

    groups[template.category].push({
      key,
      ...template,
    });
  }

  return groups;
}