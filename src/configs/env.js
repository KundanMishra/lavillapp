module.exports = {
  port: 3600,
  // "appEndpoint": "http://auratechnologies.in/projects/lavilla-test-web/",
  // "appEndpoint": "https://lavillahospitality.com/",

  apiEndpoint: "https://api.lavillahospitality.com/",

  //running in server
  db_username: "root",
  db_password: "",
  db_name: "lavilladb",

  // "apiEndpoint": "https://192.168.0.200:3000/",

  // running in localhost ssl

  // "db_username": "root",
  // "db_password": "",
  // "db_name": "lavilladb",

  jwt_secret: "aura!!secret",
  jwt_expiration_in_seconds: 2592000,
  environment: "dev",
  permissionLevels: {
    NORMAL_USER: 1,
    ADMIN: 2048,
    SUPER_ADMIN: 2048,
  },
  // "db_name":"defaultdb",
  // "db_username":"lavillah_user",
  // "db_password":"LavillaUser@321",
  // "db_host":"lavillahospitality.com",

  // "db_host":"localhost",

  // "db_username": "lavilla",
  // "db_password": "kubm2vrwzythrt5h",
  db_host: "localhost",
  db_dialect: "mysql",
  // "emailHost": "smtp.gmail.com",
  // "emailUser": "lavillahospitality@gmail.com",
  // "emailPassword": "Villala@23095",
  // "emailHost": "mail.lavillahospitality.com",
  emailHost: "box2098.bluehost.com",
  emailUser: "no-reply@lavillahospitality.com",
  emailPassword: "no-reply@123",
  SENDGRID_API_KEY:
    "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",
  payment: {
    url: " https://qpayi.com:9100/api/gateway/v1.0",
    mode: "TEST",
    gatewayId: "013153483",
    secretKey: "2-Yc+yMi16ALljt/",
    email: "info@lavillahospitality.com",
    country: "QA",
    city: "Doha",
    currency: "QAR",
  },
};
