import admin from 'firebase-admin'
// var serviceAccount = require("./serviceAccountKey.json");
import serviceAccount from "./serviceAccountKey.js"

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://androidapp-e102c.firebaseio.com"
});

export default admin